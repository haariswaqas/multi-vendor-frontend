// ProductDetail.jsx
import React, { useEffect, useReducer, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../authentication/AuthContext';
import { deleteProduct, manageCart, manageWishlist } from '../services/ProductServices';
import { ShoppingCart, Trash2, Edit, Trash } from 'lucide-react';
import ImageCarousel from '../components/ui/ImageCarousel'; // Adjust the path as needed

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
    size: null,
    color: null,
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
        selectedOptions: {
          ...state.selectedOptions,
          ...Object.fromEntries(
            Object.entries(action.payload).map(([key, value]) => [key, value || null])
          ),
        },
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

  // Fetch product details, seller details, and cart data from the APIs
  useEffect(() => {
    const fetchProductAndSellerDetails = async () => {
      try {
        const [productResponse, cartResponse] = await Promise.all([
          fetch(`http://localhost:8002/${id}`, {
            headers: { Authorization: `Bearer ${authState.token}` },
          }),
          fetch('http://localhost:8003/cart', {
            headers: { Authorization: `Bearer ${authState.token}` },
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
              headers: { Authorization: `Bearer ${authState.token}` },
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
              img: sellerData.img, // If available
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

  // Update selected options and quantity if product is already in the cart
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

  // Determine if the product is already in the cart using string comparison
  const isProductInCart = state.cartItems.some((item) => {
    if (typeof item.product === 'string') {
      return String(item.product) === String(state.product._id);
    }
    return String(item?.product?._id) === String(state.product._id);
  });

  // Determine if the current user is the seller of the product
  const isSeller = state.sellerDetails.id === authState.user._id;

  // Handler to add the product to the cart and navigate to /cart after a short delay
  const handleAddToCart = useCallback(async () => {
    try {
      if (!authState.isAuthenticated) {
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: 'Please login to manage cart',
        });
        return;
      }

      // Update the backend cart
      await manageCart(
        id,
        state.quantity,
        authState.token,
        state.selectedOptions.size ? [state.selectedOptions.size] : null,
        state.selectedOptions.color ? [state.selectedOptions.color] : null,
        false
      );

      // Re-fetch the updated cart data
      const cartResponse = await fetch('http://localhost:8003/cart', {
        headers: { Authorization: `Bearer ${authState.token}` },
      });
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        const items = Array.isArray(cartData)
          ? cartData
          : cartData.products || [];
        dispatch({ type: ACTIONS.SET_CART_ITEMS, payload: items });
      }

      // Clear any previous errors
      dispatch({ type: ACTIONS.SET_ERROR, payload: '' });

      // Delay before navigating to the cart page
      setTimeout(() => {
        navigate('/cart');
      }, 3000);
    } catch (err) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: err.message || 'An error occurred while adding the product.',
      });
    }
  }, [authState, id, state.quantity, state.selectedOptions, navigate]);

  // Handler to remove the product from the cart
  const handleRemoveFromCart = useCallback(async () => {
    try {
      if (!authState.isAuthenticated) {
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: 'Please login to manage cart',
        });
        return;
      }

      // Remove the product from the backend cart
      await manageCart(id, 0, authState.token, [], [], true);

      // Re-fetch the updated cart data
      const cartResponse = await fetch('http://localhost:8003/cart', {
        headers: { Authorization: `Bearer ${authState.token}` },
      });
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        const items = Array.isArray(cartData)
          ? cartData
          : cartData.products || [];
        dispatch({ type: ACTIONS.SET_CART_ITEMS, payload: items });
      }

      // Reset selected options and quantity to defaults
      dispatch({
        type: ACTIONS.UPDATE_SELECTED_OPTIONS,
        payload: { size: '', color: '' },
      });
      dispatch({ type: ACTIONS.SET_QUANTITY, payload: 1 });
      dispatch({ type: ACTIONS.SET_ERROR, payload: '' });
    } catch (err) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: err.message || 'An error occurred while removing the product.',
      });
    }
  }, [authState, id]);

  // Handlers for editing and deleting products (only shown for the seller)
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
      <div className="min-h-screen bg-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-md text-center">
            {state.error}
          </div>
        </div>
      </div>
    );
  }

  // Show a loading indicator while data is being fetched
  if (state.isLoading || !state.product) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-gray-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">
            {state.product.name}
          </h2>
          <div className="lg:flex lg:space-x-8">
            {/* Product Image Carousel */}
            <div className="lg:w-1/2 mb-8 lg:mb-0">
              <ImageCarousel
                images={state.product.img}
                alt={state.product.name}
              />
            </div>
            {/* Product Details */}
            <div className="lg:w-1/2 space-y-6">
              <p className="text-gray-700 text-lg leading-relaxed">
                {state.product.desc}
              </p>
              <div className="text-2xl font-semibold text-blue-600">
                Price: ${state.product.price}
              </div>
              <div className="text-gray-600">
                <span className="font-medium">Type:</span> {state.product.type}
              </div>
              <div className="text-gray-600">
                <span className="font-medium">Available:</span>{' '}
                {state.product.available ? 'Yes' : 'No'}
              </div>
              <div className="text-gray-600">
                <span className="font-medium">Stock:</span>{' '}
                {state.product.stock}
              </div>

              {/* Only show purchase options if the current user is not the seller */}
              {!isSeller && (
                <>
                  {/* Options */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Size Selector */}
                    <div>
                      <label className="block text-gray-800 text-sm font-medium mb-2">
                        Size:
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-md p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={state.selectedOptions.size || ''}
                        onChange={(e) =>
                          dispatch({
                            type: ACTIONS.UPDATE_SELECTED_OPTIONS,
                            payload: { size: e.target.value || null },
                          })
                        }
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
                      <label className="block text-gray-800 text-sm font-medium mb-2">
                        Color:
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-md p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={state.selectedOptions.color || ''}
                        onChange={(e) =>
                          dispatch({
                            type: ACTIONS.UPDATE_SELECTED_OPTIONS,
                            payload: { color: e.target.value || null },
                          })
                        }
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
                    <div className="sm:col-span-2">
                      <label className="block text-gray-800 text-sm font-medium mb-2">
                        Quantity:
                      </label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-md p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={state.quantity}
                        min="1"
                        onChange={(e) =>
                          dispatch({
                            type: ACTIONS.SET_QUANTITY,
                            payload: parseInt(e.target.value, 10) || 1,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Cart Action Button */}
                  <div className="pt-4">
                    {!isProductInCart ? (
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
                </>
              )}

              {/* Seller Information */}
              <div className="text-gray-600 text-sm pt-4 flex items-center gap-2">
                {state.sellerDetails.img && (
                  <img
                    src={state.sellerDetails.img}
                    alt={state.sellerDetails.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span>
                  Seller:{' '}
                  {state.sellerDetails.id ? (
                    <Link
                      to={`/seller/${state.sellerDetails.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {state.sellerDetails.name}
                    </Link>
                  ) : (
                    state.sellerDetails.name
                  )}
                </span>
                {state.sellerDetails.error && (
                  <span className="text-red-500 ml-2">
                    (Error fetching seller details)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Admin Controls: Only shown if the current user is the seller */}
          {isSeller && (
            <div className="flex justify-center mt-8 space-x-4">
              <button
                onClick={handleEditClick}
                className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                <Edit className="w-5 h-5 mr-2" />
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
    </div>
  );
};

export default ProductDetail;
