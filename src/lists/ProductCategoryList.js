import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../authentication/AuthContext';
import { 
  Laptop, Shirt, Home, Heart, Book, 
  Tent, Gamepad, Palette, Car, 
  Watch, ShoppingCart, Baby, 
  Dog, Wrench, Clipboard, 
  Music, Sofa, Palette as Brush, 
  Music as Headphones, 
  Music2
} from 'lucide-react';

const categoryIcons = {
  "Electronics": Laptop,
  "Fashion": Shirt,
  "Home and Kitchen": Home,
  "Health and Personal Care": Heart,
  "Books and Stationery": Book,
  "Sports and Outdoors": Tent,
  "Toys and Games": Gamepad,
  "Beauty and Cosmetics": Palette,
  "Automotive": Car,
  "Jewelry and Accessories": Watch,
  "Groceries and Food": ShoppingCart,
  "Baby Products": Baby,
  "Pet Supplies": Dog,
  "Tools and Hardware": Wrench,
  "Office Supplies": Clipboard,
  "Musical Instruments": Music,
  "Furniture": Sofa,
  "Art and Craft": Brush,
  "Industrial and Scientific": Music2,
  "Video Games and Consoles": Gamepad,
  "Music": Headphones
};

const ProductCategoryList = () => {
  const { authState } = useAuth();

  if (authState.isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-800 text-lg">Loading...</p>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-800 text-lg">Please log in to view categories.</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 p-6 overflow-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Product Categories</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Object.entries(categoryIcons).map(([type, Icon]) => (
          <Link
            key={type}
            to={`/products/${type}`}
            className="block p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all 
                       flex flex-col items-center justify-center space-y-2 
                       border border-gray-200 hover:border-blue-300"
          >
            <Icon className="w-8 h-8 text-blue-600" />
            <p className="text-sm font-medium text-gray-800 text-center">{type}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductCategoryList;