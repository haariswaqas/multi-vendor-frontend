// ProductServices.js

import axios from 'axios';

const API_URL = 'http://localhost:8002/';
const CART_URL = 'http://localhost:8003/';
const USER_URL = 'http://localhost:8001/';

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




// Update Wishlist using PUT (for both adding and removing)
// ProductServices.js
export const addWishlist = async (product, amount, isRemove, token) => {
  const response = await fetch('http://localhost:8002/wishlist', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ product, amount, isRemove }),
  });
  if (!response.ok) {
    throw new Error('Failed to update wishlist');
  }
  return response.json();
};
export const removeWishlist = async (product, amount=0, isRemove = true, token) => {
  const response = await fetch('http://localhost:8002/wishlist', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ product, amount, isRemove }),
  });
  if (!response.ok) {
    throw new Error('Failed to update wishlist');
  }
  return response.json();
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
// src/services/ProductServices.js

export const fetchWishlist = async (token) => {
  try {
    const response = await fetch('http://localhost:8001/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Pass the token if your API requires authentication.
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch wishlist');
    }

    // Parse the JSON response.
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    throw error;
  }
};


// Refactored function to manage both add and remove actions in the wishlist
export const manageWishlist = async (productId, quantity, token, sizes, colors, isRemove = false) => {
  try {
    const response = await axios.put(
      `${API_URL}wishlist`,
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
    throw new Error(`Error ${isRemove ? 'removing' : 'adding'} product to wishlist: ` + error.message);
  }
};

// Usage for adding a product to the wishlist:
export const addToWishlist = async (productId, quantity, token, sizes, colors) => {
  return await manageWishlist(productId, quantity, token, sizes, colors, false); // Add to wishlist
};

// Usage for removing a product from the wishlist:
export const removeFromWishlist = async (productId, token) => {
  return await manageWishlist(productId, 0, token, [], [], true); // Remove from wishlist
};



