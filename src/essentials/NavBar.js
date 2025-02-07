import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, ChevronDown } from 'lucide-react';
import { useAuth } from '../authentication/AuthContext';

const Navbar = () => {
  const { authState } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/all-products' },
    { name: 'Sell Product', href: '/add-product' },
    { name: "Today's Deals", href: '/todays-deals' },
  ];

  useEffect(() => {
    const fetchCartItems = async () => {
      if (isCartOpen) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch('http://localhost:8003/cart', {
            headers: {
              Authorization: `Bearer ${authState.token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch cart items');
          }
          const data = await response.json();
          setCartItems(data);
        } catch (err) {
          setError(err.message);
          setCartItems([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCartItems();
  }, [isCartOpen, authState.token]);

  return (
    <nav className="bg-white dark:bg-gray-800">
      <div className="max-w-screen-xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side: Logo & Navigation */}
          <div className="flex items-center space-x-8">
            <div className="shrink-0">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-semibold text-gray-900 dark:text-white">
                  Store
                </span>
              </Link>
            </div>
            <ul className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm font-medium text-gray-900 hover:text-primary-700 dark:text-white dark:hover:text-primary-500"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Side: Cart Dropdown, User Menu & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Cart Button & Dropdown Placeholder */}
            <div className="relative">
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="inline-flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ShoppingCart className="h-5 w-5 text-gray-900 dark:text-white" />
                {/* "My Cart" text removed */}
                <ChevronDown className="ml-1 h-4 w-4 text-gray-900 dark:text-white" />
              </button>

              {isCartOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                  {isLoading ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Loading cart items...
                      </p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-red-500">{error}</p>
                    </div>
                  ) : cartItems.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        (Placeholder for cart items)
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart:
                      </div>
                      <ul className="space-y-2">
                        {cartItems.map((item, index) => (
                          <li key={index} className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.product.name}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Qty: {item.product.amount}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        to="/checkout"
                        className="mt-4 w-full bg-primary-700 text-white rounded-lg px-4 py-2 hover:bg-primary-800 block text-center"
                      >
                        Checkout
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserOpen(!isUserOpen)}
                className="inline-flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <User className="h-5 w-5 text-gray-900 dark:text-white" />
                <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                  {authState.isAuthenticated && authState.user
                    ? authState.user.name
                    : 'Account'}
                </span>
                <ChevronDown className="ml-1 h-4 w-4 text-gray-900 dark:text-white" />
              </button>
              {isUserOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                  <div className="py-2">
                    <Link
                      to="/view-profile"
                      className="block px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      My Account
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Orders
                    </Link>
                    <Link
                      to="/edit-profile"
                      className="block px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Settings
                    </Link>
                    <Link
                      to="/sign-out"
                      className="block px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Sign Out
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Menu className="h-5 w-5 text-gray-900 dark:text-white" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="block text-sm font-medium text-gray-900 dark:text-white hover:text-primary-700 dark:hover:text-primary-500"
                  >
                    {link.name}
                  </a>
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
