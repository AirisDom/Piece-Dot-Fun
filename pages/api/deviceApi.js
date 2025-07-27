import { toast } from "react-toastify";
import { PublicKey } from "@solana/web3.js";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const DEVICE_STORAGE_KEY = 'piece_dot_fun_device';

// Enhanced device and wallet verification API
export class DeviceAPI {
  constructor() {
    this.storageKey = DEVICE_STORAGE_KEY;
  }

  // Verify wallet with enhanced validation
  async verifyWallet(formData) {
    try {
      const url = `${API_BASE_URL}/auth/checkDevice`;
      const params = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
        }),
      };

      const response = await fetch(url, params);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      const data = {
        status: response.status,
        result,
        verified: result.success || false,
      };

      if (data.verified) {
        this.saveDeviceInfo(formData);
        toast.success('Wallet verified successfully');
      } else {
        toast.error('Wallet verification failed');
      }

      return data;
    } catch (error) {
      console.error('Wallet verification error:', error);
      toast.error('Verification request failed');
      return {
        status: 500,
        result: { error: error.message },
        verified: false,
      };
    }
  }

  // Register new device
  async registerDevice(deviceData) {
    try {
      const url = `${API_BASE_URL}/auth/registerDevice`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...deviceData,
          deviceInfo: this.getDeviceInfo(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        this.saveDeviceInfo(deviceData);
        toast.success('Device registered successfully');
        return { success: true, data: result };
      } else {
        throw new Error('Device registration failed');
      }
    } catch (error) {
      console.error('Device registration error:', error);
      toast.error('Device registration failed');
      return { success: false, error: error.message };
    }
  }

  // Validate wallet address
  validateWalletAddress(address) {
    try {
      new PublicKey(address);
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: 'Invalid Solana wallet address format' 
      };
    }
  }

  // Get device fingerprint
  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cookieEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine,
      touchSupport: 'ontouchstart' in window,
    };
  }

  // Save device info to localStorage
  saveDeviceInfo(deviceData) {
    try {
      const deviceInfo = {
        ...deviceData,
        deviceFingerprint: this.getDeviceInfo(),
        registeredAt: new Date().toISOString(),
      };
      localStorage.setItem(this.storageKey, JSON.stringify(deviceInfo));
    } catch (error) {
      console.error('Error saving device info:', error);
    }
  }

  // Get saved device info
  getSavedDeviceInfo() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error reading device info:', error);
      return null;
    }
  }

  // Check if device is registered
  isDeviceRegistered() {
    const deviceInfo = this.getSavedDeviceInfo();
    return deviceInfo !== null;
  }

  // Clear device info
  clearDeviceInfo() {
    localStorage.removeItem(this.storageKey);
    toast.info('Device info cleared');
  }

  // Get wallet connection status
  async getWalletConnectionStatus(walletAddress) {
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/status/${walletAddress}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to get wallet status');
    } catch (error) {
      console.error('Wallet status check failed:', error);
      return { connected: false, error: error.message };
    }
  }

  // Sign message for device verification
  async signVerificationMessage(wallet, message) {
    try {
      if (!wallet.signMessage) {
        throw new Error('Wallet does not support message signing');
      }

      const encodedMessage = new TextEncoder().encode(message);
      const signature = await wallet.signMessage(encodedMessage);
      
      return {
        success: true,
        signature: Array.from(signature),
        message,
      };
    } catch (error) {
      console.error('Message signing failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Verify signed message
  async verifySignedMessage(walletAddress, message, signature) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verifySignature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: walletAddress,
          message,
          signature,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      }
      throw new Error('Signature verification failed');
    } catch (error) {
      console.error('Signature verification error:', error);
      return { verified: false, error: error.message };
    }
  }

  // Get device security score
  getDeviceSecurityScore() {
    const deviceInfo = this.getDeviceInfo();
    let score = 0;

    // Check for security features
    if (deviceInfo.cookieEnabled) score += 10;
    if (window.crypto && window.crypto.subtle) score += 20;
    if (window.location.protocol === 'https:') score += 20;
    if (navigator.hardwareConcurrency > 1) score += 10;
    if (navigator.deviceMemory > 2) score += 10;
    if (screen.width >= 1920) score += 10;
    if (Intl.DateTimeFormat().resolvedOptions().timeZone) score += 20;

    return Math.min(score, 100);
  }

  // Check device compatibility
  checkDeviceCompatibility() {
    const compatibility = {
      webCrypto: !!(window.crypto && window.crypto.subtle),
      localStorage: !!window.localStorage,
      sessionStorage: !!window.sessionStorage,
      websockets: !!window.WebSocket,
      webWorkers: !!window.Worker,
      notifications: !!window.Notification,
      geolocation: !!navigator.geolocation,
      camera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    };

    const score = Object.values(compatibility).filter(Boolean).length;
    
    return {
      ...compatibility,
      score: (score / Object.keys(compatibility).length) * 100,
      compatible: score >= 6, // At least 75% compatibility required
    };
  }
}

// Legacy function for backward compatibility
export async function verifyWallet(formData) {
  return new DeviceAPI().verifyWallet(formData);
}

// Export device API instance
export const deviceAPI = new DeviceAPI();

export default deviceAPI;
