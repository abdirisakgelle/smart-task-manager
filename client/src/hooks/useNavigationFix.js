import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Simplified Navigation Fix Hook
 * Prevents full page reloads on sidebar navigation without complex monitoring
 */
export const useNavigationFix = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Fix sidebar navigation links
  const fixSidebarNavigation = useCallback(() => {
    // Find all sidebar links and ensure they use React Router navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-wrapper a[href^="/"]');
    
    sidebarLinks.forEach(link => {
      // Remove any existing click handlers to prevent conflicts
      const newLink = link.cloneNode(true);
      link.parentNode.replaceChild(newLink, link);
      
      // Add proper click handler
      newLink.addEventListener('click', (e) => {
        e.preventDefault();
        const href = newLink.getAttribute('href');
        if (href && href !== location.pathname) {
          navigate(href);
        }
      });
    });
  }, [navigate, location.pathname]);

  // Ensure proper base path handling
  const ensureBasePath = useCallback(() => {
    // Check if base href is set correctly
    const baseElement = document.querySelector('base');
    if (!baseElement) {
      const base = document.createElement('base');
      base.setAttribute('href', '/');
      document.head.insertBefore(base, document.head.firstChild);
    } else if (baseElement.getAttribute('href') !== '/') {
      baseElement.setAttribute('href', '/');
    }
  }, []);

  // Initialize navigation fixes
  useEffect(() => {
    // Ensure base path is set
    ensureBasePath();
    
    // Fix sidebar navigation
    fixSidebarNavigation();
    
    // Set up a simple interval to fix any dynamically added links
    const interval = setInterval(fixSidebarNavigation, 5000); // Check every 5 seconds
    
    return () => {
      clearInterval(interval);
    };
  }, [fixSidebarNavigation, ensureBasePath]);

  // Re-apply fixes when location changes
  useEffect(() => {
    setTimeout(fixSidebarNavigation, 100);
  }, [location.pathname, fixSidebarNavigation]);

  return {
    fixSidebarNavigation,
    ensureBasePath
  };
};

// Utility function to check if navigation is working correctly
export const checkNavigationHealth = () => {
  const health = {
    timestamp: new Date().toISOString(),
    issues: [],
    recommendations: []
  };

  // Check 1: Base href configuration
  const baseElement = document.querySelector('base');
  if (!baseElement) {
    health.issues.push('Missing base href element');
    health.recommendations.push('Add <base href="/"> to HTML head');
  } else if (baseElement.getAttribute('href') !== '/') {
    health.issues.push('Incorrect base href value');
    health.recommendations.push('Set base href to "/"');
  }

  // Check 2: React Router links
  const sidebarLinks = document.querySelectorAll('.sidebar-wrapper a');
  const reactRouterLinks = Array.from(sidebarLinks).filter(link => link.getAttribute('to'));
  const regularLinks = Array.from(sidebarLinks).filter(link => link.getAttribute('href') && !link.getAttribute('to'));
  
  if (regularLinks.length > 0) {
    health.issues.push(`${regularLinks.length} regular anchor links found in sidebar`);
    health.recommendations.push('Convert anchor links to React Router NavLink components');
  }

  // Check 3: Click handlers
  const linksWithoutHandlers = Array.from(sidebarLinks).filter(link => 
    link.getAttribute('href') && !link.onclick && !link.getAttribute('to')
  );
  
  if (linksWithoutHandlers.length > 0) {
    health.issues.push(`${linksWithoutHandlers.length} links without click handlers`);
    health.recommendations.push('Add preventDefault click handlers to anchor links');
  }

  // Check 4: History API support
  if (!window.history || !window.history.pushState) {
    health.issues.push('History API not supported');
    health.recommendations.push('Consider using HashRouter instead of BrowserRouter');
  }

  // Check 5: Navigation performance
  if (window.performance && window.performance.navigation) {
    const navigationType = window.performance.navigation.type;
    if (navigationType === 1) { // TYPE_RELOAD
      health.issues.push('Page was reloaded (navigation type: 1)');
      health.recommendations.push('Check for navigation event handling issues');
    }
  }

  return health;
};

// Export for global access
if (typeof window !== 'undefined') {
  window.checkNavigationHealth = checkNavigationHealth;
} 