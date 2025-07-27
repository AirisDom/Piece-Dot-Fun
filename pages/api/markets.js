// Next.js API route for market operations
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await getMarkets(req, res);
      case 'POST':
        return await createMarket(req, res);
      case 'PATCH':
        return await updateMarket(req, res);
      case 'DELETE':
        return await deleteMarket(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Markets API error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Get markets with filtering and pagination
async function getMarkets(req, res) {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    category, 
    location, 
    rating,
    sort = 'created_at',
    order = 'desc',
    my_markets = false
  } = req.query;

  try {
    const params = new URLSearchParams({
      page,
      limit: Math.min(parseInt(limit), 100), // Cap at 100
      sort,
      order,
    });

    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (location) params.append('location', location);
    if (rating) params.append('rating', rating);

    let endpoint = '/markets';
    let headers = {
      'Content-Type': 'application/json',
    };

    // If requesting user's markets, add authentication
    if (my_markets === 'true') {
      const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.auth_token;
      if (!token) {
        return res.status(401).json({ error: 'Authentication required for my markets' });
      }
      endpoint = '/my-markets';
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}?${params}`, {
      headers,
    });

    if (response.ok) {
      const data = await response.json();
      return res.status(200).json({
        success: true,
        data: data.data,
        meta: data.meta,
      });
    } else {
      throw new Error(`Backend responded with ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching markets:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch markets',
    });
  }
}

// Create new market
async function createMarket(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.auth_token;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const {
    name,
    description,
    category_id,
    address,
    city,
    state,
    postal_code,
    country,
    latitude,
    longitude,
    phone,
    email,
    website,
    logo_url,
    banner_url,
  } = req.body;

  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required' });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/markets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        category_id,
        address,
        city,
        state,
        postal_code,
        country,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        phone,
        email,
        website,
        logo_url,
        banner_url,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      return res.status(201).json({
        success: true,
        data: result.data,
        message: 'Market created successfully',
      });
    } else {
      return res.status(response.status).json({
        success: false,
        error: result.message || 'Failed to create market',
      });
    }
  } catch (error) {
    console.error('Error creating market:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create market',
    });
  }
}

// Update market
async function updateMarket(req, res) {
  const { marketId } = req.query;
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.auth_token;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!marketId) {
    return res.status(400).json({ error: 'Market ID is required' });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/markets/${marketId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const result = await response.json();

    if (response.ok) {
      return res.status(200).json({
        success: true,
        data: result.data,
        message: 'Market updated successfully',
      });
    } else {
      return res.status(response.status).json({
        success: false,
        error: result.message || 'Failed to update market',
      });
    }
  } catch (error) {
    console.error('Error updating market:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update market',
    });
  }
}

// Delete market
async function deleteMarket(req, res) {
  const { marketId } = req.query;
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.auth_token;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!marketId) {
    return res.status(400).json({ error: 'Market ID is required' });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/markets/${marketId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return res.status(200).json({
        success: true,
        message: 'Market deleted successfully',
      });
    } else {
      const result = await response.json();
      return res.status(response.status).json({
        success: false,
        error: result.message || 'Failed to delete market',
      });
    }
  } catch (error) {
    console.error('Error deleting market:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete market',
    });
  }
}
