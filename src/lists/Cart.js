// Cart.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCartIcon, PackageIcon, CreditCardIcon, CheckCircle2, ArrowRightIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle, AlertTriangle } from '../components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { useAuth } from '../authentication/AuthContext';

// Stripe imports
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Create a single Stripe promise outside of any component.
// Replace the hardcoded key with your actual publishable key or use an environment variable.
const stripePromise = loadStripe("pk_test_51QptE2GhNAj3w1PpPodJeO4akq4jtlsXGFv01GcNQuZu20Fb12qKNwrJsBl0u9CKMfPFgBrF9VADJ4mY6DVcukye00itfYJM7l");
// For example, if you use an environment variable, you might use:
// const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

/**
 * PaymentModal Component
 * Displays the Stripe PaymentElement form inside a modal.
 */
const PaymentModal = ({ clientSecret, onPaymentSuccess, onPaymentFailed }) => {
  const stripe = useStripe();
  const elements = useElements();

  // Debug: log when the component renders
  console.log("PaymentModal rendered", { stripe, elements, clientSecret });

  const handleConfirmPayment = async () => {
    if (!stripe || !elements) {
      console.log("Stripe.js has not loaded yet.");
      return;
    }
    console.log("Confirming payment...");

    // Confirm the payment using Stripe's confirmPayment API.
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Optionally, you can add a return_url here if you wish to use redirects.
      },
      redirect: 'if_required',
    });
    if (error) {
      console.error("Payment confirmation error:", error);
      onPaymentFailed(error);
    } else {
      console.log("Payment confirmed successfully.");
      onPaymentSuccess();
    }
  };

  return (
    <div className="payment-modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-md shadow-md max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Complete Payment</h2>
        {/* If Stripe is not ready, display a loading message */}
        {!stripe ? (
          <p>Loading payment form...</p>
        ) : (
          <PaymentElement />
        )}
        <button
          onClick={handleConfirmPayment}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          disabled={!stripe}  // Disable the button until Stripe is ready.
        >
          Confirm Payment
        </button>
      </div>
    </div>
  );
};

/**
 * Cart Component
 * Handles cart display, order placement, and integrates the Stripe payment flow.
 */
const Cart = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [removalDialog, setRemovalDialog] = useState({ open: false, item: null });
  // Payment-related states
  const [clientSecret, setClientSecret] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Fetch cart items from your backend.
  const fetchCart = useCallback(async () => {
    if (!authState.token) {
      setCart([{ items: [] }]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8003/cart', {
        headers: { Authorization: `Bearer ${authState.token}` },
      });
      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        setCart([{ items: [] }]);
        return;
      }
      const validatedCart = response.data.map(cartItem => ({
        ...cartItem,
        items: Array.isArray(cartItem.items)
          ? cartItem.items.filter(item =>
              item && item.product && typeof item.product.price === 'number' && typeof item.amount === 'number'
            )
          : [],
      }));
      setCart(validatedCart);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to fetch cart';
      setError(errMsg);
      setCart([{ items: [] }]);
    } finally {
      setLoading(false);
    }
  }, [authState.token]);

  useEffect(() => {
    if (authState.isAuthenticated) {
      fetchCart();
    }
  }, [authState.isAuthenticated, fetchCart]);

  // Manage cart updates (add/remove items).
  const manageCart = async (productId, quantity, token, sizes, colors, isRemove = false) => {
    try {
      const response = await axios.put(
        'http://localhost:8002/cart',
        {
          product: { _id: productId, sizes: sizes ?? null, colors: colors ?? null },
          amount: quantity,
          isRemove,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!isRemove) {
        setTimeout(() => {
          navigate('/cart');
        }, 3000);
      }
      return response.data;
    } catch (err) {
      throw new Error(`Error ${isRemove ? 'removing' : 'adding'} product to cart: ${err.message}`);
    }
  };

  // Remove an item from the cart.
  const removeFromCart = async (productId, selectedSize, selectedColor) => {
    try {
      await manageCart(productId, 0, authState.token, selectedSize ? [selectedSize] : null, selectedColor ? [selectedColor] : null, true);
      await fetchCart();
      setRemovalDialog({ open: false, item: null });
      setTimeout(() => window.location.reload(), 200);
    } catch (err) {
      setError(err.message || 'Failed to remove product from cart');
    }
  };

  // Calculate the total amount in dollars.
  const calculateTotal = () => {
    if (!cart.length || !cart[0].items) return '0.00';
    return cart[0].items
      .reduce((total, item) => total + item.product.price * item.amount, 0)
      .toFixed(2);
  };

  /**
   * createPaymentIntent
   * Calls the backend endpoint to create a PaymentIntent.
   */
  const createPaymentIntent = async (totalCents) => {
    try {
      const response = await axios.post(
        'http://localhost:8003/create-payment-intent',
        { total: totalCents },
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log("PaymentIntent response:", response.data);
      // Use the returned client secret for Stripe confirmation.
      setClientSecret(response.data.paymentIntent);
      setShowPaymentModal(true);
    } catch (err) {
      throw new Error("Failed to create payment intent: " + err.message);
    }
  };

  /**
   * handlePlaceOrder
   * Initiates the payment process:
   * 1. Calculates the total in cents.
   * 2. Creates a PaymentIntent on the backend.
   * 3. Opens the payment modal to collect card details.
   */
  const handlePlaceOrder = async () => {
    navigate('/cart')
  };

  /**
   * handleOrderPlacement
   * After successful payment confirmation, places the order by calling the /order endpoint.
   */
  const handleOrderPlacement = async () => {
   navigate('/cart')
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ShoppingCartIcon className="w-8 h-8 text-white" />
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-white">Your Cart</h1>
              <Link to="/cart" className="ml-4 w-6 h-6 text-white">
                <ArrowRightIcon />
              </Link>
            </div>
            <span className="text-white/90">
              {cart.length > 0 ? `${cart[0].items.length} items` : 'Empty'}
            </span>
          </div>
        </div>
  
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mx-6 mt-4 bg-red-100 border border-red-300 text-red-700 rounded-md p-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
  
        {/* Success Alert */}
        {showSuccessAlert && (
          <Alert className="mx-6 mt-4 bg-green-100 border border-green-300 text-green-700 rounded-md p-3">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Order placed successfully! Redirecting...</AlertDescription>
          </Alert>
        )}
  
        {/* Cart Items */}
        <div className="p-6">
          {loading ? (
            <div className="text-center text-gray-600 py-12">
              <div className="animate-pulse flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          ) : cart.length === 0 || cart[0].items.length === 0 ? (
            <div className="text-center text-gray-600 py-12">
              <PackageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart[0].items.map(item => {
                const selectedSize = item.size || (item.product.sizes && item.product.sizes[0]) || null;
                const selectedColor = item.color || (item.product.colors && item.product.colors[0]) || null;
                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-lg p-4 flex items-center space-x-4 hover:shadow-md transition-shadow"
                  >
                    <img
                      src={item.product.img && item.product.img[0] ? item.product.img[0] : ''}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-gray-800">{item.product.name}</h3>
                      <p className="text-gray-600">{item.product.desc}</p>
                      <div className="text-gray-500 mt-1">
                        <span>Size: {selectedSize || 'None'}</span> |{' '}
                        <span>Color: {selectedColor || 'None'}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-blue-500 font-semibold">${item.product.price.toFixed(2)}</span>
                        <span className="text-gray-700 bg-gray-100 px-3 py-1 rounded-full">Units: {item.amount}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xl font-bold text-green-600">
                        ${(item.product.price * item.amount).toFixed(2)}
                      </span>
                      <button
                        onClick={() =>
                          setRemovalDialog({ open: true, item: { ...item, selectedSize, selectedColor } })
                        }
                        className="mt-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
  
        {/* Order Summary */}
        {cart.length > 0 && cart[0].items.length > 0 && (
          <div className="bg-white px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <CreditCardIcon className="w-6 h-6 text-blue-500" />
                <span className="text-xl font-semibold text-gray-800">Total</span>
              </div>
              <span className="text-2xl font-bold text-green-600">${calculateTotal()}</span>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full mt-4 bg-gray-700 hover:bg-blue-700 text-white py-3 rounded-full transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PackageIcon className="w-6 h-6" />
              <span>Place Order</span>
            </button>
          </div>
        )}
  
        {/* Removal Confirmation Dialog */}
        <AlertDialog open={removalDialog.open} onOpenChange={open => setRemovalDialog({ open, item: removalDialog.item })}>
          <AlertDialogContent className="bg-white text-gray-800 border border-gray-200 rounded-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Item</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Are you sure you want to remove &quot;{removalDialog.item?.product?.name}&quot; (Size:{' '}
                {removalDialog.item?.selectedSize || 'None'}, Color: {removalDialog.item?.selectedColor || 'None'})
                from your cart?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-md">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                onClick={() =>
                  removeFromCart(
                    removalDialog.item.product._id,
                    removalDialog.item.selectedSize,
                    removalDialog.item.selectedColor
                  )
                }
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  
      {/* Payment Modal: Rendered when a clientSecret is available */}
      {showPaymentModal && clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentModal
            clientSecret={clientSecret}
            onPaymentSuccess={handleOrderPlacement}
            onPaymentFailed={(err) => {
              setError('Payment failed: ' + err.message);
              setShowPaymentModal(false);
            }}
          />
        </Elements>
      )}
    </>
  );
  
};

export default Cart;
