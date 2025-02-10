import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../authentication/AuthContext";
import SearchResults from "../lists/SearchResults";
import { Search } from "lucide-react";

const ProductSearch = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const { authState } = useAuth();
  const searchRef = useRef(null);

  // Handle clicks outside of search component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce search function
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (query.trim().length >= 2) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    if (!authState.isAuthenticated) {
      setResults([]);
      alert("Please log in to search for products");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8002/search/${query}`, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });

      setResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error("Error fetching products:", error);
      setResults([]);
      if (error.response?.status === 401) {
        alert("Your session has expired. Please log in again.");
      } else {
        alert("Failed to fetch products. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (!e.target.value.trim()) {
      setResults([]);
      setShowResults(false);
    }
  };

  const handleClose = () => {
    setShowResults(false);
    setResults([]);
    setQuery("");
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="flex items-center justify-center w-full md:w-auto">
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full shadow-md px-4 py-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-primary-400 w-full md:w-80">
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (results.length > 0) setShowResults(true);
            }}
            disabled={loading}
            className="bg-transparent border-none focus:outline-none text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 w-full"
          />
          <div className="text-gray-400 dark:text-gray-500 transition-all duration-200 ml-2">
            {loading ? (
              <div className="animate-spin h-5 w-5">
                <svg
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
              </div>
            ) : (
              <Search className="h-5 w-5" />
            )}
          </div>
        </div>
      </div>

      {/* Search Results */}
      {showResults && (
        <SearchResults
          results={results}
          onClose={handleClose}
          isLoading={loading}
        />
      )}
    </div>
  );
};

export default ProductSearch;