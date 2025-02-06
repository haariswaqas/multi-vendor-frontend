import React, { useEffect, useReducer, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../authentication/AuthContext';
import { deleteProduct, manageCart } from '../services/ProductServices';
import { ShoppingCart, Trash2, Edit, Trash } from "lucide-react";

// Initial state for the reducer
const initialState = {
  product: null,
  sellerDetails: {
    name: 'Loading...',
    id: null,
    error: null,
  },
  cartItems: [],
  selectedOptions: {
    size: '',
    color: '',
  },
  quantity: 1,
  error: '',
  isLoading: true,
};

// Action types for clarity in our reducer
const ACTIONS = {
  SET_PRODUCT: 'SET_PRODUCT',
  SET_SELLER_DETAILS: 'SET_SELLER_DETAILS',
  SET_CART_ITEMS: 'SET_CART_ITEMS',
  UPDATE_SELECTED_OPTIONS: 'UPDATE_SELECTED_OPTIONS',
  SET_QUANTITY: 'SET_QUANTITY',
  SET_ERROR: 'SET_ERROR',
  SET_LOADING: 'SET_LOADING',
  RESET_STATE: 'RESET_STATE',
};

// Reducer function to update state based on dispatched actions
function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_PRODUCT:
      return { ...state, product: action.payload, isLoading: false };
    case ACTIONS.SET_SELLER_DETAILS:
      return { ...state, sellerDetails: action.payload };
    case ACTIONS.SET_CART_ITEMS:
      return { ...state, cartItems: action.payload };
    case ACTIONS.UPDATE_SELECTED_OPTIONS:
      return {
        ...state,
        selectedOptions: { ...state.selectedOptions, ...action.payload },
      };
    case ACTIONS.SET_QUANTITY:
      return { ...state, quantity: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ACTIONS.RESET_STATE:
      return initialState;
    default:
      return state;
  }
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  // Fetch product details and cart data from the APIs
  useEffect(() => {
    const fetchProductAndSellerDetails = async () => {
      try {
        const [productResponse, cartResponse] = await Promise.all([
          fetch(`http://localhost:8002/${id}`, {
            headers: { 'Authorization': `Bearer ${authState.token}` },
          }),
          fetch("http://localhost:8003/cart", {
            headers: { 'Authorization': `Bearer ${authState.token}` },
          }),
        ]);

        if (!productResponse.ok) {
          throw new Error('Failed to fetch product details');
        }

        const productData = await productResponse.json();
        dispatch({ type: ACTIONS.SET_PRODUCT, payload: productData });

        if (cartResponse.ok) {
          const cartData = await cartResponse.json();
          const items = Array.isArray(cartData)
            ? cartData
            : cartData.products || [];
          dispatch({ type: ACTIONS.SET_CART_ITEMS, payload: items });
        }

        // Fetch seller details if available
        if (productData.seller) {
          const sellerResponse = await fetch(
            `http://localhost:8001/seller-profile/${productData.seller}`,
            {
              headers: { 'Authorization': `Bearer ${authState.token}` },
            }
          );
          if (!sellerResponse.ok) {
            throw new Error('Failed to fetch seller details');
          }
          const sellerData = await sellerResponse.json();
          dispatch({
            type: ACTIONS.SET_SELLER_DETAILS,
            payload: {
              name: sellerData.name || 'Name not available',
              id: productData.seller,
              error: null,
            },
          });
        }
      } catch (err) {
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: err.message || 'Failed to fetch details',
        });
      }
    };

    fetchProductAndSellerDetails();

    // Reset state on unmount
    return () => {
      dispatch({ type: ACTIONS.RESET_STATE });
    };
  }, [id, authState.token]);

  // Update selected options and quantity when product and cartItems are available
  useEffect(() => {
    if (state.product && state.cartItems.length > 0) {
      const cartEntry = state.cartItems.find((item) => {
        if (typeof item.product === 'string') {
          return String(item.product) === String(state.product._id);
        }
        return String(item?.product?._id) === String(state.product._id);
      });
      if (cartEntry) {
        dispatch({
          type: ACTIONS.UPDATE_SELECTED_OPTIONS,
          payload: { size: cartEntry.size, color: cartEntry.color },
        });
        dispatch({ type: ACTIONS.SET_QUANTITY, payload: cartEntry.quantity });
      }
    }
  }, [state.product, state.cartItems]);

  // Handler to add the product to the cart and then navigate to /cart after a delay
  const handleAddToCart = useCallback(async () => {
    try {
      if (!authState.isAuthenticated) {
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: "Please login to manage cart",
        });
        return;
      }

      if (!state.selectedOptions.size || !state.selectedOptions.color) {
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: "Please select both size and color before adding to cart.",
        });
        return;
      }

      // Update the backend cart
      await manageCart(
        id,
        state.quantity,
        authState.token,
        [state.selectedOptions.size],
        [state.selectedOptions.color],
        false
      );

      // Re-fetch the updated cart data
      const cartResponse = await fetch("http://localhost:8003/cart", {
        headers: { 'Authorization': `Bearer ${authState.token}` },
      });
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        const items = Array.isArray(cartData)
          ? cartData
          : cartData.products || [];
        dispatch({ type: ACTIONS.SET_CART_ITEMS, payload: items });
      }

      // Clear any previous errors
      dispatch({ type: ACTIONS.SET_ERROR, payload: "" });

      // Delay for 3 seconds before navigating to the cart page
      setTimeout(() => {
        navigate('/cart');
      }, 2000);
    } catch (err) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: err.message || "An error occurred while adding the product.",
      });
    }
  }, [
    authState,
    id,
    state.quantity,
    state.selectedOptions,
    navigate,
  ]);

  // Handler to remove the product from the cart
  const handleRemoveFromCart = useCallback(async () => {
    try {
      if (!authState.isAuthenticated) {
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: "Please login to manage cart",
        });
        
        return;
      }

      // Remove the product from the backend cart
      await manageCart(id, 0, authState.token, [], [], true);

      // Re-fetch the updated cart data
      const cartResponse = await fetch("http://localhost:8003/cart", {
        headers: { 'Authorization': `Bearer ${authState.token}` },
      });
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        const items = Array.isArray(cartData)
          ? cartData
          : cartData.products || [];
        dispatch({ type: ACTIONS.SET_CART_ITEMS, payload: items });
      }

      // Reset the selected options and quantity to default values
      dispatch({ type: ACTIONS.UPDATE_SELECTED_OPTIONS, payload: { size: '', color: '' } });
      dispatch({ type: ACTIONS.SET_QUANTITY, payload: 1 });
      dispatch({ type: ACTIONS.SET_ERROR, payload: "" });
    } catch (err) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: err.message || "An error occurred while removing the product.",
      });
    }
  }, [authState, id]);

  // Handlers for editing and deleting products (shown only for non-buyers)
  const handleEditClick = () => navigate(`/edit-product/${id}`);
  const handleDeleteClick = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id, authState.token);
        alert('Product deleted successfully');
        navigate('/products');
      } catch (err) {
        alert(err.message || 'Failed to delete product');
      }
    }
  };

  // Display error message if one exists
  if (state.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-12 px-6">
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg text-center">
          {state.error}
        </div>
      </div>
    );
  }

  // Show a loading indicator while fetching data
  if (state.isLoading || !state.product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-12 px-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  // Determine if the product is in the cart using string comparison
  const isProductInCart = state.cartItems.some((item) => {
    if (typeof item.product === 'string') {
      return String(item.product) === String(state.product._id);
    }
    return String(item?.product?._id) === String(state.product._id);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-12 px-6 relative">
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl"></div>

      <div className="container mx-auto max-w-4xl bg-white/10 backdrop-blur-lg rounded-xl p-6">
        <h2 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
          {state.product.name}
        </h2>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/2">
            <img
              src={state.product.img[0]}
              alt={state.product.name}
              className="w-full h-auto object-cover rounded-lg shadow-xl"
            />
          </div>

          <div className="flex-1 space-y-6">
            <p className="text-white text-lg leading-relaxed">{state.product.desc}</p>
            <p className="text-2xl font-bold text-blue-300">Price: ${state.product.price}</p>
            <p className="text-white">Type: {state.product.type}</p>
            <p className="text-white">Available: {state.product.available ? 'Yes' : 'No'}</p>
            <p className="text-white">Stock: {state.product.stock}</p>

            <div className="space-y-4">
              {/* Size Selector */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">Size:</label>
                <select
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={state.selectedOptions.size}
                  onChange={(e) =>
                    dispatch({
                      type: ACTIONS.UPDATE_SELECTED_OPTIONS,
                      payload: { size: e.target.value },
                    })
                  }
                  disabled={isProductInCart}
                >
                  <option value="">Select size</option>
                  {state.product.sizes?.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color Selector */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">Color:</label>
                <select
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={state.selectedOptions.color}
                  onChange={(e) =>
                    dispatch({
                      type: ACTIONS.UPDATE_SELECTED_OPTIONS,
                      payload: { color: e.target.value },
                    })
                  }
                  disabled={isProductInCart}
                >
                  <option value="">Select color</option>
                  {state.product.colors?.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">Quantity:</label>
                <input
                  type="number"
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={state.quantity}
                  min="1"
                  onChange={(e) =>
                    dispatch({
                      type: ACTIONS.SET_QUANTITY,
                      payload: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  disabled={isProductInCart}
                />
              </div>

              {/* Conditional Cart Button */}
              <div className="pt-4">
                { !isProductInCart ? (
                  <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </button>
                ) : (
                  <button
                    onClick={handleRemoveFromCart}
                    className="w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Remove
                  </button>
                )}
              </div>
            </div>

            <p className="text-white pt-4">
              Seller:{' '}
              {state.sellerDetails.id ? (
                <Link to={`/seller/${state.sellerDetails.id}`} className="text-blue-300 hover:underline">
                  {state.sellerDetails.name}
                </Link>
              ) : (
                state.sellerDetails.name
              )}
              {state.sellerDetails.error && (
                <span className="text-red-400 ml-2">(Error fetching seller details)</span>
              )}
            </p>
          </div>
        </div>

        {/* Admin Controls: Only shown if authState.role is not "buyer" */}
        { authState.user.role !== "Buyer" && (
          <div className="flex justify-center mt-8 space-x-4">
            <button
              onClick={handleEditClick}
              className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              <Edit className="w-5 h-n mr-2" />
              Edit Product
            </button>
            <button
              onClick={handleDeleteClick}
              className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
            >
              <Trash className="w-5 h-5 mr-2" />
              Delete Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
