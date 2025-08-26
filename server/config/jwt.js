const jwt = require('jsonwebtoken');

// JWT Configuration
const JWT_CONFIG = {
  // Secret key (should be in environment variables)
  SECRET: process.env.JWT_SECRET || 'your-secret-key',
  
  // Different expiration times for different use cases
  EXPIRATION: {
    ACCESS_TOKEN: process.env.JWT_ACCESS_EXPIRATION || '20m',      // Short-lived access token
    REFRESH_TOKEN: process.env.JWT_REFRESH_EXPIRATION || '7d',     // Refresh token (longer)
    ADMIN_TOKEN: process.env.JWT_ADMIN_EXPIRATION || '1h',         // Admin tokens (1 hour)
    API_TOKEN: process.env.JWT_API_EXPIRATION || '15m',            // API tokens (very short)
  },
  
  // Token types
  TYPES: {
    ACCESS: 'access',
    REFRESH: 'refresh',
    ADMIN: 'admin',
    API: 'api'
  }
};

// Generate JWT token with configurable expiration
const generateToken = (payload, type = 'access') => {
  const expiration = JWT_CONFIG.EXPIRATION[type.toUpperCase() + '_TOKEN'] || JWT_CONFIG.EXPIRATION.ACCESS_TOKEN;
  
  return jwt.sign(
    {
      ...payload,
      type: type,
      iat: Math.floor(Date.now() / 1000), // Issued at
    },
    JWT_CONFIG.SECRET,
    { 
      expiresIn: expiration,
      issuer: 'smart-task-manager',
      audience: 'smart-task-manager-users'
    }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_CONFIG.SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Decode token without verification (for getting payload)
const decodeToken = (token) => {
  return jwt.decode(token);
};

// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Get token expiration time
const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

// Get time until token expires (in seconds)
const getTimeUntilExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return 0;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, decoded.exp - currentTime);
  } catch (error) {
    return 0;
  }
};

module.exports = {
  JWT_CONFIG,
  generateToken,
  verifyToken,
  decodeToken,
  isTokenExpired,
  getTokenExpiration,
  getTimeUntilExpiration
}; 