import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../authentication/AuthContext';
import { HeartOff } from 'lucide-react';
import { fetchWishlist, removeWishlist } from '../services/ProductServices';

const Wishlist = () => {
  const { authState } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const getWishlist = async () => {
      try {
        // Fetch the wishlist using the auth token.
        const data = await fetchWishlist(authState.token);
        // Extract the wishlist array from the returned object.
        const wishlistItems = data.wishlist || [];
        setWishlist(wishlistItems);
      } catch (error) {
        setError(error.message || 'Failed to fetch wishlist');
      }
    };

    if (authState.isAuthenticated) {
      getWishlist();
    }
  }, [authState]);

  // Handler for removing a wishlist item.
  const handleRemoveWishlist = async (item) => {
    try {
      await removeWishlist(item.product, 0, true, authState.token);
      // Update local wishlist state after removal.
      setWishlist((prevWishlist) =>
        prevWishlist.filter((w) => w._id !== item._id)
      );
    } catch (error) {
      console.error('Failed to remove item from wishlist', error);
      setError(error.message || 'Failed to remove item from wishlist');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-10">Wishlist</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {wishlist.length === 0 ? (
          <div className="text-center py-12">
            <HeartOff className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">Your wishlist is empty</p>
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((item) => {
              // Ensure that the product image is an array.
              const images = Array.isArray(item.product.img)
                ? item.product.img
                : [item.product.img || "/api/placeholder/400/400"];
              return (
                <div
                  key={item._id}
                  className="relative group bg-white shadow-md rounded-lg overflow-hidden transition-transform transform hover:-translate-y-1"
                >
                  {/* The Link wraps the card that shows product details */}
                  <Link to={`/product/${item.product._id}`} className="block">
                    <div className="relative">
                      <img
                        src={images[0]}
                        alt={item.product.name}
                        className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-semibold text-gray-800 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {item.product.desc}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xl font-bold text-gray-900">
                          ${item.product.price}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.product.available
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.product.available ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </Link>
                  {/* Remove button positioned on the top right */}
                  <button
                    onClick={(e) => {
                      // Prevent the click from triggering the Link navigation.
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveWishlist(item);
                    }}
                    className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                    title="Remove from Wishlist"
                  >
                    <HeartOff className="h-6 w-6 text-red-500" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
