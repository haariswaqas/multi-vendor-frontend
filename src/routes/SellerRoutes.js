import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../authentication/AuthContext';

const SellerRoutes = ({children}) => {
  const { authState } = useAuth();



  return authState.isAuthenticated && authState.user.role === "Seller" ? children : <Navigate to="/" />;
};

export default SellerRoutes;
