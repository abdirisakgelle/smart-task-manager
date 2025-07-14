// Sidebar Diagnostic Utility
// This utility helps identify why the sidebar might not render on different machines

export const runSidebarDiagnostic = () => {
  const diagnostic = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    windowSize: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    localStorage: {
      sidebarCollapsed: localStorage.getItem('sidebarCollapsed'),
      menuHidden: localStorage.getItem('menuHidden'),
      user: localStorage.getItem('user'),
      token: localStorage.getItem('token'),
    },
    reduxState: null, // Will be populated by component
    cssLoaded: false,
    assetsLoaded: false,
    errors: [],
  };

  // Check if CSS is loaded
  const styleSheets = Array.from(document.styleSheets);
  diagnostic.cssLoaded = styleSheets.some(sheet => 
    sheet.href && sheet.href.includes('app.scss')
  );

  // Check for console errors
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args) => {
    diagnostic.errors.push({ type: 'error', message: args.join(' '), timestamp: new Date().toISOString() });
    originalError.apply(console, args);
  };
  
  console.warn = (...args) => {
    diagnostic.errors.push({ type: 'warning', message: args.join(' '), timestamp: new Date().toISOString() });
    originalWarn.apply(console, args);
  };

  // Check network connectivity
  const checkNetwork = async () => {
    try {
      const response = await fetch('http://192.168.18.40:3000/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      diagnostic.networkStatus = {
        connected: response.ok,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      diagnostic.networkStatus = {
        connected: false,
        error: error.message,
      };
    }
  };

  checkNetwork();

  return diagnostic;
};

export const logSidebarState = (reduxState) => {
  const diagnostic = runSidebarDiagnostic();
  diagnostic.reduxState = reduxState;
  
  console.group('🔍 Sidebar Diagnostic Report');
  console.log('Timestamp:', diagnostic.timestamp);
  console.log('User Agent:', diagnostic.userAgent);
  console.log('Window Size:', diagnostic.windowSize);
  console.log('Local Storage:', diagnostic.localStorage);
  console.log('Redux State:', diagnostic.reduxState);
  console.log('CSS Loaded:', diagnostic.cssLoaded);
  console.log('Network Status:', diagnostic.networkStatus);
  
  if (diagnostic.errors.length > 0) {
    console.group('❌ Errors & Warnings');
    diagnostic.errors.forEach(error => {
      console.log(`${error.type.toUpperCase()}: ${error.message}`);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
  
  return diagnostic;
}; 