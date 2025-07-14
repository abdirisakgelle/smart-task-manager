// Navigation Debug Utility
// This utility helps diagnose sidebar navigation issues causing full page reloads

export const debugNavigation = () => {
  const diagnostic = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    
    // Router state
    router: {
      isClientSide: false,
      historyType: null,
      basePath: null,
    },
    
    // Navigation elements
    navigation: {
      sidebarLinks: [],
      activeLink: null,
      linkTypes: [],
    },
    
    // Event handling
    events: {
      clickEvents: [],
      navigationEvents: [],
    },
    
    // Performance
    performance: {
      navigationType: null,
      pageLoadTime: null,
    },
    
    // Errors
    errors: [],
  };

  // Check if this is a client-side router
  try {
    diagnostic.router.isClientSide = typeof window !== 'undefined' && 
      window.history && 
      window.history.pushState;
    
    diagnostic.router.historyType = window.history ? 'HTML5' : 'Hash';
    
    // Check for base path configuration
    const baseElement = document.querySelector('base');
    diagnostic.router.basePath = baseElement ? baseElement.getAttribute('href') : '/';
  } catch (error) {
    diagnostic.errors.push(`Router check failed: ${error.message}`);
  }

  // Analyze sidebar navigation links
  try {
    const sidebarLinks = document.querySelectorAll('.sidebar-wrapper a, .sidebar-wrapper [role="link"]');
    diagnostic.navigation.sidebarLinks = Array.from(sidebarLinks).map(link => ({
      href: link.getAttribute('href'),
      to: link.getAttribute('to'),
      className: link.className,
      textContent: link.textContent?.trim(),
      isNavLink: link.tagName === 'A' && link.className.includes('menu-link'),
      hasClickHandler: !!link.onclick,
      target: link.getAttribute('target'),
      rel: link.getAttribute('rel'),
    }));
    
    // Find active link
    const activeLink = document.querySelector('.sidebar-wrapper .menu-item-active a, .sidebar-wrapper .active');
    if (activeLink) {
      diagnostic.navigation.activeLink = {
        href: activeLink.getAttribute('href'),
        to: activeLink.getAttribute('to'),
        className: activeLink.className,
      };
    }
    
    // Analyze link types
    diagnostic.navigation.linkTypes = diagnostic.navigation.sidebarLinks.map(link => {
      if (link.to && link.to.startsWith('/')) return 'React Router NavLink';
      if (link.href && link.href.startsWith('/')) return 'Regular Anchor';
      if (link.href && link.href.startsWith('http')) return 'External Link';
      return 'Unknown';
    });
  } catch (error) {
    diagnostic.errors.push(`Navigation analysis failed: ${error.message}`);
  }

  // Monitor navigation performance
  if (window.performance && window.performance.navigation) {
    diagnostic.performance.navigationType = window.performance.navigation.type;
    diagnostic.performance.pageLoadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
  }

  return diagnostic;
};

export const logNavigationDebug = () => {
  const diagnostic = debugNavigation();
  
  console.group('🧭 NAVIGATION DEBUG REPORT');
  console.log('📅 Timestamp:', diagnostic.timestamp);
  console.log('🌐 Current URL:', diagnostic.url);
  console.log('📍 Pathname:', diagnostic.pathname);
  
  console.group('🔄 Router Configuration');
  console.log('Client-Side Router:', diagnostic.router.isClientSide);
  console.log('History Type:', diagnostic.router.historyType);
  console.log('Base Path:', diagnostic.router.basePath);
  console.groupEnd();
  
  console.group('🔗 Navigation Links');
  console.log('Total Sidebar Links:', diagnostic.navigation.sidebarLinks.length);
  console.log('Link Types:', diagnostic.navigation.linkTypes);
  console.log('Active Link:', diagnostic.navigation.activeLink);
  
  if (diagnostic.navigation.sidebarLinks.length > 0) {
    console.group('📋 Link Details');
    diagnostic.navigation.sidebarLinks.forEach((link, index) => {
      console.log(`Link ${index + 1}:`, {
        href: link.href,
        to: link.to,
        type: diagnostic.navigation.linkTypes[index],
        isNavLink: link.isNavLink,
        hasClickHandler: link.hasClickHandler,
        className: link.className
      });
    });
    console.groupEnd();
  }
  console.groupEnd();
  
  console.group('⚡ Performance');
  console.log('Navigation Type:', diagnostic.performance.navigationType);
  console.log('Page Load Time:', diagnostic.performance.pageLoadTime + 'ms');
  console.groupEnd();
  
  if (diagnostic.errors.length > 0) {
    console.group('❌ Errors');
    diagnostic.errors.forEach(error => console.log('ERROR:', error));
    console.groupEnd();
  }
  
  console.groupEnd();
  
  return diagnostic;
};

// Monitor navigation events
export const monitorNavigation = () => {
  const navigationEvents = [];
  
  // Monitor popstate events
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;
  
  window.history.pushState = function(...args) {
    navigationEvents.push({
      type: 'pushState',
      timestamp: new Date().toISOString(),
      args: args
    });
    return originalPushState.apply(this, args);
  };
  
  window.history.replaceState = function(...args) {
    navigationEvents.push({
      type: 'replaceState',
      timestamp: new Date().toISOString(),
      args: args
    });
    return originalReplaceState.apply(this, args);
  };
  
  // Monitor popstate events
  window.addEventListener('popstate', (event) => {
    navigationEvents.push({
      type: 'popstate',
      timestamp: new Date().toISOString(),
      event: event
    });
  });
  
  // Monitor link clicks
  document.addEventListener('click', (event) => {
    const target = event.target.closest('a');
    if (target && target.closest('.sidebar-wrapper')) {
      navigationEvents.push({
        type: 'sidebarClick',
        timestamp: new Date().toISOString(),
        href: target.getAttribute('href'),
        to: target.getAttribute('to'),
        defaultPrevented: event.defaultPrevented,
        target: target
      });
    }
  });
  
  return {
    events: navigationEvents,
    getEvents: () => navigationEvents,
    clearEvents: () => navigationEvents.length = 0
  };
};

// Test navigation behavior
export const testNavigation = () => {
  console.group('🧪 NAVIGATION TEST');
  
  // Test 1: Check if links are using React Router
  const sidebarLinks = document.querySelectorAll('.sidebar-wrapper a');
  let reactRouterLinks = 0;
  let regularLinks = 0;
  
  sidebarLinks.forEach(link => {
    if (link.getAttribute('to')) {
      reactRouterLinks++;
    } else if (link.getAttribute('href')) {
      regularLinks++;
    }
  });
  
  console.log('React Router Links:', reactRouterLinks);
  console.log('Regular Anchor Links:', regularLinks);
  console.log('Recommendation:', reactRouterLinks > 0 ? '✅ Using React Router' : '❌ Using regular anchors');
  
  // Test 2: Check for preventDefault on clicks
  const hasClickHandlers = Array.from(sidebarLinks).some(link => link.onclick);
  console.log('Click Handlers Present:', hasClickHandlers);
  
  // Test 3: Check base href configuration
  const baseElement = document.querySelector('base');
  console.log('Base Href Configured:', !!baseElement);
  if (baseElement) {
    console.log('Base Href Value:', baseElement.getAttribute('href'));
  }
  
  // Test 4: Check for history API fallback
  console.log('History API Available:', !!window.history.pushState);
  
  console.groupEnd();
  
  return {
    reactRouterLinks,
    regularLinks,
    hasClickHandlers,
    baseHrefConfigured: !!baseElement,
    historyApiAvailable: !!window.history.pushState
  };
};

// Fix common navigation issues
export const fixNavigationIssues = () => {
  console.group('🔧 APPLYING NAVIGATION FIXES');
  
  const fixes = [];
  
  // Fix 1: Add preventDefault to regular anchor links
  const sidebarLinks = document.querySelectorAll('.sidebar-wrapper a[href^="/"]:not([to])');
  sidebarLinks.forEach(link => {
    if (!link.onclick) {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const href = link.getAttribute('href');
        if (href) {
          window.history.pushState({}, '', href);
          // Trigger a popstate event to notify React Router
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      });
      fixes.push(`Added preventDefault to: ${link.getAttribute('href')}`);
    }
  });
  
  // Fix 2: Ensure base href is set
  if (!document.querySelector('base')) {
    const baseElement = document.createElement('base');
    baseElement.setAttribute('href', '/');
    document.head.insertBefore(baseElement, document.head.firstChild);
    fixes.push('Added base href="/"');
  }
  
  console.log('Applied Fixes:', fixes);
  console.groupEnd();
  
  return fixes;
};

// Export for global access
if (typeof window !== 'undefined') {
  window.debugNavigation = debugNavigation;
  window.logNavigationDebug = logNavigationDebug;
  window.monitorNavigation = monitorNavigation;
  window.testNavigation = testNavigation;
  window.fixNavigationIssues = fixNavigationIssues;
} 