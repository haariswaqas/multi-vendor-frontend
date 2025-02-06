import React, { useEffect, useState } from 'react';
import { useAuth } from '../authentication/AuthContext'; // Import AuthContext
import {fetchWishlist} from '../services/ProductServices';

const Wishlist = () => {
  const { authState } = useAuth(); // Access the auth context
  const [wishlist, setWishlist] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch profile data using the profile API
        const profileResponse = await fetch(`http://localhost:8001/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authState.token}`, // Include the token in headers
          },
        });

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const profileData = await profileResponse.json();

        // Extract wishlist IDs from the profile data (Ensure it's an array of IDs)
        const wishlistIds = profileData.wishlist || [];

        // Fetch detailed info for each item in the wishlist
        const wishlistDetails = await Promise.all(
          wishlistIds.map(async (id) => {
            if (typeof id === 'object' && id._id) {
              id = id._id; // Adjust the ID if it's an object with an `_id` field
            }
            const itemResponse = await fetch(`http://localhost:8001/${id}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${authState.token}`,
              },
            });

            if (!itemResponse.ok) {
              const errorDetails = await itemResponse.text();
              console.log('Error fetching item details:', errorDetails);
              throw new Error(`Failed to fetch details for wishlist item with ID: ${id}`);
            }

            return await itemResponse.json();
          })
        );

        setWishlist(wishlistDetails);
      } catch (error) {
        setError(error.message || 'Failed to fetch wishlist');
      }
    };

    if (authState.isAuthenticated) {
      fetchProfile();
    }
  }, [authState]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-12 px-6">
      <h2 className="text-3xl font-semibold text-center text-white mb-6">Your Wishlist</h2>

      {error && <p className="text-red-500 text-center mb-6">{error}</p>}

      {wishlist.length === 0 ? (
        <p className="text-center text-xl text-white/75">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlist.map((item) => (
            <div
              key={item._id}
              className="bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <img
                src={item.imageUrl || 'https://via.placeholder.com/150'}
                alt={item.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold text-white mb-2">{item.name}</h3>
              <p className="text-white/75 mb-4">{item.description}</p>
              <p className="text-lg font-bold text-white">${item.price}</p>
   
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
