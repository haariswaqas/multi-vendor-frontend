import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../authentication/AuthContext';
import { 
  ShoppingCartIcon, 
  HeartIcon, 
  UserIcon, 
  ArrowRightIcon 
} from 'lucide-react';

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

const FeatureCard = ({ icon, title, description, linkTo, linkText }) => (
  <motion.div 
    variants={itemVariants}
    className="bg-white shadow-md rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-200"
  >
    <div className="flex items-center justify-between">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-gray-900 p-3 rounded-full text-white"
      >
        {icon}
      </motion.div>
      <Link 
        to={linkTo} 
        className="text-orange-500 hover:text-orange-700 transition-colors flex items-center gap-1"
      >
        {linkText}
        <ArrowRightIcon size={16} className="opacity-70" />
      </Link>
    </div>
    <div className="mt-4">
      <h4 className="text-lg font-bold text-gray-800 mb-2">{title}</h4>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

const LoggedOutHome = () => (
  <motion.div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-400 to-gray-900 text-white text-center">
    <div className="max-w-2xl px-6 py-12">
      <h1 className="text-5xl font-bold mb-4">Shop Smarter, Live Better</h1>
      <p className="text-lg mb-8">Discover the latest trends and deals on our platform. Join us today!</p>
      <div className="flex justify-center space-x-6">
        <Link to="/login" className="bg-gray-900 text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-700">
          Log In
        </Link>
        <Link to="/register" className="bg-gray-900 text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-700">
          Sign Up
        </Link>
      </div>
    </div>
  </motion.div>
);

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
    <motion.div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-200 to-gray-800 p-8">
      <h1 className="text-4xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-600 via-gray-800 to-black">
        Welcome, {profile?.name || 'User'}!
      </h1>
      <AnimatePresence>
        {profile && (
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={containerVariants} 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <FeatureCard 
              icon={<UserIcon />} 
              title="Profile" 
              description="Manage your account details." 
              linkTo="/view-profile" 
              linkText="View Profile" 
            />
            <FeatureCard 
              icon={<HeartIcon />} 
              title="Wishlist" 
              description="Your favorite items." 
              linkTo="/wishlist" 
              linkText="View Wishlist" 
            />
            <FeatureCard 
              icon={<ShoppingCartIcon />} 
              title="Cart" 
              description="Check your cart." 
              linkTo="/cart" 
              linkText="View Cart" 
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="text-center mt-8">
        <button 
          onClick={() => dispatch({ type: 'LOGOUT' })} 
          className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </motion.div>
  );
};

export default Home;
