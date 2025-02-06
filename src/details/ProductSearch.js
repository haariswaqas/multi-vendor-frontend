import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../authentication/AuthContext";  // Adjust the import based on your project structure

const ProductSearch = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const { authState } = useAuth();
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      alert("Please enter a product name");
      return;
    }

    if (!authState.isAuthenticated) {
      alert("Please log in to search for products");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8002/search/${query}`, {
        headers: {
          Authorization: `Bearer ${authState.token}`,  // Include token in API request
        },
      });

      if (response.data.length > 0) {
        const productId = response.data[0]._id;
        navigate(`/product/${productId}`);
      } else {
        alert("Product not found");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      alert("Failed to fetch product. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full md:w-auto">
      <form
        onSubmit={handleSearch}
        className="flex items-center bg-gray-100 rounded-full shadow-md px-4 py-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-400 w-full md:w-80"
      >
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          className="bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-500 w-full"
        />
        <button
          type="submit"
          disabled={loading}
          className="text-blue-500 hover:text-blue-700 transition-all duration-200 ml-2"
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m0 0a8 8 0 111.64-1.64L21 21z"
              />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default ProductSearch;
