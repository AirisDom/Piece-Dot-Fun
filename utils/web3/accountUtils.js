import { PublicKey, Connection } from '@solana/web3.js';

/**
 * Solana Account Utilities
 * Functions for account info, history, and validation
 */

export async function getAccountInfo(connection, address) {
  try {
    const publicKey = new PublicKey(address);
    const info = await connection.getAccountInfo(publicKey);
    return info;
  } catch (error) {
    console.error('Get account info error:', error);
    throw error;
  }
}

export async function getAccountHistory(connection, address) {
  try {
    const publicKey = new PublicKey(address);
    const signatures = await connection.getSignaturesForAddress(publicKey);
    return signatures;
  } catch (error) {
    console.error('Get account history error:', error);
    throw error;
  }
}

export function validateAccountAddress(address) {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}
