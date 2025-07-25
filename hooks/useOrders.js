import { useState, useEffect, useCallback } from "react";
import { useProfile } from "./useProfile";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [marketOrders, setMarketOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const { connected, userProfile } = useProfile();

  // Fetch all orders (admin only)
  const fetchOrders = useCallback(async (params = {}) => {
    if (!connected || !userProfile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/orders?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data);
        setPagination(data.meta);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [connected, userProfile]);

  // Fetch user's orders (as buyer)
  const fetchMyOrders = useCallback(async (params = {}) => {
    if (!connected || !userProfile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/my-orders?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMyOrders(data.data);
        setPagination(data.meta);
      } else {
        throw new Error('Failed to fetch my orders');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching my orders:', err);
    } finally {
      setLoading(false);
    }
  }, [connected, userProfile]);

  // Fetch market orders (as seller)
  const fetchMarketOrders = useCallback(async (params = {}) => {
    if (!connected || !userProfile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/market-orders?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMarketOrders(data.data);
        setPagination(data.meta);
      } else {
        throw new Error('Failed to fetch market orders');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching market orders:', err);
    } finally {
      setLoading(false);
    }
  }, [connected, userProfile]);

  // Fetch single order
  const fetchOrder = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentOrder(data.data);
        return data.data;
      } else {
        throw new Error('Failed to fetch order');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching order:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new order
  const createOrder = useCallback(async (orderData) => {
    if (!connected || !userProfile) {
      setError('Please connect your wallet first');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      if (response.ok) {
        const data = await response.json();
        await fetchMyOrders(); // Refresh my orders
        return data;
      } else {
        throw new Error('Failed to create order');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, userProfile, fetchMyOrders]);

  // Confirm order (seller action)
  const confirmOrder = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/confirm`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        await fetchMarketOrders(); // Refresh market orders
        if (currentOrder?.id === orderId) {
          setCurrentOrder(data.data);
        }
        return data;
      } else {
        throw new Error('Failed to confirm order');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMarketOrders, currentOrder]);

  // Ship order (seller action)
  const shipOrder = useCallback(async (orderId, trackingNumber = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/ship`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tracking_number: trackingNumber }),
      });
      
      if (response.ok) {
        const data = await response.json();
        await fetchMarketOrders(); // Refresh market orders
        if (currentOrder?.id === orderId) {
          setCurrentOrder(data.data);
        }
        return data;
      } else {
        throw new Error('Failed to ship order');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMarketOrders, currentOrder]);

  // Deliver order (buyer confirmation)
  const deliverOrder = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/deliver`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        await fetchMyOrders(); // Refresh my orders
        if (currentOrder?.id === orderId) {
          setCurrentOrder(data.data);
        }
        return data;
      } else {
        throw new Error('Failed to confirm delivery');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMyOrders, currentOrder]);

  // Cancel order
  const cancelOrder = useCallback(async (orderId, reason = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      
      if (response.ok) {
        const data = await response.json();
        await fetchMyOrders(); // Refresh my orders
        await fetchMarketOrders(); // Refresh market orders
        if (currentOrder?.id === orderId) {
          setCurrentOrder(data.data);
        }
        return data;
      } else {
        throw new Error('Failed to cancel order');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMyOrders, fetchMarketOrders, currentOrder]);

  // Rate order (buyer action)
  const rateOrder = useCallback(async (orderId, rating, review = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/rate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, review }),
      });
      
      if (response.ok) {
        const data = await response.json();
        await fetchMyOrders(); // Refresh my orders
        if (currentOrder?.id === orderId) {
          setCurrentOrder(data.data);
        }
        return data;
      } else {
        throw new Error('Failed to rate order');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMyOrders, currentOrder]);

  // Filter orders by status
  const filterOrdersByStatus = useCallback(async (status, orderType = 'my') => {
    const params = { status };
    
    if (orderType === 'my') {
      await fetchMyOrders(params);
    } else if (orderType === 'market') {
      await fetchMarketOrders(params);
    } else {
      await fetchOrders(params);
    }
  }, [fetchMyOrders, fetchMarketOrders, fetchOrders]);

  // Get order statistics
  const getOrderStats = useCallback(() => {
    const stats = {
      total: myOrders.length,
      pending: myOrders.filter(order => order.status === 'pending').length,
      confirmed: myOrders.filter(order => order.status === 'confirmed').length,
      shipped: myOrders.filter(order => order.status === 'shipped').length,
      delivered: myOrders.filter(order => order.status === 'delivered').length,
      cancelled: myOrders.filter(order => order.status === 'cancelled').length,
    };
    return stats;
  }, [myOrders]);

  // Load orders when connected
  useEffect(() => {
    if (connected && userProfile) {
      fetchMyOrders();
      fetchMarketOrders();
    }
  }, [connected, userProfile, fetchMyOrders, fetchMarketOrders]);

  return {
    orders,
    myOrders,
    marketOrders,
    currentOrder,
    loading,
    error,
    pagination,
    fetchOrders,
    fetchMyOrders,
    fetchMarketOrders,
    fetchOrder,
    createOrder,
    confirmOrder,
    shipOrder,
    deliverOrder,
    cancelOrder,
    rateOrder,
    filterOrdersByStatus,
    getOrderStats,
    setCurrentOrder,
  };
};

export default useOrders;
