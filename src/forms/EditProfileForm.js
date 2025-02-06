import React, { useState, useEffect } from 'react';
import { useAuth } from '../authentication/AuthContext'; // Assuming you have an auth context
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EditProfileForm = () => {
  const { authState } = useAuth(); // Access the auth context to get the token
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    street: '',
    postalCode: '',
    city: '',
    country: '',
    about: '',
    img: '', // Now storing image as a URL
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Fetch existing profile data when the component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:8001/', {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });

        // Populate the form with existing profile data
        setFormData({
          name: response.data.profile.name || '',
        gender: response.data.profile.gender || '',
          street: response.data.profile.street || '',
          postalCode: response.data.profile.postalCode || '',
          city: response.data.profile.city || '',
          country: response.data.profile.country || '',
          about: response.data.profile.about || '',
          img: response.data.profile.img || '', // Image URL
        });
      } catch (error) {
        setError('Failed to load profile data');
      }
    };

    fetchProfile();
  }, [authState.token]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await axios.put('http://localhost:8001/profile', formData, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data) {
      
        navigate('/view-profile')
      }
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <section className="bg-gradient-to-r from-indigo-600 to-indigo-800 min-h-screen flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 space-y-6">
        <h2 className="text-2xl font-semibold mb-4 text-center">Edit Profile</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-lg font-medium mb-2">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="gender" className="block text-lg font-medium mb-2">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="img" className="block text-lg font-medium mb-2">Profile Image URL</label>
            <input
              type="text"
              id="img"
              name="img"
              value={formData.img}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Enter image URL"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="about" className="block text-lg font-medium mb-2">About</label>
            <textarea
              id="about"
              name="about"
              value={formData.about}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              rows="3"
            />
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className={`w-full p-3 text-white ${loading ? 'bg-gray-500' : 'bg-indigo-600'} rounded-md`}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default EditProfileForm;