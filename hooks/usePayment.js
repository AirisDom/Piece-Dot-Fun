import { useState, useEffect, useCallback } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { getAvatarUrl } from "../utils/getAvatarUrl";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const usePayment = () => {
  const [avatar, setAvatar] = useState("");
  const [userAddress, setUserAddress] = useState("404");
  const { connected, publicKey, sendTransaction } = useWallet();

  const [receiver, setReceiver] = useState("");
  const [transactionPurpose, setTransactionPurpose] = useState("");
  const [amount, setAmount] = useState(0);

  const [newTransactionModalOpen, setNewTransactionModalOpen] = useState(false);
  const [newDepositModalOpen, setNewDepositModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(0);

  const { connection } = useConnection();

  //Local Storage with enhanced functionality
  const useLocalStorage = (storageKey, fallbackState) => {
    const [value, setValue] = useState(() => {
      try {
        const item = localStorage.getItem(storageKey);
        return item ? JSON.parse(item) : fallbackState;
      } catch (error) {
        console.error(`Error reading localStorage key "${storageKey}":`, error);
        return fallbackState;
      }
    });

    const setStoredValue = useCallback((newValue) => {
      try {
        setValue(newValue);
        localStorage.setItem(storageKey, JSON.stringify(newValue));
      } catch (error) {
        console.error(`Error setting localStorage key "${storageKey}":`, error);
      }
    }, [storageKey]);

    return [value, setStoredValue];
  };

  const [transactions, setTransactions] = useLocalStorage("transactions", []);

  // Get wallet balance
  const getBalance = useCallback(async () => {
    if (!connected || !publicKey) return 0;

    try {
      const balance = await connection.getBalance(publicKey);
      const solBalance = balance / LAMPORTS_PER_SOL;
      setBalance(solBalance);
      return solBalance;
    } catch (err) {
      console.error('Error fetching balance:', err);
      return 0;
    }
  }, [connected, publicKey, connection]);

  // Enhanced transaction creation
  const makeTransaction = async (fromWallet, toWallet, amount, reference) => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = clusterApiUrl(network);
    const connection = new Connection(endpoint);
    
    const { blockhash } = await connection.getLatestBlockhash("finalized");
    
    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: fromWallet,
    });
    
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: fromWallet,
      lamports: amount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
      toPubkey: toWallet,
    });
    
    // Add reference for tracking
    transferInstruction.keys.push({
      pubkey: reference,
      isSigner: false,
      isWritable: false,
    });
    
    transaction.add(transferInstruction);
    return transaction;
  };

  // Enhanced transaction execution with backend sync
  const doTransaction = async ({ amount, receiver, transactionPurpose }) => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fromWallet = publicKey;
      const toWallet = new PublicKey(receiver);
      const bnAmount = new BigNumber(amount);
      const reference = Keypair.generate().publicKey;
      
      // Create and send blockchain transaction
      const transaction = await makeTransaction(fromWallet, toWallet, bnAmount, reference);
      const txnHash = await sendTransaction(transaction, connection);
      
      console.log('Transaction hash:', txnHash);

      // Create transaction record in backend
      try {
        const token = localStorage.getItem('auth_token');
        const backendResponse = await fetch(`${API_BASE_URL}/transactions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'transfer',
            amount: parseFloat(amount),
            description: transactionPurpose,
            receiver_address: receiver,
            blockchain_tx_hash: txnHash,
            reference: reference.toString(),
            status: 'pending',
          }),
        });

        if (backendResponse.ok) {
          const backendData = await backendResponse.json();
          console.log('Transaction saved to backend:', backendData);
        }
      } catch (backendErr) {
        console.error('Error saving to backend:', backendErr);
        // Continue with local storage even if backend fails
      }

      // Update local transaction history
      const newID = (transactions.length + 1).toString();
      const newTransaction = {
        id: newID,
        from: {
          name: publicKey.toString(),
          handle: publicKey.toString(),
          avatar: avatar,
          verified: true,
        },
        to: {
          name: receiver,
          handle: "-",
          avatar: getAvatarUrl(receiver.toString()),
          verified: false,
        },
        description: transactionPurpose,
        transactionDate: new Date(),
        status: "Pending",
        amount: amount,
        txnHash: txnHash,
        reference: reference.toString(),
        source: "wallet",
        identifier: "-",
      };

      setNewTransactionModalOpen(false);
      setTransactions([newTransaction, ...transactions]);

      // Update balance
      await getBalance();

      return { txnHash, transaction: newTransaction };

    } catch (err) {
      setError(err.message || 'Transaction failed');
      console.error('Transaction error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create funding transaction
  const createFundingTransaction = useCallback(async (amount, paymentMethod = 'external') => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/transactions/funding`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          payment_method: paymentMethod,
          wallet_address: publicKey.toBase58(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add to local transactions
        const newTransaction = {
          id: (transactions.length + 1).toString(),
          from: {
            name: "Funding",
            handle: "External",
            avatar: getAvatarUrl("funding"),
            verified: true,
          },
          to: {
            name: publicKey.toString(),
            handle: publicKey.toString(),
            avatar: avatar,
            verified: true,
          },
          description: "Account Funding",
          transactionDate: new Date(),
          status: "Completed",
          amount: amount,
          txnHash: data.data.id,
          source: paymentMethod,
          identifier: data.data.id,
        };

        setTransactions([newTransaction, ...transactions]);
        await getBalance();
        
        return data;
      } else {
        throw new Error('Failed to create funding transaction');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, avatar, transactions, getBalance]);

  // Create withdrawal transaction
  const createWithdrawalTransaction = useCallback(async (amount, targetWallet) => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/transactions/withdrawal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          wallet_address: targetWallet || publicKey.toBase58(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add to local transactions
        const newTransaction = {
          id: (transactions.length + 1).toString(),
          from: {
            name: publicKey.toString(),
            handle: publicKey.toString(),
            avatar: avatar,
            verified: true,
          },
          to: {
            name: "Withdrawal",
            handle: "External",
            avatar: getAvatarUrl("withdrawal"),
            verified: true,
          },
          description: "Account Withdrawal",
          transactionDate: new Date(),
          status: "Pending",
          amount: amount,
          txnHash: data.data.id,
          source: "withdrawal",
          identifier: data.data.id,
        };

        setTransactions([newTransaction, ...transactions]);
        await getBalance();
        
        return data;
      } else {
        throw new Error('Failed to create withdrawal transaction');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, avatar, transactions, getBalance]);

  // Confirm transaction with blockchain hash
  const confirmTransaction = useCallback(async (transactionId, blockchainTxHash) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}/confirm`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blockchain_tx_hash: blockchainTxHash,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local transaction status
        setTransactions(prev => 
          prev.map(tx => 
            tx.identifier === transactionId 
              ? { ...tx, status: "Completed", txnHash: blockchainTxHash }
              : tx
          )
        );
        
        return data;
      } else {
        throw new Error('Failed to confirm transaction');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Get transaction history from backend
  const syncTransactionsWithBackend = useCallback(async () => {
    if (!connected) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/my-transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Convert backend transactions to local format
        const backendTransactions = data.data.map(tx => ({
          id: tx.id.toString(),
          from: {
            name: tx.sender_address || "Unknown",
            handle: tx.sender_address || "Unknown", 
            avatar: getAvatarUrl(tx.sender_address || "default"),
            verified: true,
          },
          to: {
            name: tx.receiver_address || "Unknown",
            handle: tx.receiver_address || "Unknown",
            avatar: getAvatarUrl(tx.receiver_address || "default"),
            verified: false,
          },
          description: tx.description || tx.type,
          transactionDate: new Date(tx.created_at),
          status: tx.status.charAt(0).toUpperCase() + tx.status.slice(1),
          amount: tx.amount,
          txnHash: tx.blockchain_tx_hash || tx.id,
          source: tx.type,
          identifier: tx.id,
        }));

        // Merge with local transactions, avoiding duplicates
        const localTxIds = transactions.map(tx => tx.identifier);
        const newBackendTx = backendTransactions.filter(tx => !localTxIds.includes(tx.identifier));
        
        setTransactions([...newBackendTx, ...transactions]);
      }
    } catch (err) {
      console.error('Error syncing transactions:', err);
    }
  }, [connected, transactions]);

  // Get payment statistics
  const getPaymentStats = useCallback(() => {
    const stats = {
      totalTransactions: transactions.length,
      totalSent: transactions
        .filter(tx => tx.from.name === publicKey?.toString())
        .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0),
      totalReceived: transactions
        .filter(tx => tx.to.name === publicKey?.toString())
        .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0),
      pendingTransactions: transactions.filter(tx => tx.status === "Pending").length,
      completedTransactions: transactions.filter(tx => tx.status === "Completed").length,
      balance: balance,
    };
    return stats;
  }, [transactions, publicKey, balance]);

  // Update avatar and address when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      setAvatar(getAvatarUrl(publicKey.toString()));
      setUserAddress(publicKey.toBase58());
      getBalance();
      syncTransactionsWithBackend();
    } else {
      setAvatar(getAvatarUrl("default"));
      setUserAddress("404");
      setBalance(0);
    }
  }, [connected, publicKey, getBalance, syncTransactionsWithBackend]);

  return {
    connected,
    publicKey,
    avatar,
    userAddress,
    balance,
    loading,
    error,
    doTransaction,
    createFundingTransaction,
    createWithdrawalTransaction,
    confirmTransaction,
    getBalance,
    syncTransactionsWithBackend,
    getPaymentStats,
    amount,
    setAmount,
    receiver,
    setReceiver,
    transactionPurpose,
    setTransactionPurpose,
    transactions,
    setTransactions,
    newTransactionModalOpen,
    setNewTransactionModalOpen,
    newDepositModalOpen,
    setNewDepositModalOpen,
  };
};
