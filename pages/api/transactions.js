// Next.js API route for blockchain transactions
import { Connection, PublicKey, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await getTransaction(req, res);
      case 'POST':
        return await handleTransactionOperation(req, res);
      case 'PATCH':
        return await updateTransaction(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Transaction API error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Get transaction details
async function getTransaction(req, res) {
  const { signature, address } = req.query;

  if (!signature && !address) {
    return res.status(400).json({ 
      error: 'Either transaction signature or wallet address is required' 
    });
  }

  try {
    const connection = new Connection(RPC_URL, 'confirmed');

    if (signature) {
      // Get specific transaction by signature
      const transaction = await connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      const result = {
        signature,
        slot: transaction.slot,
        blockTime: transaction.blockTime,
        fee: transaction.meta?.fee,
        success: transaction.meta?.err === null,
        error: transaction.meta?.err,
        preBalances: transaction.meta?.preBalances,
        postBalances: transaction.meta?.postBalances,
        logMessages: transaction.meta?.logMessages,
        computeUnitsConsumed: transaction.meta?.computeUnitsConsumed,
      };

      return res.status(200).json({
        success: true,
        data: result,
      });
    } else {
      // Get transactions for address
      const publicKey = new PublicKey(address);
      const signatures = await connection.getSignaturesForAddress(publicKey, {
        limit: parseInt(req.query.limit) || 10,
      });

      return res.status(200).json({
        success: true,
        data: {
          address,
          transactions: signatures,
          count: signatures.length,
        },
      });
    }
  } catch (error) {
    console.error('Error getting transaction:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve transaction',
    });
  }
}

// Handle transaction operations
async function handleTransactionOperation(req, res) {
  const { operation, ...data } = req.body;

  switch (operation) {
    case 'submit':
      return await submitTransaction(req, res, data);
    case 'simulate':
      return await simulateTransaction(req, res, data);
    case 'verify':
      return await verifyTransaction(req, res, data);
    case 'track':
      return await trackTransaction(req, res, data);
    default:
      return res.status(400).json({ error: 'Invalid operation' });
  }
}

// Submit transaction to blockchain
async function submitTransaction(req, res, { serializedTransaction, commitment = 'confirmed' }) {
  if (!serializedTransaction) {
    return res.status(400).json({ error: 'Serialized transaction is required' });
  }

  try {
    const connection = new Connection(RPC_URL, commitment);
    
    // Deserialize transaction
    const transaction = Transaction.from(Buffer.from(serializedTransaction, 'base64'));
    
    // Submit transaction
    const signature = await connection.sendRawTransaction(
      transaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: commitment,
      }
    );

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature, commitment);

    if (confirmation.value.err) {
      return res.status(400).json({
        success: false,
        error: 'Transaction failed',
        signature,
        details: confirmation.value.err,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        signature,
        status: 'confirmed',
        slot: confirmation.context.slot,
      },
    });
  } catch (error) {
    console.error('Error submitting transaction:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to submit transaction',
      details: error.message,
    });
  }
}

// Simulate transaction
async function simulateTransaction(req, res, { serializedTransaction }) {
  if (!serializedTransaction) {
    return res.status(400).json({ error: 'Serialized transaction is required' });
  }

  try {
    const connection = new Connection(RPC_URL, 'confirmed');
    
    // Deserialize transaction
    const transaction = Transaction.from(Buffer.from(serializedTransaction, 'base64'));
    
    // Simulate transaction
    const simulation = await connection.simulateTransaction(transaction);

    return res.status(200).json({
      success: true,
      data: {
        success: simulation.value.err === null,
        error: simulation.value.err,
        logs: simulation.value.logs,
        unitsConsumed: simulation.value.unitsConsumed,
        accountsUsed: simulation.value.accounts?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error simulating transaction:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to simulate transaction',
      details: error.message,
    });
  }
}

// Verify transaction status
async function verifyTransaction(req, res, { signature }) {
  if (!signature) {
    return res.status(400).json({ error: 'Transaction signature is required' });
  }

  try {
    const connection = new Connection(RPC_URL, 'confirmed');
    
    // Get signature status
    const status = await connection.getSignatureStatus(signature);
    
    if (!status.value) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        signature,
        confirmationStatus: status.value.confirmationStatus,
        confirmations: status.value.confirmations,
        error: status.value.err,
        slot: status.value.slot,
        verified: status.value.confirmationStatus === 'finalized',
      },
    });
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to verify transaction',
    });
  }
}

// Track transaction and sync with backend
async function trackTransaction(req, res, { signature, userId, type, metadata }) {
  if (!signature) {
    return res.status(400).json({ error: 'Transaction signature is required' });
  }

  try {
    const connection = new Connection(RPC_URL, 'confirmed');
    
    // Get transaction details
    const transaction = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found on blockchain' });
    }

    // Sync with backend if user is authenticated
    let backendSync = null;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token && (userId || type)) {
      try {
        const backendResponse = await fetch(`${API_BASE_URL}/transactions/sync`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            blockchain_tx_hash: signature,
            user_id: userId,
            type: type || 'transfer',
            amount: metadata?.amount,
            status: transaction.meta?.err ? 'failed' : 'completed',
            metadata: {
              slot: transaction.slot,
              blockTime: transaction.blockTime,
              fee: transaction.meta?.fee,
              ...metadata,
            },
          }),
        });

        if (backendResponse.ok) {
          backendSync = await backendResponse.json();
        }
      } catch (backendError) {
        console.error('Backend sync failed:', backendError);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        signature,
        blockchain: {
          slot: transaction.slot,
          blockTime: transaction.blockTime,
          fee: transaction.meta?.fee,
          success: transaction.meta?.err === null,
          error: transaction.meta?.err,
        },
        backend: backendSync,
      },
    });
  } catch (error) {
    console.error('Error tracking transaction:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to track transaction',
    });
  }
}

// Update transaction status
async function updateTransaction(req, res) {
  const { signature, status, metadata } = req.body;

  if (!signature) {
    return res.status(400).json({ error: 'Transaction signature is required' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const response = await fetch(`${API_BASE_URL}/transactions/update`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        blockchain_tx_hash: signature,
        status,
        metadata,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return res.status(200).json({
        success: true,
        data: result,
      });
    } else {
      throw new Error('Backend update failed');
    }
  } catch (error) {
    console.error('Error updating transaction:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update transaction',
    });
  }
}
