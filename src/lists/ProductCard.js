import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Info, Package, ShoppingCart} from 'lucide-react';

const ProductCard = ({ 
  product, 
  isInWishlist, 
  onAddToWishlist, 
  onRemoveFromWishlist, 
  loadingWishlist 
}) => {
  return (
    <div className="group relative">
      {/* Card Container */}
      <div className="relative bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden">
          <img 
            src={product.img || "/api/placeholder/400/400"} 
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
            
            {/* Wishlist Button */}
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
              <Heart 
                className={`w-6 h-6 transition-colors duration-300 ${
                  isInWishlist 
                    ? 'text-red-500 fill-red-500' 
                    : 'text-gray-600'
                }`} 
              />
            </button>
          </div>
        </div>

        {/* Loading Overlay */}
        {loadingWishlist && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
