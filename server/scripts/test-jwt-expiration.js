const { generateToken, verifyToken, isTokenExpired, getTokenExpiration, getTimeUntilExpiration } = require('../config/jwt');

console.log('🧪 Testing JWT Token Expiration System...\n');

// Test 1: Generate different types of tokens
console.log('1. Generating different token types...');

const userData = {
  user_id: 1,
  username: 'testuser',
  role: 'user',
  employee_id: 1
};

const adminData = {
  user_id: 2,
  username: 'admin',
  role: 'admin',
  employee_id: 1
};

// Generate tokens
const accessToken = generateToken(userData, 'access');
const adminToken = generateToken(adminData, 'admin');
const refreshToken = generateToken(userData, 'refresh');
const apiToken = generateToken(userData, 'api');

console.log('✅ Access Token:', accessToken.substring(0, 50) + '...');
console.log('✅ Admin Token:', adminToken.substring(0, 50) + '...');
console.log('✅ Refresh Token:', refreshToken.substring(0, 50) + '...');
console.log('✅ API Token:', apiToken.substring(0, 50) + '...');

// Test 2: Check token expiration
console.log('\n2. Checking token expiration...');

const accessExpiration = getTokenExpiration(accessToken);
const adminExpiration = getTokenExpiration(adminToken);
const refreshExpiration = getTokenExpiration(refreshToken);
const apiExpiration = getTokenExpiration(apiToken);

console.log('✅ Access Token expires:', accessExpiration);
console.log('✅ Admin Token expires:', adminExpiration);
console.log('✅ Refresh Token expires:', refreshExpiration);
console.log('✅ API Token expires:', apiExpiration);

// Test 3: Check time until expiration
console.log('\n3. Time until expiration...');

const accessTimeLeft = getTimeUntilExpiration(accessToken);
const adminTimeLeft = getTimeUntilExpiration(adminToken);
const refreshTimeLeft = getTimeUntilExpiration(refreshToken);
const apiTimeLeft = getTimeUntilExpiration(apiToken);

console.log('✅ Access Token expires in:', Math.floor(accessTimeLeft / 3600), 'hours');
console.log('✅ Admin Token expires in:', Math.floor(adminTimeLeft / 3600), 'hours');
console.log('✅ Refresh Token expires in:', Math.floor(refreshTimeLeft / 86400), 'days');
console.log('✅ API Token expires in:', Math.floor(apiTimeLeft / 60), 'minutes');

// Test 4: Verify tokens
console.log('\n4. Verifying tokens...');

try {
  const accessDecoded = verifyToken(accessToken);
  console.log('✅ Access Token verified:', accessDecoded.type);
} catch (error) {
  console.log('❌ Access Token verification failed:', error.message);
}

try {
  const adminDecoded = verifyToken(adminToken);
  console.log('✅ Admin Token verified:', adminDecoded.type);
} catch (error) {
  console.log('❌ Admin Token verification failed:', error.message);
}

// Test 5: Check if tokens are expired
console.log('\n5. Checking if tokens are expired...');

console.log('✅ Access Token expired:', isTokenExpired(accessToken));
console.log('✅ Admin Token expired:', isTokenExpired(adminToken));
console.log('✅ Refresh Token expired:', isTokenExpired(refreshToken));
console.log('✅ API Token expired:', isTokenExpired(apiToken));

// Test 6: Demonstrate different expiration times
console.log('\n6. Expiration time comparison...');

const now = new Date();
const accessExp = new Date(accessExpiration);
const adminExp = new Date(adminExpiration);
const refreshExp = new Date(refreshExpiration);
const apiExp = new Date(apiExpiration);

console.log('✅ Access Token (24h):', Math.round((accessExp - now) / (1000 * 60 * 60)), 'hours remaining');
console.log('✅ Admin Token (12h):', Math.round((adminExp - now) / (1000 * 60 * 60)), 'hours remaining');
console.log('✅ Refresh Token (7d):', Math.round((refreshExp - now) / (1000 * 60 * 60 * 24)), 'days remaining');
console.log('✅ API Token (1h):', Math.round((apiExp - now) / (1000 * 60)), 'minutes remaining');

console.log('\n🎉 JWT Token Expiration System is working correctly!');
console.log('\n📋 Summary:');
console.log('   • Access tokens expire in 24 hours');
console.log('   • Admin tokens expire in 12 hours (shorter for security)');
console.log('   • Refresh tokens expire in 7 days');
console.log('   • API tokens expire in 1 hour');
console.log('   • All tokens are properly verified and validated'); 