import { clusterApiUrl, Connection } from '@solana/web3.js';

/**
 * Solana Network Utilities
 * Functions for network connection and status
 */

export function getConnection(network = 'mainnet-beta') {
  const url = clusterApiUrl(network);
  return new Connection(url, 'confirmed');
}

export async function getNetworkStatus(connection) {
  try {
    const version = await connection.getVersion();
    const slot = await connection.getSlot();
    const epochInfo = await connection.getEpochInfo();
    return {
      version,
      slot,
      epochInfo
    };
  } catch (error) {
    console.error('Get network status error:', error);
    throw error;
  }
}
