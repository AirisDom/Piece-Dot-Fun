import { useState, useEffect, useCallback } from "react";
import { getAvatarUrl } from "../utils/getAvatarUrl";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const useProfile = () => {
  const [avatar, setAvatar] = useState("");
  const [userAddress, setUserAddress] = useState(undefined);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { connected, publicKey, sendTransaction } = useWallet();

  // Fetch user profile from backend
  const fetchUserProfile = useCallback(async () => {
    if (!connected || !publicKey) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.data);
      } else {
        throw new Error('Failed to fetch user profile');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey]);

  // Update user profile
  const updateProfile = useCallback(async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/users/${userProfile.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.data);
        return data;
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  // Login with wallet
  const loginWithWallet = useCallback(async () => {
    if (!connected || !publicKey) return;
    
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
        localStorage.setItem('auth_token', data.token);
        setUserProfile(data.user);
        return data;
      }
    } catch (err) {
      console.error('Error logging in with wallet:', err);
    }
  }, [connected, publicKey]);

  // Get Avatar based on the userAddress
  useEffect(() => {
    if (connected && publicKey) {
      setAvatar(getAvatarUrl(publicKey.toString()));
      setUserAddress(publicKey.toBase58());
      loginWithWallet();
    } else {
      setAvatar(getAvatarUrl("default"));
      setUserAddress(undefined);
      setUserProfile(null);
      localStorage.removeItem('auth_token');
    }
  }, [connected, publicKey, loginWithWallet]);

  // Fetch profile when connected
  useEffect(() => {
    if (connected && publicKey) {
      fetchUserProfile();
    }
  }, [connected, publicKey, fetchUserProfile]);

  return {
    connected,
    publicKey,
    avatar,
    setAvatar,
    userAddress,
    userProfile,
    loading,
    error,
    updateProfile,
    fetchUserProfile,
    loginWithWallet,
  };
};
