import React, { useEffect, useState } from 'react';
import { useAuth } from '../authentication/AuthContext';
import { fetchProducts, getWishlist, addToWishlist, removeFromWishlist } from '../services/ProductServices';
import ProductCard from './ProductCard';

const ProductList = () => {
  const { authState } = useAuth();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [wishlist, setWishlist] = useState(new Set());
  const [loadingWishlist, setLoadingWishlist] = useState(new Map());

  // Fetch wishlist from the backend on mount
  useEffect(() => {
    const fetchWishlistFromService = async () => {
      try {
        const wishlistData = await getWishlist(authState.token);
        setWishlist(new Set(wishlistData.map((item) => item._id))); // Store IDs as a Set
        localStorage.setItem('wishlist', JSON.stringify(wishlistData.map((item) => item._id))); // Sync to localStorage
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
      }
    };

    if (authState.token) {
      fetchWishlistFromService();
    }
  }, [authState.token]);

  // Fetch products from backend
  useEffect(() => {
    const fetchProductsFromService = async () => {
      try {
        const data = await fetchProducts(authState.token);
        setProducts(data);
      } catch (error) {
        setError(error.message || 'Failed to fetch products');
      }
    };

    fetchProductsFromService();
  }, [authState.token]);

  // Add to Wishlist
  const addToWishlistFromService = async (productId) => {
    setLoadingWishlist((prev) => new Map(prev).set(productId, true));
    try {
      await addToWishlist(productId, authState.token);
      setWishlist((prev) => new Set(prev).add(productId));
      localStorage.setItem('wishlist', JSON.stringify(Array.from(wishlist).concat(productId)));
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    } finally {
      setLoadingWishlist((prev) => {
        const updatedLoading = new Map(prev);
        updatedLoading.delete(productId);
        return updatedLoading;
      });
    }
  };

  // Remove from Wishlist
  const removeFromWishlistFromService = async (productId) => {
    setLoadingWishlist((prev) => new Map(prev).set(productId, true));
    try {
      await removeFromWishlist(productId, authState.token);
      setWishlist((prev) => {
        const updatedWishlist = new Set(prev);
        updatedWishlist.delete(productId);
        return updatedWishlist;
      });
      localStorage.setItem('wishlist', JSON.stringify(Array.from(wishlist).filter(id => id !== productId)));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setLoadingWishlist((prev) => {
        const updatedLoading = new Map(prev);
        updatedLoading.delete(productId);
        return updatedLoading;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-12 px-6 relative overflow-hidden">
      <div className="container mx-auto">
        <h1 className="text-5xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-white to-purple-300">
          Our Products
        </h1>

        {error && (
          <div className="bg-red-600/30 text-white p-4 rounded-lg text-center mb-4">
            {error}
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center text-white/75">
            No products available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                isInWishlist={wishlist.has(product._id)}
                onAddToWishlist={() => addToWishlistFromService(product._id)}
                onRemoveFromWishlist={() => removeFromWishlistFromService(product._id)}
                loadingWishlist={loadingWishlist.get(product._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
