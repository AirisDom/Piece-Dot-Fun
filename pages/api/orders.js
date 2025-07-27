import { URL } from "../../utils/constants";
import { getConnection } from '../../utils/web3/solanaUtils';
import { createOrderAccount, updateOrderStatus, getOrderAccount } from '../../utils/web3/smartContractUtils';

/**
 * Orders API Endpoint
 * Handles order creation, management, and blockchain operations
 */

// Create new order
export async function createOrder(orderData, token) {
  try {
    const url = `${URL}/orders/create`;
    const params = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    };

    const response = await fetch(url, params);
    const result = await response.json();

    return {
      status: response.status,
      success: response.ok,
      result,
      error: response.ok ? null : result.message || 'Failed to create order'
    };
  } catch (error) {
    console.error('Create order error:', error);
    return {
      status: 500,
      success: false,
      result: null,
      error: error.message || 'Network error'
    };
  }
}

// Get user orders
export async function getUserOrders(token, filters = {}) {
  try {
    const { page = 1, limit = 20, status, dateFrom, dateTo, marketId } = filters;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
      ...(marketId && { marketId })
    });

    const url = `${URL}/orders/user?${queryParams}`;
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
      error: response.ok ? null : result.message || 'Failed to get orders'
    };
  } catch (error) {
    console.error('Get user orders error:', error);
    return {
      status: 500,
      success: false,
      result: null,
      error: error.message || 'Network error'
    };
  }
}

// Get order by ID
export async function getOrderById(orderId, token) {
  try {
    const url = `${URL}/orders/${orderId}`;
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
      error: response.ok ? null : result.message || 'Failed to get order'
    };
  } catch (error) {
    console.error('Get order by ID error:', error);
    return {
      status: 500,
      success: false,
      result: null,
      error: error.message || 'Network error'
    };
  }
}

// Update order status
export async function updateOrder(orderId, updateData, token) {
  try {
    const url = `${URL}/orders/${orderId}`;
    const params = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    };

    const response = await fetch(url, params);
    const result = await response.json();

    return {
      status: response.status,
      success: response.ok,
      result,
      error: response.ok ? null : result.message || 'Failed to update order'
    };
  } catch (error) {
    console.error('Update order error:', error);
    return {
      status: 500,
      success: false,
      result: null,
      error: error.message || 'Network error'
    };
  }
}

// Cancel order
export async function cancelOrder(orderId, token, reason = '') {
  try {
    const url = `${URL}/orders/${orderId}/cancel`;
    const params = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    };

    const response = await fetch(url, params);
    const result = await response.json();

    return {
      status: response.status,
      success: response.ok,
      result,
      error: response.ok ? null : result.message || 'Failed to cancel order'
    };
  } catch (error) {
    console.error('Cancel order error:', error);
    return {
      status: 500,
      success: false,
      result: null,
      error: error.message || 'Network error'
    };
  }
}

// Get order tracking
export async function getOrderTracking(orderId, token) {
  try {
    const url = `${URL}/orders/${orderId}/tracking`;
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
      error: response.ok ? null : result.message || 'Failed to get order tracking'
    };
  } catch (error) {
    console.error('Get order tracking error:', error);
    return {
      status: 500,
      success: false,
      result: null,
      error: error.message || 'Network error'
    };
  }
}

// Create order on blockchain
export async function createBlockchainOrder(orderData) {
  try {
    const connection = getConnection();
    const orderAccount = await createOrderAccount({
      connection,
      ...orderData
    });

    return {
      success: true,
      orderAccount,
      transactionId: orderAccount.transactionId,
      error: null
    };
  } catch (error) {
    console.error('Create blockchain order error:', error);
    return {
      success: false,
      orderAccount: null,
      transactionId: null,
      error: error.message || 'Blockchain error'
    };
  }
}

// Update order status on blockchain
export async function updateBlockchainOrderStatus(orderId, status, userWallet) {
  try {
    const connection = getConnection();
    const result = await updateOrderStatus({
      connection,
      orderId,
      status,
      userWallet
    });

    return {
      success: true,
      result,
      error: null
    };
  } catch (error) {
    console.error('Update blockchain order status error:', error);
    return {
      success: false,
      result: null,
      error: error.message || 'Blockchain error'
    };
  }
}

// Get order from blockchain
export async function getBlockchainOrder(orderId) {
  try {
    const connection = getConnection();
    const orderAccount = await getOrderAccount(connection, orderId);

    return {
      success: true,
      orderAccount,
      error: null
    };
  } catch (error) {
    console.error('Get blockchain order error:', error);
    return {
      success: false,
      orderAccount: null,
      error: error.message || 'Blockchain error'
    };
  }
}

/**
 * Next.js API Route Handler for Orders
 */
export default async function handler(req, res) {
  const { method } = req;
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  try {
    switch (method) {
      case 'GET':
        const { orderId } = req.query;
        
        if (orderId) {
          // Get specific order
          if (orderId.includes('tracking')) {
            const actualOrderId = orderId.replace('-tracking', '');
            const result = await getOrderTracking(actualOrderId, token);
            return res.status(result.status).json(result);
          } else if (orderId.includes('blockchain')) {
            const actualOrderId = orderId.replace('-blockchain', '');
            const result = await getBlockchainOrder(actualOrderId);
            return res.status(result.success ? 200 : 500).json(result);
          } else {
            const result = await getOrderById(orderId, token);
            return res.status(result.status).json(result);
          }
        } else {
          // Get user orders with filters
          const { page, limit, status, dateFrom, dateTo, marketId } = req.query;
          const result = await getUserOrders(token, { 
            page: parseInt(page) || 1, 
            limit: parseInt(limit) || 20, 
            status, 
            dateFrom, 
            dateTo, 
            marketId 
          });
          return res.status(result.status).json(result);
        }

      case 'POST':
        const { action, blockchain, ...orderData } = req.body;
        
        if (action === 'create') {
          let result;
          
          if (blockchain) {
            // Create order on blockchain first
            const blockchainResult = await createBlockchainOrder(orderData);
            if (!blockchainResult.success) {
              return res.status(500).json(blockchainResult);
            }
            
            // Add blockchain data to order
            orderData.blockchainOrderId = blockchainResult.orderAccount.publicKey;
            orderData.transactionId = blockchainResult.transactionId;
          }
          
          result = await createOrder(orderData, token);
          return res.status(result.status).json(result);
        } else {
          return res.status(400).json({ error: 'Invalid action' });
        }

      case 'PUT':
        const { orderId: updateOrderId } = req.query;
        const { action: updateAction, status, blockchain: updateBlockchain, ...updateData } = req.body;
        
        if (!updateOrderId) {
          return res.status(400).json({ error: 'Order ID required' });
        }
        
        if (updateAction === 'cancel') {
          const result = await cancelOrder(updateOrderId, token, updateData.reason);
          return res.status(result.status).json(result);
        } else if (updateAction === 'updateStatus') {
          let result;
          
          if (updateBlockchain && updateData.userWallet) {
            // Update on blockchain first
            const blockchainResult = await updateBlockchainOrderStatus(
              updateOrderId, 
              status, 
              updateData.userWallet
            );
            if (!blockchainResult.success) {
              return res.status(500).json(blockchainResult);
            }
          }
          
          result = await updateOrder(updateOrderId, { status, ...updateData }, token);
          return res.status(result.status).json(result);
        } else {
          const result = await updateOrder(updateOrderId, updateData, token);
          return res.status(result.status).json(result);
        }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Orders API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
