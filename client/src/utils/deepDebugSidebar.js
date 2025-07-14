// Deep-Dive Sidebar Debugging Utility
// This utility collects comprehensive diagnostics for persistent sidebar issues

export const deepDebugSidebar = async () => {
  const diagnostic = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    hostname: window.location.hostname,
    port: window.location.port,
    protocol: window.location.protocol,
    
    // Window and viewport
    windowSize: {
      width: window.innerWidth,
      height: window.innerHeight,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
    },
    
    // LocalStorage state
    localStorage: {
      sidebarCollapsed: localStorage.getItem('sidebarCollapsed'),
      menuHidden: localStorage.getItem('menuHidden'),
      debug_sidebar: localStorage.getItem('debug_sidebar'),
      user: localStorage.getItem('user'),
      token: localStorage.getItem('token'),
      darkMode: localStorage.getItem('darkMode'),
      type: localStorage.getItem('type'),
    },
    
    // Redux state (will be populated by component)
    reduxState: null,
    
    // CSS and assets
    cssLoaded: false,
    sidebarCSS: false,
    assetsLoaded: false,
    
    // Network connectivity
    apiReachable: false,
    corsEnabled: false,
    networkErrors: [],
    
    // Console errors
    consoleErrors: [],
    consoleWarnings: [],
    
    // Component state
    sidebarComponent: {
      rendered: false,
      visible: false,
      width: null,
      height: null,
      className: null,
      style: null,
    },
    
    // Environment
    environment: {
      nodeEnv: process.env.NODE_ENV,
      apiUrl: process.env.REACT_APP_API_URL,
      isDevelopment: process.env.NODE_ENV === 'development',
    },
    
    // Performance
    performance: {
      loadTime: null,
      domReady: null,
    }
  };

  // Capture console errors and warnings
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args) => {
    diagnostic.consoleErrors.push({
      type: 'error',
      message: args.join(' '),
      timestamp: new Date().toISOString(),
      stack: new Error().stack
    });
    originalError.apply(console, args);
  };
  
  console.warn = (...args) => {
    diagnostic.consoleWarnings.push({
      type: 'warning', 
      message: args.join(' '),
      timestamp: new Date().toISOString()
    });
    originalWarn.apply(console, args);
  };

  // Check CSS loading
  try {
    const styleSheets = Array.from(document.styleSheets);
    diagnostic.cssLoaded = styleSheets.length > 0;
    
    // Check for sidebar-specific CSS
    diagnostic.sidebarCSS = styleSheets.some(sheet => 
      sheet.href && (
        sheet.href.includes('sidebar') || 
        sheet.href.includes('app.scss') ||
        sheet.href.includes('layout')
      )
    );
  } catch (error) {
    diagnostic.consoleErrors.push({
      type: 'error',
      message: `CSS check failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }

  // Test network connectivity
  try {
    const hostname = window.location.hostname;
    const apiUrl = `http://${hostname}:3000/api/users`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    diagnostic.apiReachable = response.ok;
    diagnostic.corsEnabled = true;
    
    if (!response.ok) {
      diagnostic.networkErrors.push({
        url: apiUrl,
        status: response.status,
        statusText: response.statusText
      });
    }
  } catch (error) {
    diagnostic.apiReachable = false;
    diagnostic.networkErrors.push({
      url: `http://${window.location.hostname}:3000/api/users`,
      error: error.message,
      type: error.name
    });
  }

  // Check sidebar component state
  try {
    const sidebarElement = document.querySelector('.sidebar-wrapper');
    if (sidebarElement) {
      diagnostic.sidebarComponent.rendered = true;
      diagnostic.sidebarComponent.visible = sidebarElement.offsetWidth > 0;
      diagnostic.sidebarComponent.width = sidebarElement.offsetWidth;
      diagnostic.sidebarComponent.height = sidebarElement.offsetHeight;
      diagnostic.sidebarComponent.className = sidebarElement.className;
      diagnostic.sidebarComponent.style = window.getComputedStyle(sidebarElement);
    }
  } catch (error) {
    diagnostic.consoleErrors.push({
      type: 'error',
      message: `Sidebar element check failed: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }

  // Performance metrics
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    diagnostic.performance.loadTime = timing.loadEventEnd - timing.navigationStart;
    diagnostic.performance.domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
  }

  return diagnostic;
};

export const logDeepDebug = (reduxState = null) => {
  deepDebugSidebar().then(diagnostic => {
    diagnostic.reduxState = reduxState;
    
    console.group('🔍 DEEP-DIVE SIDEBAR DIAGNOSTIC REPORT');
    console.log('📅 Timestamp:', diagnostic.timestamp);
    console.log('🌐 URL:', diagnostic.url);
    console.log('🖥️ User Agent:', diagnostic.userAgent);
    
    console.group('📏 Window & Viewport');
    console.log('Window Size:', diagnostic.windowSize);
    console.log('Should show sidebar:', diagnostic.windowSize.width > 1280);
    console.groupEnd();
    
    console.group('💾 LocalStorage State');
    console.log('Sidebar Collapsed:', diagnostic.localStorage.sidebarCollapsed);
    console.log('Menu Hidden:', diagnostic.localStorage.menuHidden);
    console.log('Debug Mode:', diagnostic.localStorage.debug_sidebar);
    console.log('User Authenticated:', !!diagnostic.localStorage.user);
    console.log('Token Present:', !!diagnostic.localStorage.token);
    console.groupEnd();
    
    console.group('🎨 CSS & Assets');
    console.log('CSS Loaded:', diagnostic.cssLoaded);
    console.log('Sidebar CSS:', diagnostic.sidebarCSS);
    console.log('StyleSheets Count:', document.styleSheets.length);
    console.groupEnd();
    
    console.group('🌐 Network Status');
    console.log('API Reachable:', diagnostic.apiReachable);
    console.log('CORS Enabled:', diagnostic.corsEnabled);
    if (diagnostic.networkErrors.length > 0) {
      console.log('Network Errors:', diagnostic.networkErrors);
    }
    console.groupEnd();
    
    console.group('🧩 Component State');
    console.log('Sidebar Rendered:', diagnostic.sidebarComponent.rendered);
    console.log('Sidebar Visible:', diagnostic.sidebarComponent.visible);
    console.log('Sidebar Width:', diagnostic.sidebarComponent.width);
    console.log('Sidebar Height:', diagnostic.sidebarComponent.height);
    if (diagnostic.sidebarComponent.className) {
      console.log('Sidebar Classes:', diagnostic.sidebarComponent.className);
    }
    console.groupEnd();
    
    console.group('⚙️ Environment');
    console.log('Node Env:', diagnostic.environment.nodeEnv);
    console.log('API URL:', diagnostic.environment.apiUrl);
    console.log('Is Development:', diagnostic.environment.isDevelopment);
    console.groupEnd();
    
    if (diagnostic.reduxState) {
      console.group('🔄 Redux State');
      console.log('Layout State:', diagnostic.reduxState);
      console.groupEnd();
    }
    
    if (diagnostic.consoleErrors.length > 0) {
      console.group('❌ Console Errors');
      diagnostic.consoleErrors.forEach(error => {
        console.log(`${error.type.toUpperCase()}: ${error.message}`);
      });
      console.groupEnd();
    }
    
    if (diagnostic.consoleWarnings.length > 0) {
      console.group('⚠️ Console Warnings');
      diagnostic.consoleWarnings.forEach(warning => {
        console.log(`WARNING: ${warning.message}`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
    
    return diagnostic;
  });
};

// Network request analyzer
export const analyzeNetworkRequests = () => {
  const requests = performance.getEntriesByType('resource');
  const failedRequests = requests.filter(req => 
    req.name.includes('sidebar') || 
    req.name.includes('api') || 
    req.name.includes('css') ||
    req.name.includes('js')
  );
  
  console.group('🌐 Network Request Analysis');
  console.log('Total Requests:', requests.length);
  console.log('Failed Requests:', failedRequests.length);
  
  failedRequests.forEach(req => {
    console.log(`Failed: ${req.name} (${req.duration}ms)`);
  });
  
  console.groupEnd();
  return failedRequests;
};

// Asset load test
export const testAssetLoad = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ success: true, url });
    img.onerror = () => resolve({ success: false, url, error: 'Failed to load' });
    img.src = url;
  });
};

// Quick diagnostic commands
export const quickDiagnostic = () => {
  console.group('⚡ Quick Sidebar Diagnostic');
  
  // Check window size
  console.log('Window Width:', window.innerWidth);
  console.log('Should Show Sidebar:', window.innerWidth > 1280);
  
  // Check localStorage
  console.log('Sidebar Collapsed:', localStorage.getItem('sidebarCollapsed'));
  console.log('Menu Hidden:', localStorage.getItem('menuHidden'));
  
  // Check if sidebar element exists
  const sidebar = document.querySelector('.sidebar-wrapper');
  console.log('Sidebar Element Found:', !!sidebar);
  if (sidebar) {
    console.log('Sidebar Width:', sidebar.offsetWidth);
    console.log('Sidebar Visible:', sidebar.offsetWidth > 0);
  }
  
  // Check for errors
  console.log('Console Errors:', window.consoleErrors || 'None captured');
  
  console.groupEnd();
};

// Export for global access
if (typeof window !== 'undefined') {
  window.deepDebugSidebar = deepDebugSidebar;
  window.logDeepDebug = logDeepDebug;
  window.analyzeNetworkRequests = analyzeNetworkRequests;
  window.quickDiagnostic = quickDiagnostic;
} 