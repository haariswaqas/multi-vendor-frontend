import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, PackageIcon, CreditCardIcon, CheckCircle2, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
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
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe("pk_test_51QptE2GhNAj3w1PpPodJeO4akq4jtlsXGFv01GcNQuZu20Fb12qKNwrJsBl0u9CKMfPFgBrF9VADJ4mY6DVcukye00itfYJM7l");

const PaymentModal = ({ clientSecret, onPaymentSuccess, onPaymentFailed }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleConfirmPayment = async () => {
    if (!stripe || !elements) return;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {},
      redirect: 'if_required',
    });
    
    if (error) {
      onPaymentFailed(error);
    } else {
      onPaymentSuccess();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 animate-in fade-in duration-200">
        <h2 className="text-2xl font-bold mb-6">Complete Payment</h2>
        {!stripe ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
          </div>
        ) : (
          <PaymentElement className="mb-6" />
        )}
        <button
          onClick={handleConfirmPayment}
          disabled={!stripe}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Confirm Payment
        </button>
      </div>
    </div>
  );
};

const ShoppingCart = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [removalDialog, setRemovalDialog] = useState({ open: false, item: null });
  const [clientSecret, setClientSecret] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Fetch the cart items from backend
  const fetchCart = useCallback(async () => {
    if (!authState.token) {
      setCart([{ items: [] }]);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8003/cart', {
        headers: { Authorization: `Bearer ${authState.token}` },
      });
      const validatedCart = response.data?.length
        ? response.data.map(cartItem => ({
            ...cartItem,
            items: Array.isArray(cartItem.items)
              ? cartItem.items.filter(item =>
                  item?.product?.price && typeof item.amount === 'number'
                )
              : [],
          }))
        : [{ items: [] }];
      setCart(validatedCart);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch cart');
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

  // Remove an item from the cart
  const removeFromCart = async (productId, selectedSize, selectedColor) => {
    try {
      await axios.put(
        'http://localhost:8002/cart',
        {
          product: { _id: productId, sizes: selectedSize ? [selectedSize] : null, colors: selectedColor ? [selectedColor] : null },
          amount: 0,
          isRemove: true,
        },
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
      await new Promise(resolve => setTimeout(resolve, 2000)); // Added delay of 2000ms
      await fetchCart();
      setRemovalDialog({ open: false, item: null });
    } catch (err) {
      setError(err.message || 'Failed to remove product from cart');
    }
  };

  // Calculate the cart's total amount
  const calculateTotal = () => {
    return cart[0]?.items?.reduce((total, item) => 
      total + item.product.price * item.amount, 0
    ).toFixed(2) || '0.00';
  };

  // Initiate order placement by creating a PaymentIntent
  const handlePlaceOrder = async () => {
    if (!cart[0]?.items?.length) {
      setError('Your cart is empty');
      return;
    }
    try {
      setLoading(true);
      const totalCents = Math.round(parseFloat(calculateTotal()) * 100);
      const response = await axios.post(
        'http://localhost:8003/create-payment-intent',
        { total: totalCents },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setClientSecret(response.data.paymentIntent);
      setShowPaymentModal(true);
    } catch (err) {
      setError(err.message || 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  // Finalize the order after successful payment
  const handleOrderPlacement = async () => {
    try {
      const orderResponse = await axios.post(
        'http://localhost:8003/order',
        {
          items: cart[0].items.map(item => ({
            product: { _id: item.product._id },
            amount: item.amount,
            size: item.size || item.product.sizes?.[0] || null,
            color: item.color || item.product.colors?.[0] || null,
          })),
          amount: calculateTotal(),
          status: 'Pending',
        },
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        }
      );

      if (orderResponse.status === 200) {
        setShowSuccessAlert(true);
        setTimeout(() => {
          setShowSuccessAlert(false);
          navigate('/orders');
        }, 2000);
        await fetchCart();
      }
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
      setShowPaymentModal(false);
      setClientSecret(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Cart Section */}
          <div className="flex-grow">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Cart Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <ShoppingCartIcon className="w-6 h-6 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                </div>
                <span className="text-sm text-gray-500 font-medium">
                  {cart[0]?.items?.length || 0} items
                </span>
              </div>

              {/* Alerts */}
              {error && (
                <Alert variant="destructive" className="m-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {showSuccessAlert && (
                <Alert className="m-4 bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Success</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Order placed successfully! Redirecting...
                  </AlertDescription>
                </Alert>
              )}

              {/* Cart Items List */}
              <div className="divide-y divide-gray-100">
                {loading ? (
                  <div className="p-8 flex justify-center">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                ) : !cart[0]?.items?.length ? (
                  <div className="p-8 text-center">
                    <PackageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  cart[0].items.map(item => {
                    const selectedSize = item.size || (item.product.sizes && item.product.sizes[0]) || null;
                    const selectedColor = item.color || (item.product.colors && item.product.colors[0]) || null;
                    return (
                      <div key={item._id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex gap-6">
                          <img
                            src={item.product.img?.[0] || '/api/placeholder/120/120'}
                            alt={item.product.name}
                            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-grow">
                            <div className="flex justify-between">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {item.product.name}
                              </h3>
                              <button
                                onClick={() =>
                                  setRemovalDialog({
                                    open: true,
                                    item: {
                                      ...item,
                                      selectedSize: item.size,
                                      selectedColor: item.color,
                                    },
                                  })
                                }
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{item.product.desc}</p>
                            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
    <span>Size: {selectedSize || 'None'}</span>
    <span>Color: {selectedColor || 'None'}</span>
    <span>Quantity: {item.amount}</span>
</div>
                            <div className="mt-2 font-medium text-blue-600">
                              ${(item.product.price * item.amount).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Section */}
          {cart[0]?.items?.length > 0 && (
            <div className="lg:w-96">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>${calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-blue-600">${calculateTotal()}</span>
                    </div>
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium
                             hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors focus:outline-none focus:ring-2
                             focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Removal Confirmation Dialog */}
      <AlertDialog 
        open={removalDialog.open} 
        onOpenChange={open => setRemovalDialog({ open, item: removalDialog.item })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{removalDialog.item?.product?.name}" from your cart?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                removeFromCart(
                  removalDialog.item.product._id,
                  removalDialog.item.selectedSize,
                  removalDialog.item.selectedColor
                )
              }
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Modal */}
      {showPaymentModal && clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentModal
            clientSecret={clientSecret}
            onPaymentSuccess={handleOrderPlacement}
            onPaymentFailed={(err) => {
              setError("Payment failed: " + err.message);
              setShowPaymentModal(false);
            }}
          />
        </Elements>
      )}
    </div>
  );
};

export default ShoppingCart;
