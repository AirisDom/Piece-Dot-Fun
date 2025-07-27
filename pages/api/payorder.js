import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getConnection } from '../../utils/web3/solanaUtils';
import { createPaymentTransaction, processMarketPayment } from '../../utils/web3/smartContractUtils';

/**
 * Payment Order API Endpoint
 * Handles order payments, escrow, and transaction processing
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      orderId, 
      userWallet, 
      amount, 
      currency = 'SOL', 
      marketId, 
      productId,
      paymentMethod = 'wallet',
      escrowEnabled = true 
    } = req.body;

    // Validation
    if (!orderId || !userWallet || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields: orderId, userWallet, amount' 
      });
    }

    // Validate wallet address
    try {
      new PublicKey(userWallet);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const connection = getConnection();
    
    // Create payment transaction based on method
    let transactionData;
    
    if (paymentMethod === 'wallet') {
      // Direct wallet payment
      transactionData = await createPaymentTransaction({
        connection,
        fromWallet: userWallet,
        amount: parseFloat(amount),
        currency,
        orderId,
        marketId,
        productId,
        escrowEnabled
      });
    } else if (paymentMethod === 'market') {
      // Market-based payment through smart contract
      transactionData = await processMarketPayment({
        connection,
        userWallet,
        marketId,
        productId,
        amount: parseFloat(amount),
        orderId,
        escrowEnabled
      });
    } else {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    // Return transaction data for frontend to sign and submit
    res.status(200).json({
      success: true,
      orderId,
      transaction: transactionData.transaction,
      transactionId: transactionData.transactionId,
      escrowAccount: transactionData.escrowAccount,
      estimatedFee: transactionData.estimatedFee,
      paymentMethod,
      amount,
      currency,
      timestamp: new Date().toISOString(),
      message: 'Payment transaction created successfully'
    });

  } catch (error) {
    console.error('Payment order error:', error);
    
    // Handle specific error types
    if (error.message.includes('insufficient funds')) {
      return res.status(400).json({ 
        error: 'Insufficient funds for payment',
        code: 'INSUFFICIENT_FUNDS'
      });
    }
    
    if (error.message.includes('network')) {
      return res.status(503).json({ 
        error: 'Network error, please try again',
        code: 'NETWORK_ERROR'
      });
    }

    res.status(500).json({ 
      error: 'Internal server error during payment processing',
      code: 'PAYMENT_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
