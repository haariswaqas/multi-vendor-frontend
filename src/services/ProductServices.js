// ProductServices.js

import axios from 'axios';

const API_URL = 'http://localhost:8002/';
const CART_URL = 'http://localhost:8003/';

// Fetch all products
export const fetchProducts = async (token) => {
  try {
    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    return data.products;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch products');
  }
};



// Delete a product (for sellers)
export const deleteProduct = async (someProductId, token) => {
  try {
    const response = await axios.delete(`${API_URL}product/${someProductId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data;
  } catch (error) {
    throw new Error('Error deleting the product: You cannot DELETE this Product; it does not belong to you ');
  }
};

// Fetch products by category
export const fetchProductsByCategory = async (token, type) => {
  try {
    const response = await fetch(`${API_URL}category/${type}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch products by category')
    }
    const data = await response.json();
    return data; // Directly return the data, not data.products
  } catch (error) {
    throw new Error(error.message || 'failed to fetch products by category')
  }
};

// Update wishlist in localStorage (if needed on the frontend)
export const updateLocalStorageWishlist = (updatedWishlist) => {
  localStorage.setItem('wishlist', JSON.stringify(Array.from(updatedWishlist)));
};

// Update cart in localStorage
export const updateLocalStorageCart = (updatedCart) => {
  localStorage.setItem('cart', JSON.stringify(Array.from(updatedCart)));
};

/* --- Wishlist Functions --- */

// Add to Wishlist (POST)
// Using POST is a common RESTful pattern for creating a new wishlist entry.
export const addToWishlist = async (productId, token, productDetails = {}) => {
  try {
    const payload = {
      product: {
        _id: productId,
        // Pass sizes/colors if available; otherwise, default to empty arrays.
        sizes: productDetails.sizes || [],
        colors: productDetails.colors || [],
      },
      amount: 1, // amount can be used if needed; typically 1 for wishlist items
    };

    const response = await axios.post(
      `${API_URL}wishlist`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Error adding product to wishlist: ' + error.message);
  }
};

// Remove from Wishlist (DELETE)
export const removeFromWishlist = async (productId, token) => {
  try {
    const response = await axios.delete(`${API_URL}wishlist/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Error removing product from wishlist: ' + error.message);
  }
};
export const getWishlist = async (token) => {
  const response = await axios.get(`${API_URL}/wishlist`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
/* --- Cart Functions --- */

export const fetchCart = async (token) => {
  try {
    const response = await axios.get(`${CART_URL}cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data; // Return the cart data
  } catch (error) {
    throw new Error('Error fetching cart: ' + error.message);
  }
};

// Refactored function to manage both add and remove actions in the cart
export const manageCart = async (productId, quantity, token, sizes, colors, isRemove = false) => {
  try {
    const response = await axios.put(
      `${API_URL}cart`,
      {
        product: { _id: productId, sizes, colors },
        amount: quantity,
        isRemove: isRemove,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error ${isRemove ? 'removing' : 'adding'} product to cart: ` + error.message);
  }
};

// Usage for adding a product to the cart:
export const addToCart = async (productId, quantity, token, sizes, colors) => {
  return await manageCart(productId, quantity, token, sizes, colors, false); // Add to cart
};

// Usage for removing a product from the cart:
export const removeFromCart = async (productId, token) => {
  return await manageCart(productId, 0, token, [], [], true); // Remove from cart
};

// Fetch wishlist data from backend
export const fetchWishlist = async (token) => {
  try {
    const response = await axios.get(`${API_URL}wishlist`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data;
  } catch (error) {
    throw new Error('Error fetching wishlist: ' + error.message);
  }
};


