import React, { useEffect, useState } from 'react';
import { useAuth } from '../authentication/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SellerProductsList from '../lists/SellerProductsList';
import { Badge } from '../components/ui/profile-badge';

const ProfileDetail = () => {
  const { authState } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:8001/', {
          headers: { Authorization: `Bearer ${authState.token}` },
        });
        setProfileData(response.data);
      } catch (error) {
        setError(error.response ? error.response.data.message : 'Failed to load profile');
      }
    };

    const fetchSalesData = async () => {
      if (authState.role === 'seller') {
        try {
          const response = await axios.get('http://localhost:8003/seller-sales', {
            headers: { Authorization: `Bearer ${authState.token}` },
          });
          setSalesData(response.data);
        } catch (error) {
          setError(error.response ? error.response.data.message : 'Failed to load sales data');
        }
      }
    };

    fetchProfile();
    fetchSalesData();
  }, [authState.token, authState.role]);

  if (!profileData && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-gray-500"></div>
      </div>
    );
  }

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32 md:h-48 relative">
            <div className="absolute -bottom-16 left-8">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                <img
                  src={profileData?.profile?.img || "/api/placeholder/128/128"}
                  alt={profileData?.profile?.name || "Profile"}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          <div className="pt-20 pb-6 px-8">
            <h1 className="text-3xl font-bold text-gray-900">{profileData?.profile?.name}</h1>
            {error && <p className="mt-2 text-red-500">{error}</p>}
          </div>
        </div>

        {/* Profile Details & Sales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
            <div className="space-y-4">
              {[
                { label: 'Name', value: profileData?.profile?.name },
                { label: 'Gender', value: profileData?.profile?.gender },
                { label: 'Street', value: profileData?.profile?.street },
                { label: 'Postal Code', value: profileData?.profile?.postalCode },
                { label: 'City', value: profileData?.profile?.city },
                { label: 'Country', value: profileData?.profile?.country },
              ].map((item, index) => (
                <div key={index}>
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="text-gray-800 font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sales Data (only for sellers) */}
          {authState.role === 'seller' && salesData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Sales</h2>
              <div className="space-y-4">
                {salesData.map((sale, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 shadow">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Order #{sale.orderId}</p>
                        <p className="text-gray-800 font-medium">{sale.items.product.name}</p>
                        <p className="text-gray-600">Quantity: {sale.items.amount}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleEditProfile}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            Edit Profile
          </button>
        </div>

        {/* Conditionally render SellerProductsList if the user is not a buyer */}
        {authState.role !== 'buyer' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Products</h2>
            <SellerProductsList />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDetail;
