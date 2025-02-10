import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Menu, ChevronDown, Search } from 'lucide-react';
import ProductSearch from '../details/ProductSearch';
import { useAuth } from '../authentication/AuthContext';

const Navbar = () => {
  const { authState, dispatch } = useAuth();
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileError, setProfileError] = useState(null);

  let navLinks = [];
  if (authState?.user?.role) {
    if (authState.user.role === 'Buyer') {
      navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Products', href: '/all-products' },
        { name: 'My Cart', href: '/cart' },
        { name: 'My Orders', href: '/orders' },
        { name: 'My Wishlist', href: '/wishlist' },
       
      ];
    } else if (authState.user.role === 'Seller') {
      navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Products', href: '/all-products' },
        { name: 'My Products', href: '/seller-products' },
        { name: 'Sell Product', href: '/add-product' },
        { name: 'My Sales', href: '/sales' },
      ];
    }
  }

  // Use a default image if none is available
  const defaultProfileImg = '/default-profile.png';

  // Fetch the profile data using the same API as in ProfileDetail
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:8001/', {
          headers: { Authorization: `Bearer ${authState.token}` },
        });
        setProfileData(response.data);
      } catch (error) {
        setProfileError(
          error.response ? error.response.data.message : 'Failed to load profile'
        );
      }
    };

    if (authState.isAuthenticated) {
      fetchProfile();
    }
  }, [authState.token, authState.isAuthenticated]);

  return (
    <nav className="bg-gradient-to-r from-green-700 to-blue-700">
      <div className="max-w-screen-xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side: Logo & Navigation */}
          <div className="flex items-center space-x-8">
            <div className="shrink-0">
              <Link to="/" className="flex items-center">
                <img
                  src="https://i.ibb.co/DHZ98Ghs/Cyber-Mart-Logo.jpg"
                  alt="CyberMart Logo"
                  className="w-10 h-10 mr-2"
                />
                <span className="text-xl font-semibold text-white">
                  CyberMart 
                </span>
              </Link>
            </div>
            {authState.isAuthenticated ? (
              <ul className="hidden lg:flex items-center space-x-8">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm font-medium text-white hover:text-gray-900"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="hidden lg:flex items-center space-x-8">
                <li>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-white hover:bg-green-500 hover:text-white rounded-lg px-4 py-2"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="text-sm font-medium text-white hover:bg-blue-500 hover:text-white rounded-lg px-4 py-2"
                  >
                    Register
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Right Side: Search & User Menu */}
          <div className="flex items-center space-x-4">
            {/* Search Button & Search Box */}
            <div className="relative">
              <button
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Search className="h-5 w-5 text-white" />
              </button>
              {isSearchVisible && <ProductSearch />}
            </div>

            {/* User Menu */}
            {authState.isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setIsUserOpen(!isUserOpen)}
                  className="inline-flex items-center p-2 hover:bg-gray-100 rounded-lg"
                >
                  <img
                    src={profileData?.profile?.img || defaultProfileImg}
                    alt="Profile"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="ml-2 text-sm font-medium text-white">
                    {profileData?.profile?.name || authState.user.name}
                  </span>
                  <ChevronDown className="ml-1 h-4 w-4 text-white" />
                </button>
                {isUserOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50">
                    {/* Dropdown Header with Profile Info */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center">
                        <img
                          src={profileData?.profile?.img || defaultProfileImg}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {profileData?.profile?.name || authState.user.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {authState.user.role}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Dropdown Menu Links */}
                    <div className="py-2">
                      <Link
                        to="/view-profile"
                        className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/wishlist"
                        className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                      >
                        My Wishlist
                      </Link>
                      {authState.user.role === 'Seller' && (
                        <>
                          <Link
                            to="/sales"
                            className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                          >
                            My Sales
                          </Link>
                          <Link
                            to="/add-product"
                            className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                          >
                            Sell Product
                          </Link>
                          <Link
                            to="/seller-products"
                            className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                          >
                            My Products
                          </Link>
                        </>
                      )}
                      <Link
                        onClick={() => dispatch({ type: 'LOGOUT' })}
                        className="block px-4 py-2 text-sm text-gray-900 hover:bg-red-500"
                      >
                        Logout
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 bg-gray-50 rounded-lg p-4 z-50">
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="block text-sm font-medium text-gray-900 hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
