import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../authentication/AuthContext';

const RestrictedRoute = ({ children }) => {
  const { authState } = useAuth();

  // If the user is authenticated, redirect to the profile or homepage
  return authState.isAuthenticated ? <Navigate to="/" /> : children;
};

export default RestrictedRoute;
