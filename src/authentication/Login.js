import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserIcon, LockIcon, LogInIcon } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          login(data.token);
          navigate('/');
        } else {
          setError('Login failed: Invalid credentials');
        }
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-300 py-12 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-8 space-y-6"
      >
        <Link to="/" className="block text-center mb-4">
          <div className="flex items-center justify-center gap-2">
            <LogInIcon className="w-8 h-8 text-gray-100" />
            <h1 className="text-3xl font-bold text-gray-100">MultiVendorApp</h1>
          </div>
        </Link>
        <h2 className="text-2xl font-semibold text-gray-100 text-center mb-6">
          Welcome Back
        </h2>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-600/30 text-gray-100 p-4 rounded-lg text-center mb-4"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              <div className="flex items-center gap-1">
                <UserIcon className="w-5 h-5" />
                <span>Your Email</span>
              </div>
            </label>
            <input
              type="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-900"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              <div className="flex items-center gap-1">
                <LockIcon className="w-5 h-5" />
                <span>Password</span>
              </div>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-900"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-700 text-gray-100 py-2 rounded-md hover:bg-gray-600 transition-colors text-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {isLoading ? 'Logging in...' : 'Sign In'}
          </button>

          <p className="text-sm text-center text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-gray-200 hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </motion.div>
    </section>
  );
};

export default Login;
