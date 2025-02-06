import React, { useEffect, useState } from 'react';
import { useAuth } from '../authentication/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/profile-detail-card';
import { Badge } from '../components/ui/profile-badge';
import SellerProductsList from '../lists/SellerProductsList';

const ProfileDetail = () => {
  const { authState } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState('');
  const [salesData, setSalesData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:8001/', {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
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
            headers: {
              Authorization: `Bearer ${authState.token}`,
            },
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold text-indigo-600">
            Profile Details
          </CardTitle>
          {error && (
            <div className="mt-2 text-red-600 text-center">{error}</div>
          )}
        </CardHeader>

        {profileData && profileData.profile && (
          <CardContent className="space-y-8">
            {/* Profile Image */}
            <div className="flex justify-center">
              <div className="relative">
                <img 
                  src={profileData.profile.img} 
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-indigo-200 object-cover"
                />
                <Badge 
                  variant="secondary"
                  className="absolute bottom-0 right-0 transform translate-x-1/4"
                >
                  {authState.role}
                </Badge>
              </div>
            </div>

            {/* Profile Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Name', value: profileData.profile.name },
                { label: 'Gender', value: profileData.profile.gender },
                { label: 'Street', value: profileData.profile.street },
                { label: 'Postal Code', value: profileData.profile.postalCode },
                { label: 'City', value: profileData.profile.city },
                { label: 'Country', value: profileData.profile.country },
              ].map((item, index) => (
                <Card key={index} className="bg-gray-50">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-gray-500">{item.label}</h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sales Data */}
            {authState.role === 'seller' && salesData.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Recent Sales</h3>
                <div className="space-y-4">
                  {salesData.map((sale, index) => (
                    <Card key={index} className="bg-white">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge variant="secondary" className="mb-2">
                              Order #{sale.orderId}
                            </Badge>
                            <h4 className="text-lg font-medium">{sale.items.product.name}</h4>
                            <p className="text-gray-600">Quantity: {sale.items.amount}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {new Date(sale.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <CardFooter className="flex justify-center mt-8">
              <button
                onClick={handleEditProfile}
                className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 ease-in-out shadow-md"
              >
                Edit Profile
              </button>
            </CardFooter>
          </CardContent>
        )}
      </Card>
      < SellerProductsList />
    </div>
  );
};

export default ProfileDetail;