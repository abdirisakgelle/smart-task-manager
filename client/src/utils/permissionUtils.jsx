import { getApiUrl } from './apiUtils';

// Permission utilities for frontend
class PermissionManager {
  constructor() {
    this.allowedPages = [];
    this.isInitialized = false;
  }

  // Initialize permissions after login
  async initializePermissions(userId) {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Admin users have access to all pages
      if (user.role === 'admin') {
        this.allowedPages = ['all']; // Special marker for admin
        this.isInitialized = true;
        localStorage.setItem('userPermissions', JSON.stringify(['all']));
        return true;
      }

      const response = await fetch(getApiUrl('/permissions/current-user'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        this.allowedPages = data.allowed_pages || [];
        this.isInitialized = true;
        
        // Cache in localStorage
        localStorage.setItem('userPermissions', JSON.stringify(this.allowedPages));
        return true;
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch user permissions:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error('Error initializing permissions:', error);
      return false;
    }
  }

  // Load permissions from cache
  loadFromCache() {
    try {
      const cached = localStorage.getItem('userPermissions');
      if (cached) {
        this.allowedPages = JSON.parse(cached);
        this.isInitialized = true;
        return true;
      }
    } catch (error) {
      console.error('Error loading permissions from cache:', error);
    }
    return false;
  }

  // Check if user has access to a specific page
  hasAccess(pageName) {
    if (!this.isInitialized) {
      this.loadFromCache();
    }

    // Admin has access to everything
    if (this.allowedPages.includes('all')) {
      return true;
    }

    return this.allowedPages.includes(pageName);
  }

  // Check if user has access to any of the specified pages
  hasAnyAccess(pageNames) {
    if (!Array.isArray(pageNames)) {
      return this.hasAccess(pageNames);
    }

    return pageNames.some(pageName => this.hasAccess(pageName));
  }

  // Get all allowed pages
  getAllowedPages() {
    if (!this.isInitialized) {
      this.loadFromCache();
    }
    return [...this.allowedPages];
  }

  // Clear permissions (on logout)
  clear() {
    this.allowedPages = [];
    this.isInitialized = false;
    localStorage.removeItem('userPermissions');
  }

  // Filter menu items based on permissions
  filterMenuItems(menuItems) {
    if (!this.isInitialized) {
      this.loadFromCache();
    }

    // Admin sees everything
    if (this.allowedPages.includes('all')) {
      return menuItems;
    }

    return menuItems.filter(item => {
      // If item has a page_name property, check permission
      if (item.page_name) {
        return this.hasAccess(item.page_name);
      }
      
      // If item has a link, extract page name from link
      if (item.link) {
        const pageName = item.link.replace('/', '').split('/')[0] || 'dashboard';
        return this.hasAccess(pageName);
      }

      // If no page_name or link, show by default (like dividers, headers)
      return true;
    });
  }

  // Check if user is admin
  isAdmin() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'admin';
  }
}

// Create singleton instance
const permissionManager = new PermissionManager();

// Export functions for easy use
export const initializePermissions = (userId) => permissionManager.initializePermissions(userId);
export const hasAccess = (pageName) => permissionManager.hasAccess(pageName);
export const hasAnyAccess = (pageNames) => permissionManager.hasAnyAccess(pageNames);
export const getAllowedPages = () => permissionManager.getAllowedPages();
export const clearPermissions = () => permissionManager.clear();
export const filterMenuItems = (menuItems) => permissionManager.filterMenuItems(menuItems);
export const isAdmin = () => permissionManager.isAdmin();

// React hook for permission checking
export const usePermissions = () => {
  return {
    hasAccess,
    hasAnyAccess,
    getAllowedPages,
    isAdmin,
    filterMenuItems
  };
};

// Higher-order component for route protection
export const withPermission = (WrappedComponent, requiredPage) => {
  return function PermissionProtectedComponent(props) {
    const hasPageAccess = hasAccess(requiredPage);
    
    if (!hasPageAccess) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 text-red-500 mx-auto mb-6">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Access Denied
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access this page. Please contact your system administrator.
          </p>
          <button
            onClick={() => window.history.back()}
            className="btn btn-primary"
          >
            Go Back
          </button>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

export default permissionManager; 