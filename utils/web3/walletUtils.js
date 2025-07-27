import { Keypair, PublicKey, Connection } from '@solana/web3.js';
import bs58 from 'bs58';

/**
 * Solana Wallet Utilities
 * Functions for wallet creation, import, and validation
 */

export function createWallet() {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
    secretKey: bs58.encode(keypair.secretKey),
    keypair
  };
}

export function importWallet(secretKeyBase58) {
  try {
    const secretKey = bs58.decode(secretKeyBase58);
    const keypair = Keypair.fromSecretKey(secretKey);
    return {
      publicKey: keypair.publicKey.toBase58(),
      keypair
    };
  } catch (error) {
    console.error('Import wallet error:', error);
    throw error;
  }
}

export function validateWalletAddress(address) {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export async function getWalletBalance(connection, address) {
  try {
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance;
  } catch (error) {
    console.error('Get wallet balance error:', error);
    throw error;
  }
}
