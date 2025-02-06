import React, { useState } from 'react';
import { useAuth } from '../authentication/AuthContext'; // Assuming you have an auth context
import axios from 'axios';

const CreateProfileForm = () => {
  const { authState } = useAuth(); // Access the auth context to get the token
  const [formData, setFormData] = useState({
    name: '',
    img: '',
    gender: '',
    street: '',
    postalCode: '',
    city: '',
    country: '',
    about: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission (Create profile)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8001/profile', formData, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });
      
      if (response.data) {
        alert('Profile created successfully!');
      }
    } catch (error) {
      setError('Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">Create Profile</h2>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-lg font-medium mb-2">Name</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" required />
        </div>

        <div className="mb-4">
          <label htmlFor="img" className="block text-lg font-medium mb-2">Profile Image URL</label>
          <input type="text" id="img" name="img" value={formData.img} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" required />
        </div>

        <div className="mb-4">
          <label htmlFor="gender" className="block text-lg font-medium mb-2">Gender</label>
          <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="street" className="block text-lg font-medium mb-2">Street</label>
          <input type="text" id="street" name="street" value={formData.street} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" required />
        </div>

        <div className="mb-4">
          <label htmlFor="postalCode" className="block text-lg font-medium mb-2">Postal Code</label>
          <input type="text" id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" required />
        </div>

        <div className="mb-4">
          <label htmlFor="city" className="block text-lg font-medium mb-2">City</label>
          <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" required />
        </div>

        <div className="mb-4">
          <label htmlFor="country" className="block text-lg font-medium mb-2">Country</label>
          <input type="text" id="country" name="country" value={formData.country} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" required />
        </div>

        <div className="mb-4">
          <label htmlFor="about" className="block text-lg font-medium mb-2">About</label>
          <textarea id="about" name="about" value={formData.about} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md" required></textarea>
        </div>

        <div className="mt-6">
          <button type="submit" className={`w-full p-3 text-white ${loading ? 'bg-gray-500' : 'bg-blue-500'} rounded-md`} disabled={loading}>
            {loading ? 'Creating...' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProfileForm;
