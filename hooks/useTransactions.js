import { useState, useEffect, useCallback } from "react";
import { useProfile } from "./useProfile";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [myTransactions, setMyTransactions] = useState([]);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const { connected, userProfile } = useProfile();

  // Fetch all transactions (admin only)
  const fetchTransactions = useCallback(async (params = {}) => {
    if (!connected || !userProfile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/transactions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.data);
        setPagination(data.meta);
      } else {
        throw new Error('Failed to fetch transactions');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [connected, userProfile]);

  // Fetch user's transactions
  const fetchMyTransactions = useCallback(async (params = {}) => {
    if (!connected || !userProfile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/my-transactions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMyTransactions(data.data);
        setPagination(data.meta);
      } else {
        throw new Error('Failed to fetch my transactions');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching my transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [connected, userProfile]);

  // Fetch single transaction
  const fetchTransaction = useCallback(async (transactionId) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentTransaction(data.data);
        return data.data;
      } else {
        throw new Error('Failed to fetch transaction');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching transaction:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create funding transaction
  const createFundingTransaction = useCallback(async (amount, paymentMethod = 'wallet') => {
    if (!connected || !userProfile) {
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
          amount,
          payment_method: paymentMethod,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        await fetchMyTransactions(); // Refresh transactions
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
  }, [connected, userProfile, fetchMyTransactions]);

  // Create withdrawal transaction
  const createWithdrawalTransaction = useCallback(async (amount, walletAddress) => {
    if (!connected || !userProfile) {
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
          amount,
          wallet_address: walletAddress,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        await fetchMyTransactions(); // Refresh transactions
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
  }, [connected, userProfile, fetchMyTransactions]);

  // Confirm transaction (blockchain verification)
  const confirmTransaction = useCallback(async (transactionId, blockchainTxHash) => {
    setLoading(true);
    setError(null);
    
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
        await fetchMyTransactions(); // Refresh transactions
        if (currentTransaction?.id === transactionId) {
          setCurrentTransaction(data.data);
        }
        return data;
      } else {
        throw new Error('Failed to confirm transaction');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMyTransactions, currentTransaction]);

  // Get transaction analytics
  const fetchTransactionAnalytics = useCallback(async (params = {}) => {
    if (!connected || !userProfile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/transactions/analytics?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
        return data.data;
      } else {
        throw new Error('Failed to fetch transaction analytics');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching transaction analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [connected, userProfile]);

  // Filter transactions by type
  const filterTransactionsByType = useCallback(async (type) => {
    const params = { type };
    await fetchMyTransactions(params);
  }, [fetchMyTransactions]);

  // Filter transactions by status
  const filterTransactionsByStatus = useCallback(async (status) => {
    const params = { status };
    await fetchMyTransactions(params);
  }, [fetchMyTransactions]);

  // Filter transactions by date range
  const filterTransactionsByDateRange = useCallback(async (startDate, endDate) => {
    const params = {
      start_date: startDate,
      end_date: endDate,
    };
    await fetchMyTransactions(params);
  }, [fetchMyTransactions]);

  // Get transaction summary statistics
  const getTransactionStats = useCallback(() => {
    const stats = {
      total: myTransactions.length,
      pending: myTransactions.filter(tx => tx.status === 'pending').length,
      completed: myTransactions.filter(tx => tx.status === 'completed').length,
      failed: myTransactions.filter(tx => tx.status === 'failed').length,
      totalAmount: myTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0),
      fundingAmount: myTransactions
        .filter(tx => tx.type === 'funding')
        .reduce((sum, tx) => sum + (tx.amount || 0), 0),
      withdrawalAmount: myTransactions
        .filter(tx => tx.type === 'withdrawal')
        .reduce((sum, tx) => sum + (tx.amount || 0), 0),
    };
    return stats;
  }, [myTransactions]);

  // Search transactions
  const searchTransactions = useCallback(async (searchTerm) => {
    const params = { search: searchTerm };
    await fetchMyTransactions(params);
  }, [fetchMyTransactions]);

  // Export transactions
  const exportTransactions = useCallback(async (format = 'csv', params = {}) => {
    if (!connected || !userProfile) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const queryParams = new URLSearchParams({
        ...params,
        format,
      });
      
      const response = await fetch(`${API_BASE_URL}/transactions/export?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to export transactions');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error exporting transactions:', err);
    }
  }, [connected, userProfile]);

  // Load transactions when connected
  useEffect(() => {
    if (connected && userProfile) {
      fetchMyTransactions();
      fetchTransactionAnalytics();
    }
  }, [connected, userProfile, fetchMyTransactions, fetchTransactionAnalytics]);

  return {
    transactions,
    myTransactions,
    currentTransaction,
    loading,
    error,
    pagination,
    analytics,
    fetchTransactions,
    fetchMyTransactions,
    fetchTransaction,
    createFundingTransaction,
    createWithdrawalTransaction,
    confirmTransaction,
    fetchTransactionAnalytics,
    filterTransactionsByType,
    filterTransactionsByStatus,
    filterTransactionsByDateRange,
    getTransactionStats,
    searchTransactions,
    exportTransactions,
    setCurrentTransaction,
  };
};

export default useTransactions;
