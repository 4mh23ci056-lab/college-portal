import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { LoadingSpinner } from '../common/FeedbackState';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F0E5] flex items-center justify-center">
        <LoadingSpinner text="Authenticating institutional credentials..." />
      </div>
    );
  }

  if (!isAuthenticated || !role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(role)) {
    // If authenticated but visiting forbidden role route, send to their own portal
    if (role === 'STUDENT') return <Navigate to="/student" replace />;
    if (role === 'GUIDE') return <Navigate to="/guide" replace />;
    if (role === 'ADMIN') return <Navigate to="/admin" replace />;
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
