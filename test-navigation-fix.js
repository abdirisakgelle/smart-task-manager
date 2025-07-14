#!/usr/bin/env node

/**
 * Test script to verify navigation fixes
 * Run this after applying the navigation fixes to verify everything works
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧭 Testing Navigation Fixes...\n');

// Check if required files exist
const requiredFiles = [
  'client/vite.config.js',
  'client/index.html',
  'client/src/hooks/useNavigationFix.js',
  'client/src/utils/navigationDebug.js',
  'client/src/layout/Layout.jsx'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

// Check for specific fixes in files
console.log('\n🔍 Checking for specific navigation fixes...');

// Check Vite config for SPA routing
const viteConfigContent = fs.readFileSync('client/vite.config.js', 'utf8');
if (viteConfigContent.includes('base: \'/\'') && viteConfigContent.includes('manualChunks')) {
  console.log('✅ SPA routing configured in Vite');
} else {
  console.log('❌ SPA routing not configured in Vite');
}

// Check HTML for base href
const htmlContent = fs.readFileSync('client/index.html', 'utf8');
if (htmlContent.includes('<base href="/" />') && htmlContent.includes('SPA Fallback Script')) {
  console.log('✅ Base href and SPA fallback added to HTML');
} else {
  console.log('❌ Base href or SPA fallback missing from HTML');
}

// Check for navigation fix hook
const layoutContent = fs.readFileSync('client/src/layout/Layout.jsx', 'utf8');
if (layoutContent.includes('useNavigationFix') && layoutContent.includes('useNavigationFix()')) {
  console.log('✅ Navigation fix hook integrated in Layout');
} else {
  console.log('❌ Navigation fix hook not integrated in Layout');
}

// Check for navigation debug utilities
if (fs.existsSync('client/src/utils/navigationDebug.js') && 
    fs.existsSync('client/src/hooks/useNavigationFix.js')) {
  console.log('✅ Navigation debug utilities created');
} else {
  console.log('❌ Navigation debug utilities missing');
}

console.log('\n📋 Manual Testing Checklist:');
console.log('1. Start the client: cd client && npm run dev');
console.log('2. Start the server: cd server && npm start');
console.log('3. Open http://localhost:5173 in browser');
console.log('4. Click sidebar menu items - should navigate without page reload');
console.log('5. Test browser back/forward buttons');
console.log('6. Test direct URL access (e.g., http://localhost:5173/dashboard)');
console.log('7. Test on another machine using your IP address');

console.log('\n🔧 Debug Commands (run in browser console):');
console.log('- testNavigation()');
console.log('- logNavigationDebug()');
console.log('- checkNavigationHealth()');
console.log('- fixNavigationIssues()');
console.log('- monitorNavigation()');

console.log('\n📖 For detailed debugging, see: NAVIGATION_DEBUG_GUIDE.md');

console.log('\n✅ Navigation test script completed. Please run the manual tests above.');

// Additional checks for common issues
console.log('\n🔍 Additional Checks:');

// Check if React Router is properly configured
const mainContent = fs.readFileSync('client/src/main.jsx', 'utf8');
if (mainContent.includes('BrowserRouter')) {
  console.log('✅ BrowserRouter configured correctly');
} else {
  console.log('❌ BrowserRouter not configured');
}

// Check for proper route definitions
const appContent = fs.readFileSync('client/src/App.jsx', 'utf8');
if (appContent.includes('Routes') && appContent.includes('Route')) {
  console.log('✅ Routes configured in App.jsx');
} else {
  console.log('❌ Routes not configured in App.jsx');
}

// Check for NavLink usage in sidebar components
const singleMenuContent = fs.readFileSync('client/src/components/partials/sidebar/single-menu.jsx', 'utf8');
if (singleMenuContent.includes('NavLink') && singleMenuContent.includes('to=')) {
  console.log('✅ NavLink used in single menu component');
} else {
  console.log('❌ NavLink not used in single menu component');
}

console.log('\n🚀 Expected Behavior After Fixes:');
console.log('- Sidebar links navigate without page reloads');
console.log('- Browser history works correctly');
console.log('- Direct URL access functions properly');
console.log('- Consistent behavior across all browsers');
console.log('- No console errors during navigation'); 