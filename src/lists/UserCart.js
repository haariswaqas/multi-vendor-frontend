import React, { useState, useEffect } from 'react';
import { fetchCart } from '../services/ProductServices'; // Ensure correct import path for ProductServices
import { useAuth } from '../authentication/AuthContext'; // Import the useAuth hook to access the token from context

const UserCart = () => {
  const { authState } = useAuth(); // Access the authState to get the token
  const [cart, setCart] = useState([]);
  const [error, setError] = useState(null);

  // Fetch the cart data when the component mounts
  useEffect(() => {
    const getCartData = async () => {
      try {
        if (authState.token) {
          const cartData = await fetchCart(authState.token); // Use the token from the context
          setCart(cartData); // Set the cart data when successfully fetched
        } else {
          setError('No token found'); // If there's no token, set an error
        }
      } catch (err) {
        setError(err.message); // Set error message if there's any issue fetching data
      }
    };

    if (authState.token) {
      getCartData();
    }
  }, [authState.token]); // This will trigger useEffect whenever the token changes

  if (error) {
    return <div>Error fetching cart: {error}</div>; // Display the error message if an error occurs
  }

  if (!cart || cart.length === 0) {
    return <div>Your cart is empty</div>; // Show this if the cart is empty
  }

  return (
    <div>
      <h2>Your Cart</h2>
      <ul>
        {cart.map((item, index) => (
          <li key={index}>
            <div>
              <p>Product: {item.name}</p>
              <p>Price: {item.price}</p>
              <p>Quantity: {item.quantity}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserCart;
