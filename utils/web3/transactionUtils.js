import { Transaction, Connection, PublicKey } from '@solana/web3.js';

/**
 * Solana Transaction Utilities
 * Functions for transaction creation, sending, and confirmation
 */

export async function createTransaction({ connection, instructions, signers, feePayer }) {
  try {
    const transaction = new Transaction();
    transaction.add(...instructions);
    if (feePayer) {
      transaction.feePayer = new PublicKey(feePayer);
    }
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    if (signers && signers.length) {
      transaction.partialSign(...signers);
    }
    return transaction;
  } catch (error) {
    console.error('Create transaction error:', error);
    throw error;
  }
}

export async function sendTransaction({ connection, transaction, signers }) {
  try {
    if (signers && signers.length) {
      transaction.partialSign(...signers);
    }
    const rawTx = transaction.serialize();
    const txId = await connection.sendRawTransaction(rawTx);
    return txId;
  } catch (error) {
    console.error('Send transaction error:', error);
    throw error;
  }
}

export async function confirmTransaction(connection, txId) {
  try {
    const confirmation = await connection.confirmTransaction(txId, 'confirmed');
    return confirmation;
  } catch (error) {
    console.error('Confirm transaction error:', error);
    throw error;
  }
}
