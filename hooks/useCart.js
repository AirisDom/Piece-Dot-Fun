import { useState, useEffect, useCallback } from "react";
import { useProfile } from "./useProfile";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cartTotal, setCartTotal] = useState(0);
  const { connected, userProfile } = useProfile();

  // Fetch cart items from backend
  const fetchCart = useCallback(async () => {
    if (!connected || !userProfile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.data);
        calculateTotal(data.data);
      } else {
        throw new Error('Failed to fetch cart');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  }, [connected, userProfile]);

  // Add item to cart
  const addToCart = useCallback(async (productId, quantity = 1, options = {}) => {
    if (!connected || !userProfile) {
      setError('Please connect your wallet first');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          quantity,
          options,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        await fetchCart(); // Refresh cart
        return data;
      } else {
        throw new Error('Failed to add item to cart');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, userProfile, fetchCart]);

  // Update cart item quantity
  const updateCartItem = useCallback(async (cartItemId, quantity) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });
      
      if (response.ok) {
        await fetchCart(); // Refresh cart
      } else {
        throw new Error('Failed to update cart item');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  // Remove item from cart
  const removeFromCart = useCallback(async (cartItemId) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        await fetchCart(); // Refresh cart
      } else {
        throw new Error('Failed to remove item from cart');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setCartItems([]);
        setCartTotal(0);
      } else {
        throw new Error('Failed to clear cart');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Checkout cart
  const checkout = useCallback(async (shippingAddress, paymentMethod = 'wallet') => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/cart/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shipping_address: shippingAddress,
          payment_method: paymentMethod,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setCartItems([]);
        setCartTotal(0);
        return data;
      } else {
        throw new Error('Failed to checkout');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate cart total
  const calculateTotal = useCallback((items) => {
    const total = items.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);
    setCartTotal(total);
  }, []);

  // Get cart item count
  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  // Load cart when user connects
  useEffect(() => {
    if (connected && userProfile) {
      fetchCart();
    } else {
      setCartItems([]);
      setCartTotal(0);
    }
  }, [connected, userProfile, fetchCart]);

  return {
    cartItems,
    cartTotal,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    checkout,
    fetchCart,
    getCartItemCount,
  };
};

export default useCart;
