import React, { useEffect, useState } from 'react';
import { useAuth } from '../authentication/AuthContext';
import { Link, useParams } from 'react-router-dom';
import { 
  HeartIcon, 
  InfoIcon, 
  Sparkles,
  ArrowUpDown 
} from 'lucide-react';
import { 
  updateLocalStorageWishlist, 
  updateLocalStorageCart, 
  addToWishlist, 
  removeFromWishlist, 
  addToCart, 
  removeFromCart 
} from '../services/ProductServices';
import ProductCategoryList from './ProductCategoryList';

// ProductCard component remains the same
const ProductCard = ({ 
  product, 
  isInWishlist, 
  isInCart, 
  onAddToWishlist, 
  onRemoveFromWishlist, 
  onAddToCart, 
  onRemoveFromCart,
  loadingWishlist,
  loadingCart 
}) => {
  return (
    <div className="group relative">
      <div className="relative bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="relative aspect-square overflow-hidden">
          <img 
            src={product.img || "/api/placeholder/400/400"} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <Link 
            to={`/product/${product._id}`} 
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <InfoIcon className="w-5 h-5 text-gray-700" />
          </Link>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {product.name}
            </h3>
            <p className="text-sm text-gray-700 line-clamp-2">
              {product.desc}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">${product.price}</p>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${product.available ? 'text-green-600' : 'text-red-600'}`}>
                  {product.available ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (!loadingWishlist) {
                  isInWishlist ? onRemoveFromWishlist() : onAddToWishlist();
                }
              }}
              disabled={loadingWishlist}
              className={`p-3 rounded-full transition-all duration-300 ${
                isInWishlist 
                  ? 'bg-red-100 hover:bg-red-200' 
                  : 'bg-gray-100 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <HeartIcon 
                className={`w-6 h-6 transition-colors duration-300 ${
                  isInWishlist 
                    ? 'text-red-500 fill-red-500' 
                    : 'text-gray-600'
                }`} 
              />
            </button>
          </div>
        </div>

        {(loadingWishlist || loadingCart) && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

const ProductList = () => {
  const { authState } = useAuth();
  const { type } = useParams();
  const [products, setProducts] = useState([]);
  const [sortedProducts, setSortedProducts] = useState([]);
  const [sortOption, setSortOption] = useState('default');
  const [error, setError] = useState('');
  const [wishlist, setWishlist] = useState(new Set());
  const [cart, setCart] = useState(new Set());
  const [loadingWishlist, setLoadingWishlist] = useState(new Map());
  const [loadingCart, setLoadingCart] = useState(new Map());
  const [showCategories, setShowCategories] = useState(false);

  // Initialize wishlist and cart from localStorage
  useEffect(() => {
    const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    setWishlist(new Set(Array.isArray(storedWishlist) ? storedWishlist : []));
  
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(new Set(Array.isArray(storedCart) ? storedCart : []));
  }, []);

  // Sort products when sortOption or products change
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

  // Fetch products by category
  useEffect(() => {
    const fetchProductsByCategoryFunc = async () => {
      try {
        const response = await fetch(`http://localhost:8002/category/${type}`, {
          headers: {
            'Authorization': `Bearer ${authState.token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch products by category');
        }
        const data = await response.json();
        setProducts(data);
        setShowCategories(false);
      } catch (error) {
        setError(error.message || 'Failed to fetch products by category');
      }
    };

    fetchProductsByCategoryFunc();
  }, [type, authState.token]);

  // Rest of the service functions remain the same
  const updateLocalStorageWishlistFromService = (updatedWishlist) => {
    updateLocalStorageWishlist(updatedWishlist);
  };

  const updateLocalStorageCartFromService = (updatedCart) => {
    updateLocalStorageCart(updatedCart);
  };

  const addToWishlistFromService = async (productId) => {
    setLoadingWishlist((prev) => new Map(prev).set(productId, true));
    try {
      await addToWishlist(productId, authState.token);
      setWishlist((prev) => {
        const updatedWishlist = new Set(prev).add(productId);
        updateLocalStorageWishlistFromService(updatedWishlist);
        return updatedWishlist;
      });
    } catch (error) {
      console.error('Error adding product to wishlist:', error);
    } finally {
      setLoadingWishlist((prev) => {
        const updated = new Map(prev);
        updated.delete(productId);
        return updated;
      });
    }
  };

  const removeFromWishlistFromService = async (productId) => {
    setLoadingWishlist((prev) => new Map(prev).set(productId, true));
    try {
      await removeFromWishlist(productId, authState.token);
      setWishlist((prev) => {
        const updatedWishlist = new Set(prev);
        updatedWishlist.delete(productId);
        updateLocalStorageWishlistFromService(updatedWishlist);
        return updatedWishlist;
      });
    } catch (error) {
      console.error('Error removing product from wishlist:', error);
    } finally {
      setLoadingWishlist((prev) => {
        const updated = new Map(prev);
        updated.delete(productId);
        return updated;
      });
    }
  };

  const addToCartFromService = async (productId, quantity) => {
    setLoadingCart((prev) => new Map(prev).set(productId, true));
    try {
      await addToCart(productId, quantity, authState.token);
      setCart((prev) => {
        const updatedCart = new Set(prev).add(productId);
        updateLocalStorageCartFromService(updatedCart);
        return updatedCart;
      });
    } catch (error) {
      console.error('Error adding product to cart:', error);
    } finally {
      setLoadingCart((prev) => {
        const updated = new Map(prev);
        updated.delete(productId);
        return updated;
      });
    }
  };

  const removeFromCartFromService = async (productId) => {
    setLoadingCart((prev) => new Map(prev).set(productId, true));
    try {
      await removeFromCart(productId, authState.token);
      setCart((prev) => {
        const updatedCart = new Set(prev);
        updatedCart.delete(productId);
        updateLocalStorageCartFromService(updatedCart);
        return updatedCart;
      });
    } catch (error) {
      console.error('Error removing product from cart:', error);
    } finally {
      setLoadingCart((prev) => {
        const updated = new Map(prev);
        updated.delete(productId);
        return updated;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-gray-500 py-16 px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-200/20 via-transparent to-transparent" />
      <div className="container mx-auto relative">
        <div className="text-center space-y-6 mb-16">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-gray-600" />
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-600 via-gray-1100 to-gray-900">
              {type ? type.replace('-', ' ') : 'Products'}
            </h1>
            <Sparkles className="w-8 h-8 text-gray-900" />
          </div>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Discover our carefully curated collection of exceptional {type ? type.replace('-', ' ') : 'products'}.
          </p>
          
          {/* Controls Section */}
          <div className="flex justify-center items-center gap-4">
            <button 
              onClick={() => setShowCategories(prev => !prev)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {showCategories ? 'Hide Categories' : 'Browse Categories'}
            </button>
            
            <Link to="/all-products"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              View All Products
            </Link>

            {/* Sort Dropdown */}
            <div className="relative flex items-center gap-2">
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

        {showCategories && (
          <div className="mb-16">
            <ProductCategoryList />
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-red-100 border border-red-200 text-red-600 p-4 rounded-lg text-center">
              {error}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              isInWishlist={wishlist.has(product._id)}
              isInCart={cart.has(product._id)}
              onAddToWishlist={() => addToWishlistFromService(product._id)}
              onRemoveFromWishlist={() => removeFromWishlistFromService(product._id)}
              onAddToCart={(quantity) => addToCartFromService(product._id, quantity)}
              onRemoveFromCart={() => removeFromCartFromService(product._id)}
              loadingWishlist={loadingWishlist.get(product._id)}
              loadingCart={loadingCart.get(product._id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductList;