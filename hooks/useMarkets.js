import { useState, useEffect, useCallback } from "react";
import { useProfile } from "./useProfile";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const useMarkets = () => {
  const [markets, setMarkets] = useState([]);
  const [myMarkets, setMyMarkets] = useState([]);
  const [currentMarket, setCurrentMarket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const { connected, userProfile } = useProfile();

  // Fetch all markets (public)
  const fetchMarkets = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/markets?${queryParams}`);
      
      if (response.ok) {
        const data = await response.json();
        setMarkets(data.data);
        setPagination(data.meta);
      } else {
        throw new Error('Failed to fetch markets');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching markets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's markets
  const fetchMyMarkets = useCallback(async () => {
    if (!connected || !userProfile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/my-markets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMyMarkets(data.data);
      } else {
        throw new Error('Failed to fetch my markets');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching my markets:', err);
    } finally {
      setLoading(false);
    }
  }, [connected, userProfile]);

  // Fetch single market
  const fetchMarket = useCallback(async (marketId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/markets/${marketId}`);
      
      if (response.ok) {
        const data = await response.json();
        setCurrentMarket(data.data);
        return data.data;
      } else {
        throw new Error('Failed to fetch market');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching market:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new market
  const createMarket = useCallback(async (marketData) => {
    if (!connected || !userProfile) {
      setError('Please connect your wallet first');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/markets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(marketData),
      });
      
      if (response.ok) {
        const data = await response.json();
        await fetchMyMarkets(); // Refresh my markets
        return data;
      } else {
        throw new Error('Failed to create market');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, userProfile, fetchMyMarkets]);

  // Update market
  const updateMarket = useCallback(async (marketId, marketData) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/markets/${marketId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(marketData),
      });
      
      if (response.ok) {
        const data = await response.json();
        await fetchMyMarkets(); // Refresh my markets
        if (currentMarket?.id === marketId) {
          setCurrentMarket(data.data);
        }
        return data;
      } else {
        throw new Error('Failed to update market');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMyMarkets, currentMarket]);

  // Delete market
  const deleteMarket = useCallback(async (marketId) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/markets/${marketId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        await fetchMyMarkets(); // Refresh my markets
        if (currentMarket?.id === marketId) {
          setCurrentMarket(null);
        }
      } else {
        throw new Error('Failed to delete market');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMyMarkets, currentMarket]);

  // Activate/Deactivate market
  const toggleMarketStatus = useCallback(async (marketId, activate = true) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const endpoint = activate ? 'activate' : 'deactivate';
      const response = await fetch(`${API_BASE_URL}/markets/${marketId}/${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        await fetchMyMarkets(); // Refresh my markets
        if (currentMarket?.id === marketId) {
          await fetchMarket(marketId); // Refresh current market
        }
      } else {
        throw new Error(`Failed to ${activate ? 'activate' : 'deactivate'} market`);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMyMarkets, currentMarket, fetchMarket]);

  // Get market analytics
  const getMarketAnalytics = useCallback(async (marketId) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/markets/${marketId}/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data;
      } else {
        throw new Error('Failed to fetch market analytics');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search markets
  const searchMarkets = useCallback(async (searchTerm, filters = {}) => {
    const params = {
      search: searchTerm,
      ...filters,
    };
    await fetchMarkets(params);
  }, [fetchMarkets]);

  // Load markets on mount
  useEffect(() => {
    fetchMarkets();
  }, []);

  // Load user's markets when connected
  useEffect(() => {
    if (connected && userProfile) {
      fetchMyMarkets();
    }
  }, [connected, userProfile, fetchMyMarkets]);

  return {
    markets,
    myMarkets,
    currentMarket,
    loading,
    error,
    pagination,
    fetchMarkets,
    fetchMyMarkets,
    fetchMarket,
    createMarket,
    updateMarket,
    deleteMarket,
    toggleMarketStatus,
    getMarketAnalytics,
    searchMarkets,
    setCurrentMarket,
  };
};

export default useMarkets;
