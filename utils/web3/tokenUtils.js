import { PublicKey, Connection } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAccount, getOrCreateAssociatedTokenAccount, transfer, mintTo, burn } from '@solana/spl-token';

/**
 * Solana Token Utilities
 * Provides functions for SPL token operations
 */

export function getTokenProgramId() {
  return TOKEN_PROGRAM_ID;
}

export async function getTokenAccount(connection, tokenAddress, ownerAddress) {
  try {
    const owner = new PublicKey(ownerAddress);
    const token = new PublicKey(tokenAddress);
    const account = await getOrCreateAssociatedTokenAccount(
      connection,
      owner,
      token,
      owner
    );
    return account;
  } catch (error) {
    console.error('Get token account error:', error);
    throw error;
  }
}

export async function transferTokens(connection, fromWallet, toAddress, tokenAddress, amount) {
  try {
    const to = new PublicKey(toAddress);
    const token = new PublicKey(tokenAddress);
    const fromTokenAccount = await getTokenAccount(connection, tokenAddress, fromWallet.publicKey.toBase58());
    const toTokenAccount = await getTokenAccount(connection, tokenAddress, toAddress);
    const txSignature = await transfer(
      connection,
      fromWallet,
      fromTokenAccount.address,
      toTokenAccount.address,
      fromWallet.publicKey,
      amount
    );
    return txSignature;
  } catch (error) {
    console.error('Transfer tokens error:', error);
    throw error;
  }
}

export async function mintTokens(connection, mintAuthority, tokenAddress, toAddress, amount) {
  try {
    const to = new PublicKey(toAddress);
    const token = new PublicKey(tokenAddress);
    const toTokenAccount = await getTokenAccount(connection, tokenAddress, toAddress);
    const txSignature = await mintTo(
      connection,
      mintAuthority,
      token,
      toTokenAccount.address,
      mintAuthority.publicKey,
      amount
    );
    return txSignature;
  } catch (error) {
    console.error('Mint tokens error:', error);
    throw error;
  }
}

export async function burnTokens(connection, ownerWallet, tokenAddress, amount) {
  try {
    const token = new PublicKey(tokenAddress);
    const ownerTokenAccount = await getTokenAccount(connection, tokenAddress, ownerWallet.publicKey.toBase58());
    const txSignature = await burn(
      connection,
      ownerWallet,
      ownerTokenAccount.address,
      token,
      ownerWallet.publicKey,
      amount
    );
    return txSignature;
  } catch (error) {
    console.error('Burn tokens error:', error);
    throw error;
  }
}
