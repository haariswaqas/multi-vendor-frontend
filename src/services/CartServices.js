// ProductServices.js

import axios from 'axios';

const FETCH_CART_URL = 'http://localhost:8003/';
const MANAGE_CART_URL = 'http://localhost:8002/'


// Update cart in localStorage
export const updateLocalStorageCart = (updatedCart) => {
  localStorage.setItem('cart', JSON.stringify(Array.from(updatedCart)));
};

/* --- Cart Functions --- */

export const fetchCart = async (token) => {
  try {
    const response = await axios.get(`${FETCH_CART_URL}cart`, {
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
      `${MANAGE_CART_URL}cart`,
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
