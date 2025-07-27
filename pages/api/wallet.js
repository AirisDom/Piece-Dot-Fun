// Next.js API route for wallet operations
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await getWalletInfo(req, res);
      case 'POST':
        return await handleWalletOperation(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Wallet API error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Get wallet information
async function getWalletInfo(req, res) {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  try {
    // Validate address format
    let publicKey;
    try {
      publicKey = new PublicKey(address);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    const connection = new Connection(RPC_URL, 'confirmed');

    // Get balance
    const balance = await connection.getBalance(publicKey);
    const balanceSOL = balance / LAMPORTS_PER_SOL;

    // Get account info
    const accountInfo = await connection.getAccountInfo(publicKey);

    // Get transaction count (recent transactions)
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 1 });
    const transactionCount = signatures.length;

    // Check if account exists and is active
    const isActive = accountInfo !== null;

    return res.status(200).json({
      success: true,
      data: {
        address: address,
        balance: balanceSOL,
        balanceLamports: balance,
        exists: isActive,
        executable: accountInfo?.executable || false,
        owner: accountInfo?.owner?.toString(),
        rentEpoch: accountInfo?.rentEpoch,
        dataLength: accountInfo?.data?.length || 0,
        transactionCount,
        network: SOLANA_NETWORK,
      },
    });
  } catch (error) {
    console.error('Error getting wallet info:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve wallet information',
    });
  }
}

// Handle wallet operations
async function handleWalletOperation(req, res) {
  const { operation, ...data } = req.body;

  switch (operation) {
    case 'validate':
      return await validateWallet(req, res, data);
    case 'get-transaction-history':
      return await getTransactionHistory(req, res, data);
    case 'estimate-fee':
      return await estimateTransactionFee(req, res, data);
    case 'check-token-balance':
      return await getTokenBalance(req, res, data);
    default:
      return res.status(400).json({ error: 'Invalid operation' });
  }
}

// Validate wallet address
async function validateWallet(req, res, { address }) {
  if (!address) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  try {
    const publicKey = new PublicKey(address);
    const connection = new Connection(RPC_URL, 'confirmed');
    
    // Check if account exists
    const accountInfo = await connection.getAccountInfo(publicKey);
    
    return res.status(200).json({
      success: true,
      data: {
        valid: true,
        exists: accountInfo !== null,
        address: address,
      },
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      data: {
        valid: false,
        exists: false,
        address: address,
        error: 'Invalid address format',
      },
    });
  }
}

// Get transaction history
async function getTransactionHistory(req, res, { address, limit = 10, before }) {
  if (!address) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  try {
    const publicKey = new PublicKey(address);
    const connection = new Connection(RPC_URL, 'confirmed');

    const options = {
      limit: Math.min(limit, 100), // Cap at 100 transactions
    };

    if (before) {
      options.before = before;
    }

    const signatures = await connection.getSignaturesForAddress(publicKey, options);

    // Get detailed transaction info for each signature
    const transactions = [];
    for (const sig of signatures) {
      try {
        const tx = await connection.getTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0,
        });

        if (tx) {
          transactions.push({
            signature: sig.signature,
            slot: sig.slot,
            blockTime: sig.blockTime,
            confirmationStatus: sig.confirmationStatus,
            err: sig.err,
            fee: tx.meta?.fee,
            success: tx.meta?.err === null,
          });
        }
      } catch (error) {
        console.error(`Error fetching transaction ${sig.signature}:`, error);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        transactions,
        total: signatures.length,
        hasMore: signatures.length === limit,
      },
    });
  } catch (error) {
    console.error('Error getting transaction history:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve transaction history',
    });
  }
}

// Estimate transaction fee
async function estimateTransactionFee(req, res, { fromAddress, toAddress, amount }) {
  if (!fromAddress || !toAddress || !amount) {
    return res.status(400).json({ 
      error: 'From address, to address, and amount are required' 
    });
  }

  try {
    const connection = new Connection(RPC_URL, 'confirmed');
    
    // Create a sample transaction to estimate fee
    const { Transaction, SystemProgram } = await import('@solana/web3.js');
    
    const fromPubkey = new PublicKey(fromAddress);
    const toPubkey = new PublicKey(toAddress);
    const lamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);

    const transaction = new Transaction();
    transaction.add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports,
      })
    );

    // Set recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    // Estimate fee
    const fee = await transaction.getEstimatedFee(connection);

    return res.status(200).json({
      success: true,
      data: {
        estimatedFee: fee / LAMPORTS_PER_SOL,
        estimatedFeeLamports: fee,
        totalCost: (lamports + fee) / LAMPORTS_PER_SOL,
        totalCostLamports: lamports + fee,
      },
    });
  } catch (error) {
    console.error('Error estimating transaction fee:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to estimate transaction fee',
    });
  }
}

// Get token balance
async function getTokenBalance(req, res, { walletAddress, tokenAddress }) {
  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  try {
    const connection = new Connection(RPC_URL, 'confirmed');
    const walletPubkey = new PublicKey(walletAddress);

    if (tokenAddress) {
      // Get specific token balance
      const tokenPubkey = new PublicKey(tokenAddress);
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        walletPubkey,
        { mint: tokenPubkey }
      );

      let balance = 0;
      if (tokenAccounts.value.length > 0) {
        balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      }

      return res.status(200).json({
        success: true,
        data: {
          tokenAddress,
          balance,
          accounts: tokenAccounts.value.length,
        },
      });
    } else {
      // Get all token balances
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        walletPubkey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      const tokens = tokenAccounts.value.map(account => ({
        mint: account.account.data.parsed.info.mint,
        balance: account.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals,
        address: account.pubkey.toString(),
      })).filter(token => token.balance > 0);

      return res.status(200).json({
        success: true,
        data: {
          tokens,
          totalTokens: tokens.length,
        },
      });
    }
  } catch (error) {
    console.error('Error getting token balance:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve token balance',
    });
  }
}
