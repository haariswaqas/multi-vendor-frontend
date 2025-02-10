import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Info, Package, ShoppingCart, Sparkles, ArrowUpDown } from 'lucide-react';
import { useAuth } from '../authentication/AuthContext';
import { fetchProducts, fetchWishlist, manageWishlist, addWishlist, removeWishlist } from '../services/ProductServices';
import ProductCategoryList from './ProductCategoryList';

// ProductCard Component
const ProductCard = ({ 
  product, 
  isInWishlist, 
  onUpdateWishlist, 
  loadingWishlist 
}) => {
  // Ensure product.img is an array; if not, wrap it in an array and use a placeholder if needed
  const images = Array.isArray(product.img)
    ? product.img
    : [product.img || "/api/placeholder/400/400"];

  return (
    <div className="group relative">
      {/* Card Container */}
      <div className="relative bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden">
          <img 
            src={images[0]} 
            alt={product.name}
            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Quick Action Buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-full group-hover:translate-x-0 transition-transform duration-300">
            <Link 
              to={`/product/${product._id}`}
              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <Info className="w-5 h-5 text-gray-700" />
            </Link>
            <button
              onClick={() => {
                if (!loadingWishlist) {
                  onUpdateWishlist(product, isInWishlist);
                }
              }}
              disabled={loadingWishlist}
              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              {isInWishlist ? (
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              ) : (
                <Heart className="w-5 h-5 text-gray-700" />
              )}
            </button>
            <button
              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Product Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {product.name}
              </h3>
            </div>
            <p className="text-sm text-gray-700 line-clamp-2">
              {product.desc}
            </p>
          </div>

          {/* Price and Stock */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">${product.price}</p>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                <span className={`text-sm ${product.available ? 'text-green-600' : 'text-red-600'}`}>
                  {product.available ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ProductList Component
const ProductList = () => {
  const { authState } = useAuth();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  // Wishlist stored as a Set of product IDs
  const [wishlist, setWishlist] = useState(new Set());
  const [sortedProducts, setSortedProducts] = useState([]);
  const [sortOption, setSortOption] = useState('default');
  // Map to track loading state for each product (by product._id)
  const [loadingWishlist, setLoadingWishlist] = useState(new Map());
  const [showCategories, setShowCategories] = useState(false);

  // Fetch wishlist on mount or when token changes
  useEffect(() => {
    const fetchWishlistFromService = async () => {
      try {
        const wishlistData = await fetchWishlist(authState.token);
        // Assume wishlistData is an array of wishlist objects; extract product IDs from items in the first wishlist
        const wishlistIds = wishlistData && wishlistData.length > 0 
          ? wishlistData[0].items.map(item => item.product._id)
          : [];
        setWishlist(new Set(wishlistIds));
        localStorage.setItem('wishlist', JSON.stringify(wishlistIds));
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
      }
    };

    if (authState.token) {
      fetchWishlistFromService();
    }
  }, [authState.token]);

  // Fetch products on mount or when token changes
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

  useEffect(() => {
    const sortProducts = () => {
      const productsCopy = [...products];
      
      switch (sortOption) {
        case 'price-asc':
          productsCopy.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          productsCopy.sort((a, b) => b.price - a.price);
          break;
        default:
          // Keep original order
          break;
      }
      
      setSortedProducts(productsCopy);
    };

    sortProducts();
  }, [sortOption, products]);

  // Update wishlist using the backend PUT /wishlist endpoint
// Update wishlist using the backend endpoints
const updateWishlistFromService = async (product, isCurrentlyInWishlist) => {
  // Set loading state for this product
  setLoadingWishlist(prev => new Map(prev).set(product._id, true));
  
  try {
    if (isCurrentlyInWishlist) {
      // If it's currently in wishlist, remove it
      await removeWishlist(product, 0, true, authState.token);
    } else {
      // If it's not in wishlist, add it
      await addWishlist(product, 1, false, authState.token);
    }
    
    // Update wishlist state locally
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      if (isCurrentlyInWishlist) {
        newWishlist.delete(product._id);
      } else {
        newWishlist.add(product._id);
      }
      return newWishlist;
    });
    
    // Update localStorage
    localStorage.setItem('wishlist', JSON.stringify(Array.from(wishlist)));
  } catch (error) {
    console.error('Error updating wishlist:', error);
  } finally {
    setLoadingWishlist(prev => {
      const updatedLoading = new Map(prev);
      updatedLoading.delete(product._id);
      return updatedLoading;
    });
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-gray-500 py-16 px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-200/20 via-transparent to-transparent" />

      <div className="container mx-auto relative">
        {/* Header Section */}
        <div className="text-center space-y-6 mb-16">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-gray-600" />
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-600 via-gray-900 to-gray-900">
              Our Products
            </h1>
            <Sparkles className="w-8 h-8 text-gray-900" />
          </div>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Discover our carefully curated collection of exceptional products.
          </p>
          
          {/* Controls Section */}
          <div className="flex justify-center items-center gap-4">
            <button 
              onClick={() => setShowCategories(prev => !prev)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {showCategories ? 'Hide Categories' : 'Browse Categories'}
            </button>
            
            <div className="relative">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-gray-600" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="default">Default Order</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Conditionally render the ProductCategoryList */}
        {showCategories && (
          <div className="mb-16">
            <ProductCategoryList />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-red-100 border border-red-200 text-red-600 p-4 rounded-lg text-center">
              {error}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-blue-300/30 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              No products available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedProducts.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                isInWishlist={wishlist.has(product._id)}
                onUpdateWishlist={updateWishlistFromService}
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
