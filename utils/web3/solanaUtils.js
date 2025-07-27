import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

// Advanced Solana utilities for Web3 operations
export class SolanaUtils {
  constructor(network = WalletAdapterNetwork.Devnet) {
    this.network = network;
    this.connection = this.getConnection();
  }

  // Get connection based on network
  getConnection() {
    const endpoint = this.getClusterUrl();
    return new Connection(endpoint, 'confirmed');
  }

  // Get cluster URL based on network
  getClusterUrl() {
    switch (this.network) {
      case WalletAdapterNetwork.Mainnet:
        return process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://api.mainnet-beta.solana.com';
      case WalletAdapterNetwork.Testnet:
        return process.env.NEXT_PUBLIC_TESTNET_RPC_URL || 'https://api.testnet.solana.com';
      default:
        return process.env.NEXT_PUBLIC_DEVNET_RPC_URL || 'https://api.devnet.solana.com';
    }
  }

  // Airdrop SOL (devnet only)
  async airdropSOL(publicKey, amount = 1) {
    if (this.network !== WalletAdapterNetwork.Devnet) {
      throw new Error('Airdrop only available on devnet');
    }

    try {
      const lamports = amount * LAMPORTS_PER_SOL;
      const signature = await this.connection.requestAirdrop(publicKey, lamports);
      await this.connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      throw new Error(`Airdrop failed: ${error.message}`);
    }
  }

  // Get account balance
  async getBalance(publicKey) {
    const balance = await this.connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  }

  // Get token balance
  async getTokenBalance(walletPublicKey, tokenMintAddress) {
    try {
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        walletPublicKey,
        { mint: tokenMintAddress }
      );

      if (tokenAccounts.value.length === 0) {
        return 0;
      }

      const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      return balance || 0;
    } catch (error) {
      console.error('Error getting token balance:', error);
      return 0;
    }
  }

  // Create a new token mint
  async createTokenMint(payer, mintAuthority, freezeAuthority = null, decimals = 9) {
    try {
      const mint = await createMint(
        this.connection,
        payer,
        mintAuthority,
        freezeAuthority,
        decimals
      );
      return mint;
    } catch (error) {
      throw new Error(`Failed to create token mint: ${error.message}`);
    }
  }

  // Mint tokens to an account
  async mintTokensToAccount(mint, destination, authority, amount) {
    try {
      const signature = await mintTo(
        this.connection,
        authority,
        mint,
        destination,
        authority,
        amount
      );
      return signature;
    } catch (error) {
      throw new Error(`Failed to mint tokens: ${error.message}`);
    }
  }

  // Transfer SOL
  async transferSOL(fromKeypair, toPublicKey, amount) {
    try {
      const lamports = amount * LAMPORTS_PER_SOL;
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey: toPublicKey,
          lamports,
        })
      );

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [fromKeypair]
      );
      return signature;
    } catch (error) {
      throw new Error(`SOL transfer failed: ${error.message}`);
    }
  }

  // Transfer tokens
  async transferTokens(fromKeypair, mint, toPublicKey, amount) {
    try {
      const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        fromKeypair,
        mint,
        fromKeypair.publicKey
      );

      const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        fromKeypair,
        mint,
        toPublicKey
      );

      const signature = await transfer(
        this.connection,
        fromKeypair,
        fromTokenAccount.address,
        toTokenAccount.address,
        fromKeypair.publicKey,
        amount
      );

      return signature;
    } catch (error) {
      throw new Error(`Token transfer failed: ${error.message}`);
    }
  }

  // Get transaction history
  async getTransactionHistory(publicKey, limit = 10) {
    try {
      const signatures = await this.connection.getSignaturesForAddress(
        publicKey,
        { limit }
      );

      const transactions = [];
      for (const sig of signatures) {
        try {
          const tx = await this.connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          });
          if (tx) {
            transactions.push({
              signature: sig.signature,
              blockTime: sig.blockTime,
              slot: sig.slot,
              err: sig.err,
              fee: tx.meta?.fee,
              preBalances: tx.meta?.preBalances,
              postBalances: tx.meta?.postBalances,
            });
          }
        } catch (error) {
          console.error(`Error fetching transaction ${sig.signature}:`, error);
        }
      }

      return transactions;
    } catch (error) {
      throw new Error(`Failed to get transaction history: ${error.message}`);
    }
  }

  // Estimate transaction fee
  async estimateTransactionFee(transaction) {
    try {
      const fee = await transaction.getEstimatedFee(this.connection);
      return fee / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Fee estimation failed:', error);
      return 0.001; // Default estimate
    }
  }

  // Get account info
  async getAccountInfo(publicKey) {
    try {
      const accountInfo = await this.connection.getAccountInfo(publicKey);
      if (!accountInfo) {
        return null;
      }

      return {
        lamports: accountInfo.lamports,
        owner: accountInfo.owner.toString(),
        executable: accountInfo.executable,
        rentEpoch: accountInfo.rentEpoch,
        dataLength: accountInfo.data.length,
      };
    } catch (error) {
      throw new Error(`Failed to get account info: ${error.message}`);
    }
  }

  // Check if account exists
  async accountExists(publicKey) {
    try {
      const accountInfo = await this.connection.getAccountInfo(publicKey);
      return accountInfo !== null;
    } catch (error) {
      return false;
    }
  }

  // Get recent blockhash
  async getRecentBlockhash() {
    const { blockhash } = await this.connection.getLatestBlockhash();
    return blockhash;
  }

  // Confirm transaction
  async confirmTransaction(signature, commitment = 'confirmed') {
    try {
      const confirmation = await this.connection.confirmTransaction(signature, commitment);
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }
      return confirmation;
    } catch (error) {
      throw new Error(`Transaction confirmation failed: ${error.message}`);
    }
  }

  // Simulate transaction
  async simulateTransaction(transaction) {
    try {
      const simulation = await this.connection.simulateTransaction(transaction);
      return {
        success: simulation.value.err === null,
        error: simulation.value.err,
        logs: simulation.value.logs,
        unitsConsumed: simulation.value.unitsConsumed,
      };
    } catch (error) {
      throw new Error(`Transaction simulation failed: ${error.message}`);
    }
  }

  // Get slot
  async getCurrentSlot() {
    return await this.connection.getSlot();
  }

  // Get block height
  async getBlockHeight() {
    return await this.connection.getBlockHeight();
  }

  // Get network stats
  async getNetworkStats() {
    try {
      const [slot, blockHeight, version, epochInfo] = await Promise.all([
        this.connection.getSlot(),
        this.connection.getBlockHeight(),
        this.connection.getVersion(),
        this.connection.getEpochInfo(),
      ]);

      return {
        slot,
        blockHeight,
        version: version['solana-core'],
        epoch: epochInfo.epoch,
        slotIndex: epochInfo.slotIndex,
        slotsInEpoch: epochInfo.slotsInEpoch,
        network: this.network,
      };
    } catch (error) {
      throw new Error(`Failed to get network stats: ${error.message}`);
    }
  }
}

// Utility functions
export const createKeypair = () => Keypair.generate();

export const validatePublicKey = (address) => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

export const shortenAddress = (address, chars = 4) => {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const lamportsToSOL = (lamports) => lamports / LAMPORTS_PER_SOL;

export const solToLamports = (sol) => Math.floor(sol * LAMPORTS_PER_SOL);

// Export default instance
export const solanaUtils = new SolanaUtils();

export default SolanaUtils;
