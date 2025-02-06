import React, { useState, useEffect } from 'react';
import { useAuth } from '../authentication/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUpload, FaImage, FaTags, FaBox, FaDollarSign, FaCheckCircle } from 'react-icons/fa';

const ProductForm = () => {
  const { authState } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [img, setImg] = useState('');
  const [type, setType] = useState('');
  const [stock, setStock] = useState(0);
  const [price, setPrice] = useState(0);
  const [available, setAvailable] = useState(true);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  const PRODUCT_CATEGORIES = [
    'Electronics', 'Fashion', 'Home and Kitchen',
    'Health and Personal Care', 'Books', 'Sports', 
    'Toys', 'Beauty', 'Automotive', 'Jewelry'
  ];

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const response = await axios.get(`http://localhost:8002/${id}`, {
            headers: {
              Authorization: `Bearer ${authState.token}`,
            },
          });
          const product = response.data;
          setName(product.name);
          setDesc(product.desc);
          setImg(product.img);
          setType(product.type);
          setStock(product.stock);
          setPrice(product.price);
          setAvailable(product.available);
          setSizes(product.sizes);
          setColors(product.colors);
        } catch (error) {
          setError('Failed to fetch product details.');
        }
      };
      fetchProduct();
    }
  }, [id, authState.token]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'upload_preset');
    formData.append('cloud_name', 'dqwub0fhb');

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dqwub0fhb/image/upload',
        formData
      );
      const uploadedImageUrl = response.data.secure_url;
      setImg(uploadedImageUrl);
      setUploading(false);
    } catch (error) {
      setError('Image upload failed.');
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = {
      name, desc, img, type, stock, price, available, sizes, colors,
    };

    try {
      const url = id
        ? `http://localhost:8002/product/${id}`
        : 'http://localhost:8002/product/create';
      const method = id ? 'PUT' : 'POST';

      await axios({
        method,
        url,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.token}`,
        },
        data: productData,
      });

      setSuccess(id ? 'Product updated successfully!' : 'Product created successfully!');
      navigate('/all-products');
    } catch (error) {
      setError('You are not the seller and do not have the permission to edit this product.');
    }
  };

  if (authState.user.role !== 'Seller') {
    return <p>You are not authorized to view this page.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <h2 className="text-3xl font-bold text-white">
            {id ? 'Edit Product' : 'Create New Product'}
          </h2>
        </div>
        
        <form className="p-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-gray-700 flex items-center mb-2">
                <FaTags className="mr-2 text-blue-500" /> Product Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition duration-300"
              />
            </div>

            <div className="relative">
              <label className="block text-gray-700 flex items-center mb-2">
                <FaBox className="mr-2 text-green-500" /> Category
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition duration-300"
              >
                <option value="">Select Category</option>
                {PRODUCT_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative">
            <label htmlFor="desc" className="block text-gray-700 flex items-center mb-2">
              Description
            </label>
            <textarea
              id="desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition duration-300"
            />
          </div>

          <div>
            <label className="block text-gray-700 flex items-center mb-2">
              <FaImage className="mr-2 text-indigo-500" /> Product Image
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {uploading && <p className="text-gray-500">Uploading...</p>}
            {img && (
              <img 
                src={img} 
                alt="Product" 
                className="mt-4 mx-auto h-32 w-32 object-cover rounded-full shadow-lg"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-gray-700 flex items-center mb-2">
                <FaDollarSign className="mr-2 text-green-600" /> Price
              </label>
              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition duration-300"
              />
            </div>
            <div>
              <label className="block text-gray-700 flex items-center mb-2">
                <FaBox className="mr-2 text-purple-500" /> Stock
              </label>
              <input
                id="stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition duration-300"
              />
            </div>
            <div className="flex items-center justify-center pt-6">
              <label className="flex items-center text-gray-700">
                <input
                  id="available"
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  className="mr-2 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                Available
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="sizes" className="block text-gray-700 mb-2">
                Sizes
              </label>
              <input
                id="sizes"
                type="text"
                value={sizes.join(', ')}
                onChange={(e) => setSizes(e.target.value.split(',').map(s => s.trim()))}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition duration-300"
              />
            </div>
            <div>
              <label htmlFor="colors" className="block text-gray-700 mb-2">
                Colors
              </label>
              <input
                id="colors"
                type="text"
                value={colors.join(', ')}
                onChange={(e) => setColors(e.target.value.split(',').map(c => c.trim()))}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition duration-300"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition duration-300 flex items-center justify-center"
          >
            <FaCheckCircle className="mr-2" />
            {id ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;