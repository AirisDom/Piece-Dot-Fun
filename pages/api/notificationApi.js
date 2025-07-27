import { BASE_PATH, URL } from "../../utils/constants";

/**
 * Enhanced Notification API
 * Handles all notification operations with better error handling and features
 */

// Add notification
export async function addNotificationApi(formData) {
  try {
    const url = `${URL}/not/addNotification`;
    const params = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };

    const response = await fetch(url, params);
    const result = await response.json();

    return {
      status: response.status,
      success: response.ok,
      result,
      error: response.ok ? null : result.message || 'Failed to add notification'
    };
  } catch (error) {
    console.error('Add notification error:', error);
    return {
      status: 500,
      success: false,
      result: null,
      error: error.message || 'Network error'
    };
  }
}

// Get notification status
export async function getNotificationStatus(token) {
  try {
    const url = `${URL}/not/getNotificationStatus`;
    const params = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token }),
    };

    const response = await fetch(url, params);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      status: response.status,
      success: true,
      result,
      error: null
    };
  } catch (error) {
    console.error('Get notification status error:', error);
    return {
      status: 500,
      success: false,
      result: null,
      error: error.message || 'Failed to get notification status'
    };
  }
}

// Get all notifications for user
export async function getUserNotifications(token, filters = {}) {
  try {
    const { page = 1, limit = 20, type, status, dateFrom, dateTo } = filters;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(type && { type }),
      ...(status && { status }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo })
    });

    const url = `${URL}/not/getUserNotifications?${queryParams}`;
    const params = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    };

    const response = await fetch(url, params);
    const result = await response.json();

    return {
      status: response.status,
      success: response.ok,
      result,
      error: response.ok ? null : result.message || 'Failed to get notifications'
    };
  } catch (error) {
    console.error('Get user notifications error:', error);
    return {
      status: 500,
      success: false,
      result: null,
      error: error.message || 'Network error'
    };
  }
}

// Mark notification as read
export async function markNotificationRead(token, notificationId) {
  try {
    const url = `${URL}/not/markRead/${notificationId}`;
    const params = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    };

    const response = await fetch(url, params);
    const result = await response.json();

    return {
      status: response.status,
      success: response.ok,
      result,
      error: response.ok ? null : result.message || 'Failed to mark notification as read'
    };
  } catch (error) {
    console.error('Mark notification read error:', error);
    return {
      status: 500,
      success: false,
      result: null,
      error: error.message || 'Network error'
    };
  }
}

// Mark all notifications as read
export async function markAllNotificationsRead(token) {
  try {
    const url = `${URL}/not/markAllRead`;
    const params = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    };

    const response = await fetch(url, params);
    const result = await response.json();

    return {
      status: response.status,
      success: response.ok,
      result,
      error: response.ok ? null : result.message || 'Failed to mark all notifications as read'
    };
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return {
      status: 500,
      success: false,
      result: null,
      error: error.message || 'Network error'
    };
  }
}

// Delete notification
export async function deleteNotification(token, notificationId) {
  try {
    const url = `${URL}/not/delete/${notificationId}`;
    const params = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    };

    const response = await fetch(url, params);
    const result = await response.json();

    return {
      status: response.status,
      success: response.ok,
      result,
      error: response.ok ? null : result.message || 'Failed to delete notification'
    };
  } catch (error) {
    console.error('Delete notification error:', error);
    return {
      status: 500,
      success: false,
      result: null,
      error: error.message || 'Network error'
    };
  }
}

// Update notification preferences
export async function updateNotificationPreferences(token, preferences) {
  try {
    const url = `${URL}/not/preferences`;
    const params = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(preferences),
    };

    const response = await fetch(url, params);
    const result = await response.json();

    return {
      status: response.status,
      success: response.ok,
      result,
      error: response.ok ? null : result.message || 'Failed to update notification preferences'
    };
  } catch (error) {
    console.error('Update notification preferences error:', error);
    return {
      status: 500,
      success: false,
      result: null,
      error: error.message || 'Network error'
    };
  }
}

// Get notification preferences
export async function getNotificationPreferences(token) {
  try {
    const url = `${URL}/not/preferences`;
    const params = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    };

    const response = await fetch(url, params);
    const result = await response.json();

    return {
      status: response.status,
      success: response.ok,
      result,
      error: response.ok ? null : result.message || 'Failed to get notification preferences'
    };
  } catch (error) {
    console.error('Get notification preferences error:', error);
    return {
      status: 500,
      success: false,
      result: null,
      error: error.message || 'Network error'
    };
  }
}

// Send push notification (admin/system use)
export async function sendPushNotification(token, notificationData) {
  try {
    const url = `${URL}/not/push`;
    const params = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(notificationData),
    };

    const response = await fetch(url, params);
    const result = await response.json();

    return {
      status: response.status,
      success: response.ok,
      result,
      error: response.ok ? null : result.message || 'Failed to send push notification'
    };
  } catch (error) {
    console.error('Send push notification error:', error);
    return {
      status: 500,
      success: false,
      result: null,
      error: error.message || 'Network error'
    };
  }
}

/**
 * Next.js API Route Handler for Notifications
 */
export default async function handler(req, res) {
  const { method } = req;
  const token = req.headers.authorization?.replace('Bearer ', '') || req.body.token;

  if (!token && method !== 'POST') {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  try {
    switch (method) {
      case 'GET':
        // Get user notifications
        const { page, limit, type, status, dateFrom, dateTo } = req.query;
        const result = await getUserNotifications(token, { 
          page: parseInt(page) || 1, 
          limit: parseInt(limit) || 20, 
          type, 
          status, 
          dateFrom, 
          dateTo 
        });
        return res.status(result.status).json(result);

      case 'POST':
        // Add notification or specific action
        const { action, ...data } = req.body;
        
        if (action === 'add') {
          const addResult = await addNotificationApi(data);
          return res.status(addResult.status).json(addResult);
        } else if (action === 'status') {
          const statusResult = await getNotificationStatus(token);
          return res.status(statusResult.status).json(statusResult);
        } else if (action === 'push') {
          const pushResult = await sendPushNotification(token, data);
          return res.status(pushResult.status).json(pushResult);
        } else {
          return res.status(400).json({ error: 'Invalid action' });
        }

      case 'PUT':
        // Update notification or preferences
        const { notificationId, preferences, markAllRead } = req.body;
        
        if (markAllRead) {
          const markAllResult = await markAllNotificationsRead(token);
          return res.status(markAllResult.status).json(markAllResult);
        } else if (notificationId) {
          const markResult = await markNotificationRead(token, notificationId);
          return res.status(markResult.status).json(markResult);
        } else if (preferences) {
          const prefResult = await updateNotificationPreferences(token, preferences);
          return res.status(prefResult.status).json(prefResult);
        } else {
          return res.status(400).json({ error: 'Invalid update request' });
        }

      case 'DELETE':
        // Delete notification
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Notification ID required' });
        }
        const deleteResult = await deleteNotification(token, id);
        return res.status(deleteResult.status).json(deleteResult);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Notification API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
