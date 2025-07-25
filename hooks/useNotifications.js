import { useState, useEffect, useCallback } from "react";
import { useProfile } from "./useProfile";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { connected, userProfile } = useProfile();

  // Fetch notifications
  const fetchNotifications = useCallback(async (params = {}) => {
    if (!connected || !userProfile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/notifications?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data);
        setUnreadCount(data.data.filter(n => !n.read_at).length);
      } else {
        throw new Error('Failed to fetch notifications');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [connected, userProfile]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!connected || !userProfile) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read_at: new Date().toISOString() }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        throw new Error('Failed to mark notification as read');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error marking notification as read:', err);
    }
  }, [connected, userProfile]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!connected || !userProfile) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const now = new Date().toISOString();
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read_at: now }))
        );
        setUnreadCount(0);
      } else {
        throw new Error('Failed to mark all notifications as read');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error marking all notifications as read:', err);
    }
  }, [connected, userProfile]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!connected || !userProfile) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && !notification.read_at) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      } else {
        throw new Error('Failed to delete notification');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error deleting notification:', err);
    }
  }, [connected, userProfile, notifications]);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    if (!connected || !userProfile) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/notifications/clear-all`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
      } else {
        throw new Error('Failed to clear all notifications');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error clearing all notifications:', err);
    }
  }, [connected, userProfile]);

  // Send notification (for testing or admin purposes)
  const sendNotification = useCallback(async (notificationData) => {
    if (!connected || !userProfile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });
      
      if (response.ok) {
        const data = await response.json();
        await fetchNotifications(); // Refresh notifications
        return data;
      } else {
        throw new Error('Failed to send notification');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, userProfile, fetchNotifications]);

  // Get notification preferences
  const getNotificationPreferences = useCallback(async () => {
    if (!connected || !userProfile) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/notification-preferences`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data;
      } else {
        throw new Error('Failed to get notification preferences');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error getting notification preferences:', err);
    }
  }, [connected, userProfile]);

  // Update notification preferences
  const updateNotificationPreferences = useCallback(async (preferences) => {
    if (!connected || !userProfile) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/notification-preferences`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data;
      } else {
        throw new Error('Failed to update notification preferences');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [connected, userProfile]);

  // Add real-time notification (for WebSocket/SSE integration)
  const addRealtimeNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.read_at) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // Filter notifications by type
  const filterByType = useCallback((type) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  // Filter notifications by read status
  const filterByReadStatus = useCallback((isRead) => {
    return notifications.filter(notification => Boolean(notification.read_at) === isRead);
  }, [notifications]);

  // Get notification statistics
  const getNotificationStats = useCallback(() => {
    const stats = {
      total: notifications.length,
      unread: unreadCount,
      read: notifications.length - unreadCount,
      byType: notifications.reduce((acc, notification) => {
        acc[notification.type] = (acc[notification.type] || 0) + 1;
        return acc;
      }, {}),
    };
    return stats;
  }, [notifications, unreadCount]);

  // Auto-refresh notifications periodically
  useEffect(() => {
    if (connected && userProfile) {
      fetchNotifications();
      
      // Set up periodic refresh (every 30 seconds)
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [connected, userProfile, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    sendNotification,
    getNotificationPreferences,
    updateNotificationPreferences,
    addRealtimeNotification,
    filterByType,
    filterByReadStatus,
    getNotificationStats,
  };
};

export default useNotifications;
