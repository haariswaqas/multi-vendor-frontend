import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SalesChart from '../charts/SalesChart';
import OrdersChart from '../charts/OrdersChart';
import Cart from '../lists/Cart';
import { useAuth } from '../authentication/AuthContext';
import { 
  ShoppingCartIcon, 
  HeartIcon, 
  UserIcon, 
  ArrowRightIcon, 
  LineChartIcon,
  CreditCardIcon,
  TagIcon,
  PackageIcon
} from 'lucide-react';

// Framer Motion variants for container and item animations.
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { delayChildren: 0.3, staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: "spring", damping: 12, stiffness: 100 } 
  }
};

// Reusable FeatureCard component with improved styling.
const FeatureCard = ({ icon, title, description, linkTo, linkText }) => (
  <motion.div 
    variants={itemVariants}
    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-transform duration-300 transform hover:-translate-y-2 border border-gray-100"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
        >
          {icon}
        </motion.div>
        <h4 className="text-xl font-bold text-gray-800">{title}</h4>
      </div>
      {linkTo && (
        <Link to={linkTo} className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors">
          {linkText || "Learn More"}
          <ArrowRightIcon size={18} className="ml-1" />
        </Link>
      )}
    </div>
    <p className="mt-4 text-gray-600 text-sm">{description}</p>
  </motion.div>
);

// The homepage shown when the user is not logged in.
const LoggedOutHome = () => (
  <motion.div 
    className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 to-indigo-100 text-gray-900 px-6 py-12"
    initial="hidden" 
    animate="visible" 
    variants={containerVariants}
  >
    <div className="flex flex-col items-center">
      <img 
        src="https://i.ibb.co/DHZ98Ghs/Cyber-Mart-Logo.jpg" 
        alt="CyberMart Logo" 
        className="w-32 h-32 md:w-48 md:h-48 mb-4"
      />
      <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4">
        Welcome to CyberMart
      </h1>
      <p className="text-lg text-center mb-8 max-w-2xl">
        Discover products from various vendors. Shop, manage your orders, and enjoy seamless transactions.
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
      <FeatureCard 
        icon={<ShoppingCartIcon size={40} />} 
        title="Shop & Buy" 
        description="Browse products, add them to your cart, and complete your purchase effortlessly." 
      />
      <FeatureCard 
        icon={<HeartIcon size={40} />} 
        title="Wishlist" 
        description="Save your favorite items and purchase them later with ease." 
      />
      <FeatureCard 
        icon={<PackageIcon size={40} />} 
        title="Order Management" 
        description="View your order details and manage your purchases efficiently." 
      />
      <FeatureCard 
        icon={<CreditCardIcon size={40} />} 
        title="Secure Payments" 
        description="Enjoy hassle-free payments with a variety of secure methods." 
      />
      <FeatureCard 
        icon={<TagIcon size={40} />} 
        title="Sell Your Products" 
        description="Become a vendor and start selling your products with ease." 
      />
      <FeatureCard 
        icon={<LineChartIcon size={40} />} 
        title="Sales Analytics" 
        description="Monitor your sales, view detailed statistics, and optimize your strategy." 
      />
    </div>
    <div className="mt-10 flex space-x-4">
      <Link to="/login" className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg shadow-lg transition-colors">
        Log In
      </Link>
      <Link to="/register" className="bg-blue-700 hover:bg-blue-600 text-white px-8 py-3 rounded-lg shadow-lg transition-colors">
        Sign Up
      </Link>
    </div>
  </motion.div>
);

// The homepage for logged-in users with a header, feature grid, charts, cart, and footer.
const Home = () => {
  const { authState, dispatch } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authState.isAuthenticated) {
      setIsLoading(false);
      return;
    }
    fetch('http://localhost:8001/', {
      headers: { 
        'Authorization': `Bearer ${authState.token}`, 
        'Content-Type': 'application/json' 
      },
    })
      .then(response => response.json())
      .then(data => setProfile(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [authState]);

  if (!authState.isAuthenticated) return <LoggedOutHome />;
  if (isLoading) return <div className="h-screen flex justify-center items-center text-xl text-gray-800">Loading...</div>;

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 py-12 px-4 md:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between mb-12">
        <div className="flex items-center space-x-4">
          <img 
            src="https://i.ibb.co/DHZ98Ghs/Cyber-Mart-Logo.jpg" 
            alt="CyberMart Logo" 
            className="w-20 h-20 rounded-full"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome, {profile?.profile?.name || 'New User'}!
            </h1>
            <p className="text-gray-600">{authState.user.role}</p>
          </div>
        </div>
        <button 
          onClick={() => dispatch({ type: 'LOGOUT' })} 
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg shadow-md transition-colors"
        >
          Logout
        </button>
      </header>

      {/* Feature Cards */}
      <section className="mb-12">
        <AnimatePresence>
          {profile && (
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={containerVariants} 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <FeatureCard 
                icon={<UserIcon size={40} />} 
                title="Profile" 
                description="Manage your account details." 
                linkTo="/view-profile" 
                linkText="View Profile" 
              />
              <FeatureCard 
                icon={<HeartIcon size={40} />} 
                title="Wishlist" 
                description="Your favorite items." 
                linkTo="/wishlist" 
                linkText="View Wishlist" 
              />
              <FeatureCard 
                icon={<ShoppingCartIcon size={40} />} 
                title="Cart" 
                description="Check your shopping cart." 
                linkTo="/cart" 
                linkText="View Cart" 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Charts & Cart Section */}
      <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          {authState.user.role === 'Buyer' ? <OrdersChart /> : <SalesChart />}
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <Cart />
        </div>
      </section>
      
      {/* Footer */}
      <footer className="text-center text-gray-600 mt-8">
        &copy; {new Date().getFullYear()} CyberMart. All rights reserved.
      </footer>
    </motion.div>
  );
};

export default Home;
