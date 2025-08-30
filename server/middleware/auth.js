import { verifyToken as verifyJWTToken, isTokenExpired, decodeToken } from '../config/jwt.js';

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
      system_role: 'admin',
      name: 'Developer Admin',
      ip: clientIP
    };
    return next();
  }
  
  // Fall back to normal token verification
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    console.log(JSON.stringify({ level: 'warn', where: 'verifyToken', reason: 'missing-authorization', requestId: req.requestId }));
    return res.status(401).json({ error: 'Access token required' });
  }

  // Check if token is expired
  if (isTokenExpired(token)) {
    const decoded = decodeToken(token) || {};
    console.log(JSON.stringify({ level: 'info', where: 'verifyToken', reason: 'expired', sub: decoded.user_id, exp: decoded.exp, iat: decoded.iat, now: Math.floor(Date.now()/1000), requestId: req.requestId }));
    return res.status(401).json({ error: 'Token expired' });
  }
  
  try {
    const decoded = verifyJWTToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(JSON.stringify({ level: 'error', where: 'verifyToken', reason: 'invalid-signature', message: err?.message, requestId: req.requestId }));
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Check if token is expired
  if (isTokenExpired(token)) {
    return res.status(401).json({ error: 'Token expired' });
  }
  
  try {
    const decoded = verifyJWTToken(token);
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
      const decoded = verifyJWTToken(token);
      req.user = decoded;
    } catch (err) {
      // Token is invalid, but we continue without user data
    }
  }
  
  next();
};

// Role-based access control middleware
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (req.user.system_role !== role) {
      return res.status(403).json({ 
        error: 'Access forbidden', 
        message: `Role '${role}' required, but user has system_role '${req.user.system_role}'` 
      });
    }
    
    next();
  };
};

// Require any of the specified roles
const requireAnyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.system_role)) {
      return res.status(403).json({ 
        error: 'Access forbidden', 
        message: `One of roles [${roles.join(', ')}] required, but user has system_role '${req.user.system_role}'` 
      });
    }
    
    next();
  };
};

// Data scoping middleware for role-based data filtering
const scopeDataByRole = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Add system-role based data scoping to request object (minimal; org scope comes from addUserContext)
  req.dataScope = {
    systemRole: req.user.system_role,
    userId: req.user.id,
    employeeId: req.user.employee_id
  };
  
  next();
};

export {
  verifyToken,
  optionalVerifyToken,
  adminAuth,
  requireRole,
  requireAnyRole,
  scopeDataByRole
}; 