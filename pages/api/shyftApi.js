import { 
  Transaction, 
  PublicKey, 
  Connection, 
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Keypair
} from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

const SHYFT_API_KEY = process.env.NEXT_PUBLIC_SHYFT_API_KEY;
const SHYFT_BASE_URL = 'https://api.shyft.to';

// Original transaction confirmation function
export async function confirmTransactionFromFrontend(
  connection,
  encodedTransaction,
  wallet
) {
  const recoveredTransaction = Transaction.from(
    Buffer.from(encodedTransaction, "base64")
  );
  const signedTx = await wallet.signTransaction(recoveredTransaction);
  const confirmTransaction = await connection.sendRawTransaction(
    signedTx.serialize({ requireAllSignatures: false })
  );
  return confirmTransaction;
}

// Original transaction signing function
export async function signTransactionFromFrontend(encodedTransaction, signer) {
  const recoveredTransaction = Transaction.from(
    Buffer.from(encodedTransaction, "base64")
  );
  recoveredTransaction.partialSign(...signer);
  const serializedTransaction = recoveredTransaction.serialize({
    requireAllSignatures: false,
  });
  const transactionBase64 = serializedTransaction.toString("base64");
  return transactionBase64;
}

// Enhanced Shyft API integration
export class ShyftAPI {
  constructor(apiKey = SHYFT_API_KEY) {
    this.apiKey = apiKey;
    this.baseURL = SHYFT_BASE_URL;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`Shyft API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Shyft API request failed:', error);
      throw error;
    }
  }

  // Get wallet balance
  async getBalance(walletAddress, network = 'devnet') {
    const endpoint = `/sol/v1/wallet/balance?network=${network}&wallet=${walletAddress}`;
    return await this.makeRequest(endpoint);
  }

  // Get transaction history
  async getTransactionHistory(walletAddress, network = 'devnet', options = {}) {
    const params = new URLSearchParams({
      network,
      wallet: walletAddress,
      tx_num: options.limit || 10,
      ...options,
    });
    
    const endpoint = `/sol/v1/wallet/transaction_history?${params}`;
    return await this.makeRequest(endpoint);
  }

  // Send SOL
  async sendSOL(fromAddress, toAddress, amount, network = 'devnet') {
    const endpoint = '/sol/v1/wallet/send_sol';
    const body = {
      network,
      from_address: fromAddress,
      to_address: toAddress,
      amount,
    };

    return await this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Get NFTs owned by wallet
  async getNFTs(walletAddress, network = 'devnet') {
    const endpoint = `/sol/v1/wallet/get_nfts?network=${network}&wallet=${walletAddress}`;
    return await this.makeRequest(endpoint);
  }

  // Create NFT
  async createNFT(data, network = 'devnet') {
    const endpoint = '/sol/v1/nft/create';
    const body = {
      network,
      ...data,
    };

    return await this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Get token balance
  async getTokenBalance(walletAddress, tokenAddress, network = 'devnet') {
    const endpoint = `/sol/v1/wallet/token_balance?network=${network}&wallet=${walletAddress}&token=${tokenAddress}`;
    return await this.makeRequest(endpoint);
  }

  // Transfer tokens
  async transferTokens(fromAddress, toAddress, tokenAddress, amount, network = 'devnet') {
    const endpoint = '/sol/v1/wallet/send_token';
    const body = {
      network,
      from_address: fromAddress,
      to_address: toAddress,
      token_address: tokenAddress,
      amount,
    };

    return await this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}

// Utility functions for transaction handling
export const TransactionUtils = {
  // Create a simple SOL transfer transaction
  async createSOLTransfer(fromPubkey, toPubkey, lamports, connection) {
    const transaction = new Transaction();
    const instruction = SystemProgram.transfer({
      fromPubkey: new PublicKey(fromPubkey),
      toPubkey: new PublicKey(toPubkey),
      lamports,
    });
    
    transaction.add(instruction);
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = new PublicKey(fromPubkey);
    
    return transaction;
  },

  // Serialize transaction for transmission
  serializeTransaction(transaction) {
    return transaction.serialize({ requireAllSignatures: false }).toString('base64');
  },

  // Deserialize transaction from base64
  deserializeTransaction(serializedTx) {
    return Transaction.from(Buffer.from(serializedTx, 'base64'));
  },

  // Estimate transaction fee
  async estimateFee(transaction, connection) {
    try {
      const fee = await transaction.getEstimatedFee(connection);
      return fee / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Fee estimation failed:', error);
      return 0.001; // Default fee estimate
    }
  },

  // Wait for transaction confirmation
  async waitForConfirmation(signature, connection, commitment = 'confirmed') {
    const result = await connection.confirmTransaction(signature, commitment);
    if (result.value.err) {
      throw new Error(`Transaction failed: ${result.value.err}`);
    }
    return result;
  },

  // Check if transaction is confirmed
  async isTransactionConfirmed(signature, connection) {
    try {
      const status = await connection.getSignatureStatus(signature);
      return status.value?.confirmationStatus === 'confirmed' || 
             status.value?.confirmationStatus === 'finalized';
    } catch (error) {
      return false;
    }
  },
};

// Connection utilities
export const ConnectionUtils = {
  // Get connection based on network
  getConnection(network = 'devnet') {
    const clusterUrl = network === 'mainnet-beta' 
      ? clusterApiUrl(WalletAdapterNetwork.Mainnet)
      : clusterApiUrl(WalletAdapterNetwork.Devnet);
    
    return new Connection(clusterUrl, 'confirmed');
  },

  // Check connection health
  async checkConnection(connection) {
    try {
      const version = await connection.getVersion();
      const blockHeight = await connection.getBlockHeight();
      return {
        healthy: true,
        version: version['solana-core'],
        blockHeight,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
      };
    }
  },
};

// Wallet utilities
export const WalletUtils = {
  // Generate a new keypair
  generateKeypair() {
    return Keypair.generate();
  },

  // Validate wallet address
  isValidAddress(address) {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  },

  // Get wallet info
  async getWalletInfo(address, connection) {
    try {
      const pubkey = new PublicKey(address);
      const balance = await connection.getBalance(pubkey);
      const accountInfo = await connection.getAccountInfo(pubkey);
      
      return {
        address,
        balance: balance / LAMPORTS_PER_SOL,
        exists: accountInfo !== null,
        executable: accountInfo?.executable || false,
        owner: accountInfo?.owner?.toString(),
      };
    } catch (error) {
      throw new Error(`Failed to get wallet info: ${error.message}`);
    }
  },
};

// Export default Shyft instance
export const shyftAPI = new ShyftAPI();

export default {
  confirmTransactionFromFrontend,
  signTransactionFromFrontend,
  ShyftAPI,
  TransactionUtils,
  ConnectionUtils,
  WalletUtils,
  shyftAPI,
};
