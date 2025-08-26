import { useState, useEffect } from 'react';

export const usePermissions = () => {
  const [allowedPages, setAllowedPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user permissions on mount
  useEffect(() => {
    fetchUserPermissions();
  }, []);

  const fetchUserPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Admin always has access to everything
      if (user.system_role === 'admin' || user.role === 'admin') {
        setAllowedPages(['all']); // Special flag for admin
        setLoading(false);
        return;
      }

      // Use relative URL to leverage Vite's proxy
      const response = await fetch('/api/permissions/current-user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }

      const data = await response.json();
      setAllowedPages(data.allowed_pages || []);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(err.message);
      setAllowedPages([]); // Default to no access on error
    } finally {
      setLoading(false);
    }
  };

  // Check if user has access to a specific page
  const hasPermission = (pageName) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Admin has access to everything
    if (user.system_role === 'admin' || user.role === 'admin') {
      return true;
    }

    return allowedPages.includes(pageName);
  };

  // Check if user has access to any of the provided pages
  const hasAnyPermission = (pageNames) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Admin has access to everything
    if (user.system_role === 'admin' || user.role === 'admin') {
      return true;
    }

    return pageNames.some(pageName => allowedPages.includes(pageName));
  };

  // Check if user has access to all of the provided pages
  const hasAllPermissions = (pageNames) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Admin has access to everything
    if (user.system_role === 'admin' || user.role === 'admin') {
      return true;
    }

    return pageNames.every(pageName => allowedPages.includes(pageName));
  };

  // Refresh permissions (useful after login/logout)
  const refreshPermissions = () => {
    fetchUserPermissions();
  };

  return {
    allowedPages,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refreshPermissions
  };
};

export default usePermissions; 