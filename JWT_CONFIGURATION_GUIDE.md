# 🔐 JWT Token Expiration Configuration Guide

## 📋 Overview

This guide explains how JWT token expiration works in the Smart Task Manager system and how to configure different expiration times for enhanced security.

## ⚙️ **Current Configuration**

### **Default Expiration Times**
- **Access Token**: `24h` (24 hours) - Regular user sessions
- **Admin Token**: `12h` (12 hours) - Admin sessions (shorter for security)
- **Refresh Token**: `7d` (7 days) - Long-term refresh tokens
- **API Token**: `1h` (1 hour) - Short-lived API tokens

### **Environment Variables**
```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# JWT Token Expiration Times
JWT_ACCESS_EXPIRATION=24h      # Regular user access tokens
JWT_REFRESH_EXPIRATION=7d      # Refresh tokens (longer)
JWT_ADMIN_EXPIRATION=12h       # Admin tokens (shorter for security)
JWT_API_EXPIRATION=1h          # API tokens (very short)
```

## 🎯 **Benefits of JWT Token Expiration**

### **1. Security Benefits**
- **🔒 Reduced Attack Window**: Short-lived tokens limit the time an attacker can use a stolen token
- **🛡️ Automatic Session Management**: Users are automatically logged out after expiration
- **🚫 Token Revocation**: Expired tokens cannot be used, even if stolen
- **📊 Audit Trail**: Clear session boundaries for security monitoring

### **2. Performance Benefits**
- **⚡ Reduced Server Load**: Expired tokens are rejected immediately
- **💾 Memory Efficiency**: No need to store session data on server
- **🔄 Scalability**: Stateless authentication works across multiple servers

### **3. User Experience Benefits**
- **🔄 Automatic Refresh**: Users can refresh tokens without re-login
- **🔐 Progressive Security**: Different expiration times for different use cases
- **📱 Mobile Friendly**: Works well with mobile apps and web browsers

## 🔧 **Configuration Options**

### **Different Token Types**

#### **1. Access Tokens (24h)**
```javascript
// Regular user sessions
const accessToken = generateToken(userData, 'access');
// Expires in 24 hours
```

#### **2. Admin Tokens (12h)**
```javascript
// Admin sessions - shorter for security
const adminToken = generateToken(userData, 'admin');
// Expires in 12 hours
```

#### **3. Refresh Tokens (7d)**
```javascript
// Long-term refresh capability
const refreshToken = generateToken(userData, 'refresh');
// Expires in 7 days
```

#### **4. API Tokens (1h)**
```javascript
// Short-lived API access
const apiToken = generateToken(userData, 'api');
// Expires in 1 hour
```

### **Custom Expiration Times**

You can set custom expiration times using environment variables:

```bash
# Very short sessions (for high-security environments)
JWT_ACCESS_EXPIRATION=2h

# Longer sessions (for development)
JWT_ACCESS_EXPIRATION=7d

# Ultra-short sessions (for API access)
JWT_API_EXPIRATION=15m
```

## 🔄 **Token Refresh System**

### **How It Works**
1. **Login**: User gets both access token and refresh token
2. **Access**: Use access token for API calls
3. **Expiration**: When access token expires, use refresh token
4. **Refresh**: Get new access token without re-login
5. **Security**: Refresh tokens have longer expiration but are more secure

### **Frontend Implementation**
```javascript
// Check if token is about to expire
const isTokenExpiringSoon = (token) => {
  const timeUntilExpiration = getTimeUntilExpiration(token);
  return timeUntilExpiration < 300; // 5 minutes
};

// Refresh token automatically
const refreshTokenIfNeeded = async () => {
  const token = localStorage.getItem('token');
  if (isTokenExpiringSoon(token)) {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch('/api/users/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    const data = await response.json();
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
  }
};
```

## 🛡️ **Security Best Practices**

### **1. Token Storage**
- **✅ Secure**: Store in `httpOnly` cookies or secure localStorage
- **❌ Avoid**: Don't store in plain text or insecure locations
- **🔄 Refresh**: Implement automatic token refresh

### **2. Token Validation**
- **✅ Verify**: Always verify tokens on server side
- **✅ Expire**: Check expiration before processing requests
- **✅ Revoke**: Implement token blacklisting if needed

### **3. Environment Configuration**
```bash
# Production (shorter sessions)
JWT_ACCESS_EXPIRATION=8h
JWT_ADMIN_EXPIRATION=4h
JWT_REFRESH_EXPIRATION=30d

# Development (longer sessions)
JWT_ACCESS_EXPIRATION=7d
JWT_ADMIN_EXPIRATION=7d
JWT_REFRESH_EXPIRATION=30d
```

## 📊 **Monitoring and Analytics**

### **Token Usage Metrics**
- **Active Sessions**: Track number of active tokens
- **Expiration Events**: Monitor when tokens expire
- **Refresh Rate**: Track how often tokens are refreshed
- **Security Events**: Monitor failed authentication attempts

### **Implementation Example**
```javascript
// Track token usage
const trackTokenUsage = (token, action) => {
  const decoded = decodeToken(token);
  console.log(`Token ${action}:`, {
    user_id: decoded.user_id,
    type: decoded.type,
    expires_at: new Date(decoded.exp * 1000),
    time_until_expiry: getTimeUntilExpiration(token)
  });
};
```

## 🚀 **Production Recommendations**

### **1. Security Settings**
```bash
# High-security environment
JWT_ACCESS_EXPIRATION=2h
JWT_ADMIN_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d
JWT_SECRET=very-long-random-secret-key-256-bits
```

### **2. Monitoring**
- Implement token usage analytics
- Set up alerts for unusual token patterns
- Monitor failed authentication attempts
- Track token refresh patterns

### **3. Backup Strategies**
- Implement refresh token rotation
- Set up token blacklisting for compromised tokens
- Create emergency token revocation procedures

## 🎉 **Summary**

JWT token expiration provides:

✅ **Enhanced Security**: Limited attack windows and automatic session management  
✅ **Better Performance**: Reduced server load and stateless authentication  
✅ **Flexible Configuration**: Different expiration times for different use cases  
✅ **User Experience**: Automatic refresh without re-login  
✅ **Scalability**: Works across multiple servers and environments  

The Smart Task Manager now has a robust, configurable JWT system that balances security with user experience! 🔐✨ 