import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../authentication/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, PackageIcon, CreditCardIcon, CheckCircle2 } from 'lucide-react';
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

const Cart = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [removalDialog, setRemovalDialog] = useState({ open: false, item: null });


  // Fetch cart items from API
  const fetchCart = useCallback(async () => {
    if (!authState.token) {
      setCart([{ items: [] }]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:8003/cart', {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Ensure the response is an array and has the expected structure.
      if (!response.data || !Array.isArray(response.data)) {
        setCart([{ items: [] }]);
        return;
      }
      if (response.data.length === 0) {
        setCart([{ items: [] }]);
        return;
      }

      const validatedCart = response.data.map((cart) => ({
        ...cart,
        items: Array.isArray(cart.items)
          ? cart.items.filter(
              (item) =>
                item &&
                item.product &&
                typeof item.product.price === 'number' &&
                typeof item.amount === 'number'
            )
          : [],
      }));

      setCart(validatedCart);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Failed to fetch cart';
      setError(errorMessage);
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

  // Local manageCart function
  const manageCart = async (
    productId,
    quantity,
    token,
    sizes,
    colors,
    isRemove = false
  ) => {
    try {
      const response = await axios.put(
        'http://localhost:8002/cart',
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
      
      // For add actions, wait 3 seconds then navigate to /cart
      if (!isRemove) {
        setTimeout(() => {
          navigate('/cart');
        }, 3000);
      }
  
      return response.data;
      
    } catch (error) {
      throw new Error(
        `Error ${isRemove ? 'removing' : 'adding'} product to cart: ${error.message}`
      );
    }
  };

 // Updated removeFromCart to use AlertDialog
 const removeFromCart = async (productId, selectedSize, selectedColor, productName) => {
  try {
    await manageCart(productId, 0, authState.token, [selectedSize], [selectedColor], true);
    await fetchCart();
    setRemovalDialog({ open: false, item: null });
  } catch (err) {
    setError(err.message || 'Failed to remove product from cart');
  }
};

  // Calculate total cart amount
  const calculateTotal = () => {
    if (!cart.length || !cart[0].items) return '0.00';
    return cart[0].items
      .reduce((total, item) => total + item.product.price * item.amount, 0)
      .toFixed(2);
  };

  const handlePlaceOrder = async () => {
    if (!cart.length || !cart[0].items || cart[0].items.length === 0) {
      setError('Your cart is empty. Please add items to the cart.');
      return;
    }

    const orderPayload = {
      items: cart[0].items.map((item) => ({
        product: { _id: item.product._id },
        amount: item.amount,
        size: item.size || (item.product.sizes && item.product.sizes[0]) || 'N/A',
        color: item.color || (item.product.colors && item.product.colors[0]) || 'N/A',
      })),
      amount: calculateTotal(),
      status: 'Pending',
    };

    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8003/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to place order`);
      }

      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false);
        navigate('/orders');
      }, 2000);
      await fetchCart();
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-white/20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ShoppingCartIcon className="w-8 h-8 text-blue-300" />
            <h1 className="text-3xl font-bold text-white">Your Cart</h1>
            <span className="text-white/75">
              {cart.length > 0 ? `${cart[0].items.length} items` : 'Empty'}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mx-6 mt-4">
            <Alert className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {showSuccessAlert && (
          <Alert className="mx-6 mt-4 bg-green-500/20 text-green-200 border-green-500/50">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Order placed successfully! Redirecting...</AlertDescription>
          </Alert>
        )}

        {/* Cart Items */}
        <div className="p-6">
          {loading ? (
            <div className="text-center text-white/75 py-12">
              <div className="animate-pulse flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          ) : cart.length === 0 || cart[0].items.length === 0 ? (
            <div className="text-center text-white/75 py-12">
              <PackageIcon className="w-16 h-16 mx-auto mb-4 text-white/50" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart[0].items.map((item) => {
                const selectedSize = item.size || (item.product.sizes && item.product.sizes[0]) || 'N/A';
                const selectedColor = item.color || (item.product.colors && item.product.colors[0]) || 'N/A';
                return (
                  <div
                    key={item._id}
                    className="bg-white/10 rounded-lg p-4 flex items-center space-x-4 hover:bg-white/20 transition-all"
                  >
                    <img
                      src={item.product.img && item.product.img[0] ? item.product.img[0] : ''}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-white">
                        {item.product.name}
                      </h3>
                      <p className="text-white/75">{item.product.desc}</p>
                      <div className="text-white/75 mt-1">
                        <span>Size: {selectedSize}</span> |{' '}
                        <span>Color: {selectedColor}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-blue-300 font-semibold">
                          ${item.product.price.toFixed(2)}
                        </span>
                        <span className="text-white bg-white/10 px-3 py-1 rounded-full">
                          Units: {item.amount}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xl font-bold text-green-300">
                        ${(item.product.price * item.amount).toFixed(2)}
                      </span>
                      <button
                        onClick={() => setRemovalDialog({
                          open: true,
                          item: { ...item, selectedSize, selectedColor }
                        })}
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
          <div className="bg-white/20 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <CreditCardIcon className="w-6 h-6 text-blue-300" />
                <span className="text-xl font-semibold text-white">Total</span>
              </div>
              <span className="text-2xl font-bold text-green-300">
                ${calculateTotal()}
              </span>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full mt-4 bg-blue-600/70 text-white py-3 rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PackageIcon className="w-6 h-6" />
              <span>Place Order</span>
            </button>
          </div>
        )}

        {/* Removal Confirmation Dialog */}
        <AlertDialog 
          open={removalDialog.open} 
          onOpenChange={(open) => setRemovalDialog({ open, item: removalDialog.item })}
        >
          <AlertDialogContent className="bg-gray-900 text-white border border-gray-800">
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Item</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Are you sure you want to remove "{removalDialog.item?.product?.name}" 
                (Size: {removalDialog.item?.selectedSize}, Color: {removalDialog.item?.selectedColor}) 
                from your cart?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => 
                  removeFromCart(
                    removalDialog.item.product._id,
                    removalDialog.item.selectedSize,
                    removalDialog.item.selectedColor,
                    removalDialog.item.product.name
                  )
                }
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Cart;