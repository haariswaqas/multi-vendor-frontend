import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, MailIcon, LockIcon, PhoneIcon } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Buyer');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:8001/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          phone,
          role,
        }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      navigate('/login');
    } catch (error) {
      setError(error.message || 'Registration failed');
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-0 to-gray-0 py-12 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg shadow-xl p-8 space-y-6"
      >
        <Link to="/" className="block text-center mb-4">
          <div className="flex items-center justify-center gap-2">
            <UserPlus className="w-8 h-8 text-gray-100" />
            <h1 className="text-3xl font-bold text-gray-100">CyberMart</h1>
          </div>
        </Link>
        <h2 className="text-2xl font-semibold text-gray-100 text-center mb-6">
          Create your account
        </h2>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-600/30 text-gray-100 p-4 rounded-lg text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 flex items-center gap-1"
            >
              <MailIcon className="w-5 h-5" />
              Your Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="name@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-900"
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 flex items-center gap-1"
            >
              <LockIcon className="w-5 h-5" />
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-900"
            />
          </div>

          {/* Confirm Password Input */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-300 flex items-center gap-1"
            >
              <LockIcon className="w-5 h-5" />
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="••••••••"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-900"
            />
          </div>

          {/* Phone Input */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-300 flex items-center gap-1"
            >
              <PhoneIcon className="w-5 h-5" />
              Phone
            </label>
            <input
              type="text"
              id="phone"
              placeholder="Enter your phone number"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-900"
            />
          </div>

          {/* Role Selector */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-300">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-900"
            >
              <option value="Buyer">Buyer</option>
              <option value="Seller">Seller</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-700 text-gray-100 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 text-lg"
          >
            Create Account
          </button>
          <p className="text-sm text-center text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-gray-200 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>
    </section>
  );
};

export default Register;
