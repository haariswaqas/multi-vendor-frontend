import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../authentication/AuthContext';
import { ShoppingCart } from 'lucide-react';

const SearchResults = ({ results, onClose, isLoading }) => {
  const { authState } = useAuth();
  const [addingToCart, setAddingToCart] = useState({});

  const handleAddToCart = async (productId) => {
    if (!authState.isAuthenticated) {
      // Redirect to login or show login prompt
      return;
    }

    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    try {
      const response = await fetch('http://localhost:8003/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`
        },
        body: JSON.stringify({
          productId,
          quantity: 1
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      // Show success feedback (you could add a toast notification here)
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Show error feedback
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="absolute mt-2 w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50">
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="absolute mt-2 w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50">
        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
          No products found
        </div>
      </div>
    );
  }

  return (
    <div className="absolute mt-2 w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50">
      <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
        {results.map((product) => (
          <div 
            key={product._id}
            className="flex space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            {/* Product Image */}
            <Link 
              to={`/product/${product._id}`}
              onClick={onClose}
              className="flex-shrink-0 w-24 h-24"
            >
              <img
                src={product.img[0]}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = '/api/placeholder/96/96';
                }}
              />
            </Link>

            {/* Product Info */}
            <div className="flex-grow">
              <Link 
                to={`/product/${product._id}`}
                onClick={onClose}
                className="block"
              >
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {product.desc}
                </p>
              </Link>

              <div className="mt-2 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    ${product.price}
                  </span>
                  <div className="flex space-x-2">
                    {product.colors?.length > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {product.colors.length} colors
                      </span>
                    )}
                    {product.sizes?.length > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {product.sizes.length} sizes
                      </span>
                    )}
                  </div>
                </div>

                {authState.isAuthenticated && authState.user?.role === 'Buyer' && (
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    disabled={addingToCart[product._id] || !product.available || product.stock === 0}
                    className={`p-2 rounded-full ${
                      product.available && product.stock > 0
                        ? 'bg-primary-100 text-primary-600 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-300'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                    }`}
                  >
                    <ShoppingCart className={`h-5 w-5 ${
                      addingToCart[product._id] ? 'animate-pulse' : ''
                    }`} />
                  </button>
                )}
              </div>

              <div className="mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  product.stock > 0 
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                    : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                }`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;