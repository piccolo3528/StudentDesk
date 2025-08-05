import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import Loader from './Loader';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return <Loader message="Checking authentication..." />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified and user doesn't have required role, redirect to home
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  // If authenticated and has correct role (or no role specified), render the protected component
  return <Outlet />;
};

export default ProtectedRoute;