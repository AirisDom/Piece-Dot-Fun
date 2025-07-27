// Next.js API route for authentication
import { NextApiRequest, NextApiResponse } from 'next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        return await handleAuth(req, res);
      case 'GET':
        return await getUser(req, res);
      case 'DELETE':
        return await logout(req, res);
      default:
        res.setHeader('Allow', ['POST', 'GET', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Auth API error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Handle authentication (login/register/wallet-login)
async function handleAuth(req, res) {
  const { action, ...data } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'Action is required' });
  }

  let endpoint;
  switch (action) {
    case 'login':
      endpoint = '/auth/login';
      break;
    case 'register':
      endpoint = '/auth/register';
      break;
    case 'wallet-login':
      endpoint = '/auth/wallet-login';
      break;
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      // Set HTTP-only cookie for token (more secure)
      if (result.token) {
        res.setHeader('Set-Cookie', [
          `auth_token=${result.token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`, // 7 days
        ]);
      }

      return res.status(200).json({
        success: true,
        user: result.user,
        message: result.message,
      });
    } else {
      return res.status(response.status).json({
        success: false,
        error: result.message || 'Authentication failed',
      });
    }
  } catch (error) {
    console.error('Authentication request failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication service unavailable',
    });
  }
}

// Get current user
async function getUser(req, res) {
  const token = req.cookies.auth_token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No authentication token provided' });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (response.ok) {
      return res.status(200).json({
        success: true,
        user: result.data,
      });
    } else {
      return res.status(response.status).json({
        success: false,
        error: result.message || 'Failed to get user',
      });
    }
  } catch (error) {
    console.error('Get user request failed:', error);
    return res.status(500).json({
      success: false,
      error: 'User service unavailable',
    });
  }
}

// Logout user
async function logout(req, res) {
  const token = req.cookies.auth_token || req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    }
  }

  // Clear the cookie
  res.setHeader('Set-Cookie', [
    'auth_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
  ]);

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}
