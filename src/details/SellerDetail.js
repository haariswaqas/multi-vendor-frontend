import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../authentication/AuthContext';


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

        if (!response.ok) {
          throw new Error('Failed to fetch seller details');
        }

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

        if (!response.ok) {
          throw new Error('Failed to fetch seller products');
        }

        const productsData = await response.json();
        setSellerProducts(productsData);
      } catch (err) {
        setError(err.message || 'Failed to fetch seller products');
      }
    };

    fetchSellerDetails();
    fetchSellerProducts();
  }, [id, authState.token]);

  if (error) return <p className="text-red-500 text-center mt-8">{error}</p>;
  if (!seller) return <p className="text-white text-center mt-8">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-12 px-6 relative">
      <div className="container mx-auto max-w-2xl bg-white/10 rounded-lg p-6 shadow-md text-white">
        <h2 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
          Seller Profile
        </h2>

        <div className="space-y-4">
          <div>
            <p className="font-semibold text-xl mb-2">Name</p>
            <p>{seller.name}</p>
          </div>

          <div>
            <p className="font-semibold text-xl mb-2">About</p>
            <p>{seller.about || 'No additional information provided'}</p>
          </div>

          <div>
            <p className="font-semibold text-xl mb-2">Personal Information</p>
            <p>Gender: {seller.gender}</p>
          </div>

          <div>
            <p className="font-semibold text-xl mb-2">Location</p>
            <p>{seller.street}</p>
            <p>{seller.city}, {seller.country}</p>
            <p>Postal Code: {seller.postalCode}</p>
          </div>

          <div>
            <p className="font-semibold text-xl mb-2">Account Details</p>
            <p>Joined: {new Date(seller.createdAt).toLocaleDateString()}</p>
            <p>Last Updated: {new Date(seller.updatedAt).toLocaleDateString()}</p>
          </div>

          <div>
            <p className="font-semibold text-xl mb-2">Products</p>
            <ul>
              {sellerProducts.map((product, index) => (
                <li key={index}>{product.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDetail;