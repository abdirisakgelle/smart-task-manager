#!/usr/bin/env node

/**
 * Test script to verify sidebar fixes
 * Run this after applying the fixes to verify everything works
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Sidebar Fixes...\n');

// Check if required files exist
const requiredFiles = [
  'client/src/store/api/apiSlice.js',
  'client/src/hooks/useWidth.js',
  'server/server.js',
  'client/src/layout/Layout.jsx',
  'client/src/utils/sidebarDiagnostic.js',
  'client/src/utils/sidebarTest.js'
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
console.log('\n🔍 Checking for specific fixes...');

// Check API slice for dynamic URL
const apiSliceContent = fs.readFileSync('client/src/store/api/apiSlice.js', 'utf8');
if (apiSliceContent.includes('window.location.hostname')) {
  console.log('✅ Dynamic API URL configured');
} else {
  console.log('❌ Dynamic API URL not found');
}

// Check useWidth hook for safety checks
const useWidthContent = fs.readFileSync('client/src/hooks/useWidth.js', 'utf8');
if (useWidthContent.includes('typeof window !== \'undefined\'')) {
  console.log('✅ Window safety checks added');
} else {
  console.log('❌ Window safety checks not found');
}

// Check server CORS configuration
const serverContent = fs.readFileSync('server/server.js', 'utf8');
if (serverContent.includes('isLocalNetwork')) {
  console.log('✅ Flexible CORS configuration added');
} else {
  console.log('❌ Flexible CORS configuration not found');
}

// Check for diagnostic utilities
if (fs.existsSync('client/src/utils/sidebarDiagnostic.js') && 
    fs.existsSync('client/src/utils/sidebarTest.js')) {
  console.log('✅ Diagnostic utilities added');
} else {
  console.log('❌ Diagnostic utilities missing');
}

console.log('\n📋 Manual Testing Checklist:');
console.log('1. Start the client: cd client && npm run dev');
console.log('2. Start the server: cd server && npm start');
console.log('3. Open http://localhost:5173 in browser');
console.log('4. Check if sidebar appears (should be visible on desktop)');
console.log('5. Open browser console and look for diagnostic output');
console.log('6. Test on another machine using your IP address');
console.log('7. Verify sidebar appears on the other machine');

console.log('\n🔧 Debug Commands (run in browser console):');
console.log('- localStorage.setItem("debug_sidebar", "true"); location.reload();');
console.log('- testSidebarRendering()');
console.log('- forceSidebarVisible()');
console.log('- resetSidebarState()');

console.log('\n📖 For detailed troubleshooting, see: SIDEBAR_TROUBLESHOOTING.md');

console.log('\n✅ Test script completed. Please run the manual tests above.'); 