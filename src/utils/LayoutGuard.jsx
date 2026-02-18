import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Components/User_Section/Context/AuthContext';

// Helper function to check localStorage auth synchronously
const getLocalAuth = () => {
  // Check for various token formats used in the app
  const token = localStorage.getItem('token') || 
               localStorage.getItem('usertoken') ||
               localStorage.getItem('tenanttoken');
  
  if (token) {
    return { isAuthenticated: true, hasToken: true };
  }

  // Check for landlord/tenant user data
  const landlordData = localStorage.getItem('landlord');
  if (landlordData) {
    try {
      const parsed = JSON.parse(landlordData);
      if (parsed?.role === 'landlord') {
        return { isAuthenticated: true, hasToken: true, role: 'landlord' };
      }
    } catch {}
  }

  const tenantData = localStorage.getItem('tenant');
  if (tenantData) {
    try {
      const parsed = JSON.parse(tenantData);
      if (parsed?.role === 'tenant') {
        return { isAuthenticated: true, hasToken: true, role: 'tenant' };
      }
    } catch {}
  }

  return { isAuthenticated: false, hasToken: false };
};

/**
 * Layout Guard: Protects layout routes from unauthorized access
 * Always allows access if localStorage has any token - fixes white screen issue
 * navigate() is called in useEffect to comply with React rules
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
  const redirectAttempted = useRef(false);

  // Get local auth status synchronously
  const localAuth = getLocalAuth();

  // Normalize role
  const normalizeRole = (role) => {
    if (!role) return '';
    return role.toLowerCase().replace(/[_\s-]/g, '');
  };

  // Handle redirect in useEffect - only once
  useEffect(() => {
    // Only redirect if:
    // 1. Not loading anymore
    // 2. No local token exists
    // 3. Haven't already attempted redirect
    if (!loading && !localAuth.hasToken && !redirectAttempted.current) {
      redirectAttempted.current = true;
      navigate(fallbackPath, { replace: true });
    }
  }, [loading, localAuth.hasToken, navigate, fallbackPath]);

  // If we have local auth, ALWAYS render children - don't wait for auth context
  // This fixes the white screen issue after login
  if (localAuth.hasToken) {
    // Optional: Check role match after auth loads (only for display, not blocking)
    if (!loading && user) {
      const normalizedUserRole = normalizeRole(user?.role);
      const normalizedRequiredRole = normalizeRole(requiredRole);
      
      // Only redirect if roles definitely don't match (both exist and are different)
      if (normalizedRequiredRole && normalizedUserRole && normalizedUserRole !== normalizedRequiredRole) {
        // Check localStorage role
        let localRole = '';
        try {
          const landlordData = localStorage.getItem('landlord');
          const tenantData = localStorage.getItem('tenant');
          if (landlordData) localRole = JSON.parse(landlordData).role;
          else if (tenantData) localRole = JSON.parse(tenantData).role;
        } catch {}
        
        const normalizedLocalRole = normalizeRole(localRole);
        if (normalizedLocalRole && normalizedLocalRole !== normalizedRequiredRole) {
          // Redirect in useEffect
          if (!redirectAttempted.current) {
            redirectAttempted.current = true;
            navigate(fallbackPath, { replace: true });
          }
        }
      }
    }
    return children;
  }

  // No local auth - show loading or let useEffect handle redirect
  if (loading) {
    return loadingComponent || <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // No auth and not loading - children will be null due to useEffect redirect
  return children;
};

export default LayoutGuard;
