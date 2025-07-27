// Next.js API route for product operations
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await getProducts(req, res);
      case 'POST':
        return await createProduct(req, res);
      case 'PATCH':
        return await updateProduct(req, res);
      case 'DELETE':
        return await deleteProduct(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Get products with filtering and pagination
async function getProducts(req, res) {
  const { 
    page = 1, 
    limit = 20, 
    search, 
    market_id,
    category, 
    min_price,
    max_price,
    in_stock = true,
    sort = 'created_at',
    order = 'desc',
    my_products = false,
    featured = false
  } = req.query;

  try {
    const params = new URLSearchParams({
      page,
      limit: Math.min(parseInt(limit), 100), // Cap at 100
      sort,
      order,
    });

    if (search) params.append('search', search);
    if (market_id) params.append('market_id', market_id);
    if (category) params.append('category', category);
    if (min_price) params.append('min_price', min_price);
    if (max_price) params.append('max_price', max_price);
    if (in_stock !== undefined) params.append('in_stock', in_stock);
    if (featured === 'true') params.append('featured', 'true');

    let endpoint = '/products';
    let headers = {
      'Content-Type': 'application/json',
    };

    // If requesting user's products, add authentication
    if (my_products === 'true') {
      const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.auth_token;
      if (!token) {
        return res.status(401).json({ error: 'Authentication required for my products' });
      }
      endpoint = '/my-products';
      headers.Authorization = `Bearer ${token}`;
    }

    // If requesting products by market
    if (market_id && my_products !== 'true') {
      endpoint = `/markets/${market_id}/products`;
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
    console.error('Error fetching products:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
    });
  }
}

// Create new product
async function createProduct(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.auth_token;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const {
    market_id,
    name,
    description,
    price,
    stock,
    category,
    images,
    specifications,
    shipping_info,
    return_policy,
    tags,
    is_digital = false,
    digital_file_url,
    weight,
    dimensions,
  } = req.body;

  if (!market_id || !name || !description || !price) {
    return res.status(400).json({ 
      error: 'Market ID, name, description, and price are required' 
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        market_id,
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        category,
        images: Array.isArray(images) ? images : [],
        specifications: typeof specifications === 'object' ? specifications : {},
        shipping_info,
        return_policy,
        tags: Array.isArray(tags) ? tags : [],
        is_digital,
        digital_file_url,
        weight: weight ? parseFloat(weight) : null,
        dimensions: typeof dimensions === 'object' ? dimensions : null,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      return res.status(201).json({
        success: true,
        data: result.data,
        message: 'Product created successfully',
      });
    } else {
      return res.status(response.status).json({
        success: false,
        error: result.message || 'Failed to create product',
      });
    }
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create product',
    });
  }
}

// Update product
async function updateProduct(req, res) {
  const { productId } = req.query;
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.auth_token;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  // Handle special operations
  const { operation } = req.body;
  
  if (operation) {
    return await handleProductOperation(req, res, productId, operation, token);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
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
        message: 'Product updated successfully',
      });
    } else {
      return res.status(response.status).json({
        success: false,
        error: result.message || 'Failed to update product',
      });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update product',
    });
  }
}

// Handle special product operations
async function handleProductOperation(req, res, productId, operation, token) {
  let endpoint;
  let body = {};

  switch (operation) {
    case 'update_stock':
      endpoint = `/products/${productId}/stock`;
      body = { stock: req.body.stock };
      break;
    case 'activate':
      endpoint = `/products/${productId}/activate`;
      break;
    case 'deactivate':
      endpoint = `/products/${productId}/deactivate`;
      break;
    case 'feature':
      endpoint = `/products/${productId}/feature`;
      body = { featured: req.body.featured };
      break;
    default:
      return res.status(400).json({ error: 'Invalid operation' });
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (response.ok) {
      return res.status(200).json({
        success: true,
        data: result.data,
        message: `Product ${operation} successful`,
      });
    } else {
      return res.status(response.status).json({
        success: false,
        error: result.message || `Failed to ${operation} product`,
      });
    }
  } catch (error) {
    console.error(`Error ${operation} product:`, error);
    return res.status(500).json({
      success: false,
      error: `Failed to ${operation} product`,
    });
  }
}

// Delete product
async function deleteProduct(req, res) {
  const { productId } = req.query;
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.auth_token;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } else {
      const result = await response.json();
      return res.status(response.status).json({
        success: false,
        error: result.message || 'Failed to delete product',
      });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete product',
    });
  }
}
