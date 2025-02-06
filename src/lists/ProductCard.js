import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, InfoIcon } from 'lucide-react';

const ProductCard = ({ 
  product, 
  isInWishlist, 
  onAddToWishlist, 
  onRemoveFromWishlist, 
  loadingWishlist 
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 space-y-4 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative overflow-hidden">
      {/* Product Image */}
      <div className="relative">
        <img 
          src={product.img} 
          alt={product.name} 
          className="w-full h-48 object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
        />
        <Link 
          to={`/product/${product._id}`} 
          className="absolute top-2 right-2 bg-white/20 p-2 rounded-full hover:bg-white/40 transition-all duration-300"
        >
          <InfoIcon className="w-5 h-5 text-white" />
        </Link>
      </div>

      {/* Product Details */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white truncate">{product.name}</h3>
        <p className="text-white/75 line-clamp-2">{product.desc}</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-blue-300">${product.price}</span>
          <span className={`text-sm ${product.available ? 'text-green-400' : 'text-red-400'}`}>
            {product.available ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>

      {/* Wishlist Button */}
      <div>
        <button
          onClick={() => {
            if (!isInWishlist && !loadingWishlist) {
              onAddToWishlist();
            } else if (isInWishlist && !loadingWishlist) {
              onRemoveFromWishlist();
            }
          }}
          disabled={loadingWishlist}
          className={`w-full flex items-center justify-center space-x-2 py-2 rounded-full transition-all duration-300 ${
            isInWishlist 
              ? 'bg-red-600/70 text-white hover:bg-red-700' 
              : 'bg-white/10 text-white hover:bg-white/20'
          } disabled:opacity-50`}
        >
          <HeartIcon className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
          <span>{loadingWishlist ? 'Processing...' : (isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist')}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
