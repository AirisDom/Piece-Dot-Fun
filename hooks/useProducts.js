import { useState, useEffect, useCallback } from "react";
import { useProfile } from "./useProfile";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const { connected, userProfile } = useProfile();

  // Fetch all products (public)
  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data);
        setPagination(data.meta);
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch products by market
  const fetchProductsByMarket = useCallback(async (marketId, params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/markets/${marketId}/products?${queryParams}`);
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data);
        setPagination(data.meta);
      } else {
        throw new Error('Failed to fetch market products');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching market products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's products
  const fetchMyProducts = useCallback(async () => {
    if (!connected || !userProfile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/my-products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMyProducts(data.data);
      } else {
        throw new Error('Failed to fetch my products');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching my products:', err);
    } finally {
      setLoading(false);
    }
  }, [connected, userProfile]);

  // Fetch single product
  const fetchProduct = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      
      if (response.ok) {
        const data = await response.json();
        setCurrentProduct(data.data);
        return data.data;
      } else {
        throw new Error('Failed to fetch product');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching product:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new product
  const createProduct = useCallback(async (productData) => {
    if (!connected || !userProfile) {
      setError('Please connect your wallet first');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      if (response.ok) {
        const data = await response.json();
        await fetchMyProducts(); // Refresh my products
        return data;
      } else {
        throw new Error('Failed to create product');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, userProfile, fetchMyProducts]);

  // Update product
  const updateProduct = useCallback(async (productId, productData) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      if (response.ok) {
        const data = await response.json();
        await fetchMyProducts(); // Refresh my products
        if (currentProduct?.id === productId) {
          setCurrentProduct(data.data);
        }
        return data;
      } else {
        throw new Error('Failed to update product');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMyProducts, currentProduct]);

  // Delete product
  const deleteProduct = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        await fetchMyProducts(); // Refresh my products
        if (currentProduct?.id === productId) {
          setCurrentProduct(null);
        }
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMyProducts, currentProduct]);

  // Update product stock
  const updateProductStock = useCallback(async (productId, stock) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/products/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock }),
      });
      
      if (response.ok) {
        const data = await response.json();
        await fetchMyProducts(); // Refresh my products
        if (currentProduct?.id === productId) {
          setCurrentProduct(data.data);
        }
        return data;
      } else {
        throw new Error('Failed to update product stock');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMyProducts, currentProduct]);

  // Activate/Deactivate product
  const toggleProductStatus = useCallback(async (productId, activate = true) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const endpoint = activate ? 'activate' : 'deactivate';
      const response = await fetch(`${API_BASE_URL}/products/${productId}/${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        await fetchMyProducts(); // Refresh my products
        if (currentProduct?.id === productId) {
          await fetchProduct(productId); // Refresh current product
        }
      } else {
        throw new Error(`Failed to ${activate ? 'activate' : 'deactivate'} product`);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMyProducts, currentProduct, fetchProduct]);

  // Search products
  const searchProducts = useCallback(async (searchTerm, filters = {}) => {
    const params = {
      search: searchTerm,
      ...filters,
    };
    await fetchProducts(params);
  }, [fetchProducts]);

  // Filter products by category
  const filterProductsByCategory = useCallback(async (categoryId, additionalFilters = {}) => {
    const params = {
      category_id: categoryId,
      ...additionalFilters,
    };
    await fetchProducts(params);
  }, [fetchProducts]);

  // Get featured products
  const getFeaturedProducts = useCallback(async (limit = 10) => {
    const params = {
      featured: true,
      limit,
    };
    await fetchProducts(params);
  }, [fetchProducts]);

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Load user's products when connected
  useEffect(() => {
    if (connected && userProfile) {
      fetchMyProducts();
    }
  }, [connected, userProfile, fetchMyProducts]);

  return {
    products,
    myProducts,
    currentProduct,
    loading,
    error,
    pagination,
    fetchProducts,
    fetchProductsByMarket,
    fetchMyProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    toggleProductStatus,
    searchProducts,
    filterProductsByCategory,
    getFeaturedProducts,
    setCurrentProduct,
  };
};

export default useProducts;
