import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './authentication/AuthContext';
import './App.css'; // Or './tailwind.css', depending on your setup
import PrivateRoute from './routes/PrivateRoute';
import RestrictedRoute from './routes/RestrictedRoute';
import SellerRoutes from './routes/SellerRoutes';

import NavBar from './essentials/NavBar';
import Home from './essentials/Home';
import UserCart from './lists/UserCart';

import CreateProfileForm from './forms/CreateProfileForm';
import EditProfileForm from './forms/EditProfileForm';
import ProfileDetail from './details/ProfileDetail';
import SellerDetail from './details/SellerDetail';
import ProductSearch from './details/ProductSearch';

import MySalesList from './lists/MySalesList';
import ProductForm from './forms/ProductForm';
import EditOrderStatus from './forms/EditOrderStatus';
import Wishlist from './lists/Wishlist';
import ProductList from './lists/ProductList';
import ProductCategoryList from './lists/ProductCategoryList';
import ProductListing from './lists/ProductListing';
import SellerProductsList from './lists/SellerProductsList'
import ProductDetail from './details/ProductDetail';
import ProductsByCategoryList from './lists/ProductsByCategoryList';

import Login from './authentication/Login';
import Register from './authentication/Register';
import Cart from './lists/Cart';
import ShoppingCart from './lists/ShoppingCart';
import OrdersList from './lists/OrdersList';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <NavBar />
                {/* NavBar is displayed on all pages */}
                
                <Routes>
                    {/* Public Route */}
                    <Route path="/" element={<Home />} />

                    {/* Restricted Routes for public-only access */}
                    <Route
                        path="/login"
                        element={
                            <RestrictedRoute>
                                <Login />
                            </RestrictedRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <RestrictedRoute>
                                <Register />
                            </RestrictedRoute>
                        }
                    />

<Route
                        path="/user-cart"
                        element={
                            <PrivateRoute>
                                <UserCart />
                            </PrivateRoute>
                        }
                    />
                  
                           <Route
                        path="/create-profile"
                        element={
                            <PrivateRoute>
                                <CreateProfileForm />
                            </PrivateRoute>
                        }
                    />
                           <Route
                        path="/edit-profile"
                        element={
                            <PrivateRoute>
                                <EditProfileForm />
                            </PrivateRoute>
                        }
                    />
                          <Route
                        path="/view-profile"
                        element={
                            <PrivateRoute>
                                <ProfileDetail />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/add-product"
                        element={
                            <SellerRoutes>
                                <ProductForm />
                            </SellerRoutes>
                        }
                    />
                        <Route
                        path="/edit-product/:id"
                        element={
                            <PrivateRoute>
                                <ProductForm />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/cart"
                        element={
                            <PrivateRoute>
                                <ShoppingCart />
                            </PrivateRoute>
                        }
                    />

<Route
                        path="/orders"
                        element={
                            <PrivateRoute>
                                <OrdersList />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/wishlist"
                        element={
                            <PrivateRoute>
                                <Wishlist />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/all-products"
                        element={
                            <PrivateRoute>
                                <ProductList />
                            </PrivateRoute>
                        }
                    />
                     <Route
                        path="/products"
                        element={
                            <PrivateRoute>
                                <ProductListing />
                            </PrivateRoute>
                        }
                    />
                          <Route
                        path="/seller-products"
                        element={
                            <SellerRoutes>
                                <SellerProductsList />
                            </SellerRoutes>
                        }
                    />
                               <Route
                        path="/search-product"
                        element={
                            <PrivateRoute>
                                <ProductSearch />
                            </PrivateRoute>
                        }
                    />
                         <Route
                        path="/product-categories"
                        element={
                            <PrivateRoute>
                                <ProductCategoryList />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/products/:type"
                        element={
                            <PrivateRoute>
                                <ProductsByCategoryList />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/product/:id"
                        element={
                            <PrivateRoute>
                                <ProductDetail />
                            </PrivateRoute>
                        }
                    />
                        <Route
                        path="/seller/:id"
                        element={
                            <PrivateRoute>
                                <SellerDetail />
                            </PrivateRoute>
                        }
                    />
                     <Route
            path="/edit-order/:orderId"
            element={
              <PrivateRoute>
                <EditOrderStatus />
              </PrivateRoute>
            }
          />
               <Route
                        path="/sales"
                        element={
                            <PrivateRoute>
                                <MySalesList />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
