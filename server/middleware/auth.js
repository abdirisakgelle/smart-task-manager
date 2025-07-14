const jwt = require('jsonwebtoken');

// Admin middleware that bypasses auth for developer's IP
const adminAuth = (req, res, next) => {
  // Check if request is from developer's IP
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const developerIP = '192.168.18.25';
  
  // Also check for environment variable whitelist
  const adminWhitelist = process.env.ADMIN_WHITELIST ? 
    process.env.ADMIN_WHITELIST.split(',').map(ip => ip.trim()) : 
    [developerIP];
  
  if (adminWhitelist.includes(clientIP)) {
    console.log(`Admin access granted for IP: ${clientIP}`);
    // Set admin user context
    req.user = {
      id: 'admin',
      role: 'admin',
      name: 'Developer Admin',
      ip: clientIP
    };
    return next();
  }
  
  // Fall back to normal token verification
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Optional token verification (for routes that can work with or without auth)
const optionalVerifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded;
    } catch (err) {
      // Token is invalid, but we continue without user data
    }
  }
  
  next();
};

module.exports = {
  verifyToken,
  optionalVerifyToken,
  adminAuth
}; 