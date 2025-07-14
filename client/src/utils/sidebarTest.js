// Sidebar Test Utility
// This utility helps test and fix sidebar rendering issues

export const testSidebarRendering = () => {
  const tests = {
    window: {
      innerWidth: typeof window !== 'undefined' ? window.innerWidth : 'N/A',
      innerHeight: typeof window !== 'undefined' ? window.innerHeight : 'N/A',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    },
    localStorage: {
      sidebarCollapsed: localStorage.getItem('sidebarCollapsed'),
      menuHidden: localStorage.getItem('menuHidden'),
      user: localStorage.getItem('user'),
      token: localStorage.getItem('token'),
    },
    css: {
      sidebarStyles: null,
      mobileStyles: null,
    },
    network: {
      apiReachable: false,
      corsEnabled: false,
    },
    errors: [],
  };

  // Test CSS loading
  try {
    const styleSheets = Array.from(document.styleSheets);
    const sidebarSheet = styleSheets.find(sheet => 
      sheet.href && (sheet.href.includes('sidebar') || sheet.href.includes('app.scss'))
    );
    tests.css.sidebarStyles = !!sidebarSheet;
  } catch (error) {
    tests.errors.push(`CSS test failed: ${error.message}`);
  }

  // Test network connectivity
  const testNetwork = async () => {
    try {
      const hostname = window.location.hostname;
      const response = await fetch(`http://${hostname}:3000/api/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      tests.network.apiReachable = response.ok;
      tests.network.corsEnabled = true;
    } catch (error) {
      tests.network.apiReachable = false;
      tests.errors.push(`Network test failed: ${error.message}`);
    }
  };

  testNetwork();

  return tests;
};

export const forceSidebarVisible = () => {
  // Force sidebar to be visible by setting localStorage values
  localStorage.setItem('sidebarCollapsed', 'false');
  localStorage.setItem('menuHidden', 'false');
  
  // Reload the page to apply changes
  window.location.reload();
};

export const resetSidebarState = () => {
  // Reset sidebar state to defaults
  localStorage.removeItem('sidebarCollapsed');
  localStorage.removeItem('menuHidden');
  
  // Reload the page to apply changes
  window.location.reload();
};

export const debugSidebar = () => {
  console.group('🔧 Sidebar Debug Tools');
  console.log('Run testSidebarRendering() to check current state');
  console.log('Run forceSidebarVisible() to force sidebar to show');
  console.log('Run resetSidebarState() to reset to defaults');
  console.log('Set localStorage.debug_sidebar = "true" to enable diagnostics');
  console.groupEnd();
};

// Auto-run debug info in development
if (process.env.NODE_ENV === 'development') {
  debugSidebar();
} 