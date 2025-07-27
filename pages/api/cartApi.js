import { size, remove, includes } from "lodash";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const CART_STORAGE_KEY = 'piece_dot_fun_cart';
const CART_BACKUP_KEY = 'piece_dot_fun_cart_backup';

// Enhanced cart management with better error handling
export class CartAPI {
  constructor() {
    this.storageKey = CART_STORAGE_KEY;
    this.backupKey = CART_BACKUP_KEY;
  }

  // Get products from cart
  getProductsCart() {
    try {
      const cart = localStorage.getItem(this.storageKey);
      if (!cart) return [];
      
      const products = JSON.parse(cart);
      return Array.isArray(products) ? products : [];
    } catch (error) {
      console.error('Error parsing cart data:', error);
      this.recoverFromBackup();
      return [];
    }
  }

  // Save cart to localStorage with backup
  saveCart(cart) {
    try {
      const cartData = JSON.stringify(cart);
      localStorage.setItem(this.storageKey, cartData);
      localStorage.setItem(this.backupKey, cartData);
    } catch (error) {
      console.error('Error saving cart:', error);
      toast.error('Error saving cart data');
    }
  }

  // Recover cart from backup
  recoverFromBackup() {
    try {
      const backup = localStorage.getItem(this.backupKey);
      if (backup) {
        localStorage.setItem(this.storageKey, backup);
        toast.info('Cart recovered from backup');
        return JSON.parse(backup);
      }
    } catch (error) {
      console.error('Error recovering cart backup:', error);
    }
    return [];
  }

  // Add product to cart with enhanced validation
  addProductCart(product) {
    const cart = this.getProductsCart();
    
    // Enhanced product validation
    if (!product || typeof product !== 'object') {
      toast.error('Invalid product data');
      return false;
    }

    const { id, marketId, quantity = 1, price, name } = product;
    
    if (!id || !marketId) {
      toast.error('Product ID and Market ID are required');
      return false;
    }

    // Check if cart is empty or all items are from the same market
    const marketIds = cart.map(item => item.marketId);
    const uniqueMarketIds = [...new Set(marketIds)];
    
    if (uniqueMarketIds.length > 0 && !uniqueMarketIds.includes(marketId)) {
      toast.warning('Cannot add product from different market to cart');
      return false;
    }

    // Check if product already exists in cart
    const existingProductIndex = cart.findIndex(item => item.id === id);
    
    if (existingProductIndex !== -1) {
      // Update quantity if product exists
      cart[existingProductIndex].quantity += quantity;
      toast.success(`${name} quantity updated in cart`);
    } else {
      // Add new product
      cart.push({
        id,
        marketId,
        quantity,
        price,
        name,
        addedAt: new Date().toISOString(),
        ...product
      });
      toast.success(`${name} added to cart`);
    }

    this.saveCart(cart);
    return true;
  }

  // Remove product from cart
  removeProductCart(productId) {
    const cart = this.getProductsCart();
    const filteredCart = cart.filter(item => item.id !== productId);
    
    if (filteredCart.length < cart.length) {
      this.saveCart(filteredCart);
      toast.success('Product removed from cart');
      return true;
    }
    
    toast.error('Product not found in cart');
    return false;
  }

  // Update product quantity
  updateProductQuantity(productId, quantity) {
    const cart = this.getProductsCart();
    const productIndex = cart.findIndex(item => item.id === productId);
    
    if (productIndex !== -1) {
      if (quantity <= 0) {
        return this.removeProductCart(productId);
      }
      
      cart[productIndex].quantity = quantity;
      cart[productIndex].updatedAt = new Date().toISOString();
      this.saveCart(cart);
      toast.success('Cart updated');
      return true;
    }
    
    toast.error('Product not found in cart');
    return false;
  }

  // Count products in cart
  countProductsCart() {
    const cart = this.getProductsCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  // Calculate cart total
  calculateCartTotal() {
    const cart = this.getProductsCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Clear entire cart
  clearCart() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.backupKey);
    toast.success('Cart cleared');
  }

  // Check if product is in cart
  isProductInCart(productId) {
    const cart = this.getProductsCart();
    return cart.some(item => item.id === productId);
  }

  // Get cart summary
  getCartSummary() {
    const cart = this.getProductsCart();
    const totalItems = this.countProductsCart();
    const totalAmount = this.calculateCartTotal();
    const marketIds = [...new Set(cart.map(item => item.marketId))];

    return {
      items: cart,
      totalItems,
      totalAmount,
      marketCount: marketIds.length,
      marketIds,
      isEmpty: cart.length === 0,
    };
  }

  // Sync cart with backend
  async syncWithBackend() {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return false;

      const cart = this.getProductsCart();
      
      const response = await fetch(`${API_BASE_URL}/cart/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cart }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Cart synced with backend:', data);
        return true;
      }
    } catch (error) {
      console.error('Cart sync failed:', error);
    }
    return false;
  }

  // Load cart from backend
  async loadFromBackend() {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return false;

      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const backendCart = data.data || [];
        
        // Convert backend format to local format
        const localCart = backendCart.map(item => ({
          id: item.product_id,
          marketId: item.product?.market_id,
          quantity: item.quantity,
          price: item.product?.price,
          name: item.product?.name,
          ...item.product,
          cartItemId: item.id,
        }));

        this.saveCart(localCart);
        return true;
      }
    } catch (error) {
      console.error('Failed to load cart from backend:', error);
    }
    return false;
  }

  // Validate cart items (check if products still exist and are available)
  async validateCartItems() {
    const cart = this.getProductsCart();
    const validatedCart = [];
    let hasChanges = false;

    for (const item of cart) {
      try {
        const response = await fetch(`${API_BASE_URL}/products/${item.id}`);
        if (response.ok) {
          const productData = await response.json();
          const product = productData.data;
          
          if (product.is_active && product.stock >= item.quantity) {
            // Update with latest product data
            validatedCart.push({
              ...item,
              price: product.price,
              name: product.name,
              stock: product.stock,
            });
          } else {
            hasChanges = true;
            if (!product.is_active) {
              toast.warning(`${item.name} is no longer available`);
            } else if (product.stock < item.quantity) {
              toast.warning(`${item.name} quantity reduced to ${product.stock}`);
              validatedCart.push({
                ...item,
                quantity: product.stock,
                price: product.price,
                name: product.name,
                stock: product.stock,
              });
            }
          }
        } else {
          hasChanges = true;
          toast.warning(`${item.name} is no longer available`);
        }
      } catch (error) {
        console.error(`Error validating product ${item.id}:`, error);
        // Keep item in cart if validation fails
        validatedCart.push(item);
      }
    }

    if (hasChanges) {
      this.saveCart(validatedCart);
      toast.info('Cart updated based on product availability');
    }

    return validatedCart;
  }
}

// Legacy functions for backward compatibility
export function getProductsCart() {
  return new CartAPI().getProductsCart();
}

export function addProductCart(product) {
  return new CartAPI().addProductCart(product);
}

export function countProductsCart() {
  return new CartAPI().countProductsCart();
}

export function removeProductCart(productId) {
  return new CartAPI().removeProductCart(productId);
}

export function clearCart() {
  return new CartAPI().clearCart();
}

export function isProductInCart(productId) {
  return new CartAPI().isProductInCart(productId);
}

// Export cart instance
export const cartAPI = new CartAPI();

export default cartAPI;

export function removeProductCart(product) {
  let cart = getProductsCart();

  const indexToRemove = cart.findIndex((item) => item === product);

  if (indexToRemove > -1) {
    cart.splice(indexToRemove, 1);

    if (cart.length > 0) {
      localStorage.setItem(CART, cart);
    } else {
      localStorage.removeItem(CART);
    }
  }
}

export function removeAllProductsCart() {
  localStorage.removeItem(CART);
}

export async function payUserTokens(formData) {
  console.log(formData);

  try {
    const url = `${URL}/token/payTokens`;
    const params = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };

    const response = await fetch(url, params);

    const data = {
      status: response.status,
      result: await response.json(),
    };

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function transferTokens(formData) {
  try {
    const url = `${URL}/token/transferTokens`;
    const params = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };

    const response = await fetch(url, params);

    const data = {
      status: response.status,
      result: await response.json(),
    };

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function burnTokens(formData) {
  console.log(formData);
  try {
    const url = `${URL}/token/burnTokens`;
    const params = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };

    const response = await fetch(url, params);

    const data = {
      status: response.status,
      result: await response.json(),
    };

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}
