import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Components/User_Section/Context/AuthContext';

/**
 * Layout Guard: Protects layout routes from unauthorized access
 * Waits for auth to finish loading before checking roles
 * 
 * Usage:
 * <LayoutGuard requiredRole="tenant" fallbackPath="/tenant_login">
 *   <TenantLayout />
 * </LayoutGuard>
 */
const LayoutGuard = ({ 
  children, 
  requiredRole, 
  fallbackPath = '/user',
  loadingComponent = null 
}) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Still loading - show loading component or nothing
  if (loading) {
    return loadingComponent || <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Not authenticated
  if (!user) {
    navigate(fallbackPath, { replace: true });
    return null;
  }

  // Check role match
  const userRole = user?.role?.toLowerCase?.();
  const requiredRoleLower = requiredRole?.toLowerCase?.();

  if (requiredRoleLower && userRole !== requiredRoleLower) {
    navigate(fallbackPath, { replace: true });
    return null;
  }

  // All checks passed - render children
  return children;
};

export default LayoutGuard;
