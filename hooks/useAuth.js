import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { connected, publicKey, disconnect } = useWallet();

  // Initialize auth from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // Register new user
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Login with email/password
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Login with wallet
  const walletLogin = useCallback(async () => {
    if (!connected || !publicKey) {
      throw new Error('Wallet not connected');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/wallet-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: publicKey.toBase58(),
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Wallet login failed');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey]);

  // Logout
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear state regardless of API call success
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      // Disconnect wallet if connected
      if (connected) {
        await disconnect();
      }
      
      setLoading(false);
    }
  }, [token, connected, disconnect]);

  // Get current user
  const getCurrentUser = useCallback(async () => {
    if (!token) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
        localStorage.setItem('auth_user', JSON.stringify(data.data));
        return data.data;
      } else if (response.status === 401) {
        // Token expired or invalid
        await logout();
        throw new Error('Session expired');
      } else {
        throw new Error('Failed to get user');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  // Refresh token
  const refreshToken = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        localStorage.setItem('auth_token', data.token);
        return data.token;
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (err) {
      console.error('Token refresh error:', err);
      await logout();
    }
  }, [token, logout]);

  // Check if token is valid
  const checkTokenValidity = useCallback(async () => {
    if (!token) return false;
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.ok;
    } catch (err) {
      return false;
    }
  }, [token]);

  // Auto-login with wallet when wallet connects
  useEffect(() => {
    if (connected && publicKey && !isAuthenticated) {
      walletLogin().catch(console.error);
    }
  }, [connected, publicKey, isAuthenticated, walletLogin]);

  // Auto-logout when wallet disconnects
  useEffect(() => {
    if (!connected && isAuthenticated && user?.wallet_address) {
      // Only logout if user was authenticated via wallet
      logout();
    }
  }, [connected, isAuthenticated, user, logout]);

  // Validate token on app load
  useEffect(() => {
    if (token && !user) {
      getCurrentUser().catch(() => {
        // Silent fail, token might be expired
      });
    }
  }, [token, user, getCurrentUser]);

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    walletLogin,
    logout,
    getCurrentUser,
    refreshToken,
    checkTokenValidity,
  };
};

// Auth Context Provider
export const AuthProvider = ({ children }) => {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
