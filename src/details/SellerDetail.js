import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../authentication/AuthContext';
import { MapPin, Calendar, Package, ExternalLink } from 'lucide-react';

const SellerDetail = () => {
  const { id } = useParams();
  const { authState } = useAuth();
  const [seller, setSeller] = useState(null);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSellerDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8001/seller-profile/${id}`, {
          headers: { 'Authorization': `Bearer ${authState.token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch seller details');
        const sellerData = await response.json();
        setSeller(sellerData);
      } catch (err) {
        setError(err.message || 'Failed to fetch seller details');
      }
    };

    const fetchSellerProducts = async () => {
      try {
        const response = await fetch(`http://localhost:8002/seller-products/${id}`, {
          headers: { 'Authorization': `Bearer ${authState.token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch seller products');
        const productsData = await response.json();
        setSellerProducts(productsData);
      } catch (err) {
        setError(err.message || 'Failed to fetch seller products');
      }
    };

    fetchSellerDetails();
    fetchSellerProducts();
  }, [id, authState.token]);

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
    </div>
  );
  
  if (!seller) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-400">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32 md:h-48 relative">
            <div className="absolute -bottom-16 left-8">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                <img
                  src={seller.img || "/api/placeholder/128/128"}
                  alt={seller.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          <div className="pt-20 pb-6 px-8">
            <h1 className="text-3xl font-bold text-gray-900">{seller.name}</h1>
            <p className="text-gray-600 mt-2 max-w-2xl">{seller.about || 'No additional information provided'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-700">{seller.street}</p>
                    <p className="text-gray-700">{seller.city}, {seller.country}</p>
                    <p className="text-gray-500 text-sm">Postal Code: {seller.postalCode}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-700">Joined {new Date(seller.createdAt).toLocaleDateString()}</p>
                    <p className="text-gray-500 text-sm">Last updated {new Date(seller.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Products</h2>
                <Package className="w-5 h-5 text-gray-400" />
              </div>
              {sellerProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sellerProducts.map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      className="group block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900 group-hover:text-blue-600">{product.name}</span>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No products available</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Info</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="text-gray-900">{seller.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Products Listed</p>
                  <p className="text-gray-900">{sellerProducts.length}</p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Link
              to="/all-products"
              className="block w-full text-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDetail;