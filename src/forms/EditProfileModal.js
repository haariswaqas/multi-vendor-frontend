// EditProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../authentication/AuthContext';
import axios from 'axios';

const EditProfileModal = ({ onClose }) => {
  const { authState } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    street: '',
    postalCode: '',
    city: '',
    country: '',
    about: '',
    img: '', // Will store the Cloudinary secure URL after upload
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch the existing profile data when the modal mounts.
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:8001/', {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });

        setFormData({
          name: response.data.profile.name || '',
          gender: response.data.profile.gender || '',
          street: response.data.profile.street || '',
          postalCode: response.data.profile.postalCode || '',
          city: response.data.profile.city || '',
          country: response.data.profile.country || '',
          about: response.data.profile.about || '',
          img: response.data.profile.img || '',
        });
      } catch (error) {
        setError('Failed to load profile data');
      }
    };

    fetchProfile();
  }, [authState.token]);

  // Handle input changes.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle profile image file upload to Cloudinary.
  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    setError('');
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('upload_preset', 'upload_preset'); // Change to your Cloudinary upload preset
      formDataUpload.append('cloud_name', 'dqwub0fhb'); // Change to your Cloudinary cloud name

      const res = await axios.post(
        'https://api.cloudinary.com/v1_1/dqwub0fhb/image/upload',
        formDataUpload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      const secure_url = res.data.secure_url;
      setFormData(prev => ({ ...prev, img: secure_url }));
    } catch (error) {
      setError('Failed to upload image');
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle form submission.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put('http://localhost:8001/profile', formData, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
          'Content-Type': 'application/json',
        },
      });
      // Close the modal on successful update.
      onClose();
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Increased max-width to better support grid layout */}
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold mb-4 text-center">Edit Profile</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {/* Grid form: one column on small screens, two columns on medium+ */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-lg font-medium mb-2">
              Name
            </label>
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

          {/* Gender Field */}
          <div>
            <label htmlFor="gender" className="block text-lg font-medium mb-2">
              Gender
            </label>
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

          {/* Profile Image Upload Field */}
          <div>
            <label htmlFor="img" className="block text-lg font-medium mb-2">
              Profile Image
            </label>
            {formData.img && (
              <img
                src={formData.img}
                alt="Profile Preview"
                className="w-24 h-24 object-cover rounded-full mb-2"
              />
            )}
            <input
              type="file"
              id="img"
              name="img"
              accept="image/*"
              onChange={handleProfileImageUpload}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
            {uploadingImage && (
              <div className="mt-2 flex items-center text-gray-500">
                <div className="animate-spin mr-2 h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                Uploading image...
              </div>
            )}
          </div>

          {/* About Field: Spanning both columns */}
          <div className="md:col-span-2">
            <label htmlFor="about" className="block text-lg font-medium mb-2">
              About
            </label>
            <textarea
              id="about"
              name="about"
              value={formData.about}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              rows="3"
            />
          </div>

          {/* Street Field: Full width */}
          <div className="md:col-span-2">
            <label htmlFor="street" className="block text-lg font-medium mb-2">
              Street
            </label>
            <input
              type="text"
              id="street"
              name="street"
              value={formData.street}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Enter street"
            />
          </div>

          {/* Postal Code Field */}
          <div>
            <label htmlFor="postalCode" className="block text-lg font-medium mb-2">
              Postal Code
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Postal Code"
            />
          </div>

          {/* City Field */}
          <div>
            <label htmlFor="city" className="block text-lg font-medium mb-2">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="City"
            />
          </div>

          {/* Country Field: Full width */}
          <div className="md:col-span-2">
            <label htmlFor="country" className="block text-lg font-medium mb-2">
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Country"
            />
          </div>

          {/* Submit Button: Full width */}
          <div className="md:col-span-2 mt-6">
            <button
              type="submit"
              className={`w-full p-3 text-white ${
                loading ? 'bg-gray-500' : 'bg-indigo-600'
              } rounded-md`}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
