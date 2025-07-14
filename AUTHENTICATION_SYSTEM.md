# Smart Task Manager - Authentication System

## 🎯 Overview

A fully functional authentication system has been implemented for the Smart Task Manager application, featuring user login, registration, role-based access control, and user management capabilities.

## 🔐 Authentication Features

### ✅ Implemented Features
- **User Login** - Secure login with username/password
- **User Registration** - Admin can create new users
- **Role-Based Access** - Admin, Manager, and User roles
- **JWT Token Authentication** - Secure session management
- **User Management** - View, create, and delete users
- **Profile Management** - View current user profile
- **Plain Text Passwords** - As requested (no hashing for demo)

## 🚀 Quick Start

### 1. Database Setup
```bash
cd server
npm run init-db
```

### 2. Create Test Users
```bash
node scripts/add-test-users.js
```

### 3. Start the Application
```bash
# From root directory
npm run dev
```

## 👤 Default Login Credentials

| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| `admin` | `admin123` | Admin | Full system access |
| `user` | `user123` | User | Basic access |
| `manager` | `manager123` | Manager | Management access |

## 🏗️ System Architecture

### Backend Structure
```
server/
├── controllers/
│   └── usersController.js     # User CRUD operations
├── middleware/
│   └── auth.js               # JWT verification
├── routes/
│   └── users.js              # User API endpoints
├── database/
│   └── schema.sql            # Database schema
└── scripts/
    ├── init-db.js            # Database initialization
    ├── check-users.js        # User verification
    └── add-test-users.js     # Test user creation
```

### Frontend Structure
```
client/src/
├── pages/auth/
│   ├── login.jsx             # Login page
│   └── common/
│       └── login-form.jsx    # Login form component
├── pages/users/
│   ├── index.jsx             # Users management page
│   └── UserRegistration.jsx  # User creation form
├── store/api/auth/
│   ├── authApiSlice.js       # RTK Query auth API
│   └── authSlice.js          # Redux auth state
└── utils/
    └── apiUtils.js           # API utilities
```

## 🔧 API Endpoints

### Authentication Endpoints
```javascript
POST /api/users/login          // User login
POST /api/users                // Create new user
GET  /api/users/profile        // Get current user profile
GET  /api/users                // Get all users (admin only)
GET  /api/users/:id            // Get user by ID
PUT  /api/users/:id            // Update user
DELETE /api/users/:id          // Delete user
```

### Request/Response Examples

#### Login Request
```javascript
POST /api/users/login
{
  "username": "admin",
  "password": "admin123"
}
```

#### Login Response
```javascript
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "username": "admin",
    "role": "admin",
    "employee_id": null
  }
}
```

## 🎨 User Interface

### Login Page
- Clean, modern login form
- Demo credentials displayed
- Form validation with error handling
- Responsive design

### Users Management Page
- Complete user listing with roles
- User creation form
- User deletion functionality
- System statistics
- Role-based badges

### Features
- **Real-time Updates** - Automatic refresh after operations
- **Error Handling** - Comprehensive error messages
- **Loading States** - Visual feedback during operations
- **Responsive Design** - Works on all screen sizes
- **Dark Mode Support** - Consistent with app theme

## 🔒 Security Implementation

### JWT Token Management
```javascript
// Token storage
localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify(response.data.user));

// Token usage in API calls
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Authentication Middleware
```javascript
// Server-side token verification
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

## 👥 Role-Based Access Control

### Role Hierarchy
1. **Admin** - Full system access
   - Create/delete users
   - Access all features
   - System administration

2. **Manager** - Management access
   - Team management
   - Content approval
   - Analytics access

3. **User** - Basic access
   - Ticket management
   - Content creation
   - Personal dashboard

### Role Implementation
```javascript
// Role checking in components
const { data: currentUser } = useGetCurrentUserQuery();
const isAdmin = currentUser?.role === 'admin';
const isManager = currentUser?.role === 'manager' || currentUser?.role === 'admin';
```

## 🛠️ Development Tools

### Database Scripts
```bash
# Check current users
node scripts/check-users.js

# Add test users
node scripts/add-test-users.js

# Initialize database
npm run init-db
```

### Debug Commands
```javascript
// Enable debug mode
localStorage.setItem('debug_auth', 'true');

// Check authentication state
console.log('Auth State:', store.getState().auth);
```

## 🔄 State Management

### Redux Store Structure
```javascript
{
  auth: {
    user: {
      user_id: 1,
      username: "admin",
      role: "admin"
    },
    isAuth: true
  }
}
```

### RTK Query Integration
```javascript
// Auth API slice
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: "/users/login",
        method: "POST",
        body: data,
      }),
    }),
    getCurrentUser: builder.query({
      query: () => ({
        url: "/users/profile",
        method: "GET",
      }),
    }),
  }),
});
```

## 🚨 Error Handling

### Common Error Scenarios
1. **Invalid Credentials** - Clear error messages
2. **Network Errors** - Retry mechanisms
3. **Token Expiration** - Automatic logout
4. **Permission Denied** - Role-based access control

### Error Response Format
```javascript
{
  "error": "Invalid credentials",
  "status": 401
}
```

## 📱 Responsive Design

### Mobile Support
- Touch-friendly interface
- Optimized form inputs
- Responsive tables
- Mobile navigation

### Desktop Features
- Full-width layouts
- Hover effects
- Keyboard navigation
- Advanced filtering

## 🔧 Configuration

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Server
PORT=3000
```

### Database Schema
```sql
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user', 'manager') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] User registration (admin only)
- [ ] User deletion (admin only)
- [ ] Role-based access control
- [ ] Token expiration handling
- [ ] Responsive design
- [ ] Error handling

### Automated Testing
```bash
# Run authentication tests
npm test auth

# Test API endpoints
npm test api
```

## 🚀 Deployment

### Production Considerations
1. **Password Hashing** - Enable bcrypt for production
2. **HTTPS** - Secure token transmission
3. **Environment Variables** - Secure configuration
4. **Database Security** - Proper access controls
5. **Rate Limiting** - Prevent brute force attacks

### Security Checklist
- [ ] JWT_SECRET is strong and unique
- [ ] HTTPS is enabled
- [ ] Passwords are hashed (for production)
- [ ] Rate limiting is configured
- [ ] CORS is properly configured
- [ ] Input validation is implemented

## 📈 Performance Optimization

### Frontend Optimizations
- Lazy loading of components
- Memoized selectors
- Optimistic updates
- Efficient re-renders

### Backend Optimizations
- Database indexing
- Connection pooling
- Caching strategies
- Query optimization

## 🔮 Future Enhancements

### Planned Features
1. **Password Reset** - Email-based password recovery
2. **Two-Factor Authentication** - Enhanced security
3. **Session Management** - Multiple device support
4. **Audit Logging** - User activity tracking
5. **Advanced Permissions** - Granular access control

### Technical Improvements
1. **Password Hashing** - bcrypt implementation
2. **Refresh Tokens** - Extended session management
3. **OAuth Integration** - Social login options
4. **API Rate Limiting** - Enhanced security
5. **Real-time Notifications** - Live updates

## 📞 Support

### Common Issues
1. **Login Fails** - Check database connection and user credentials
2. **Token Expired** - Clear localStorage and re-login
3. **Permission Denied** - Verify user role and permissions
4. **Database Errors** - Check database schema and connection

### Debug Commands
```javascript
// Check authentication state
console.log('Auth:', store.getState().auth);

// Check localStorage
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));

// Test API connection
fetch('/api/users/profile', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
}).then(r => r.json()).then(console.log);
```

---

**Note**: This authentication system is designed for demonstration purposes with plain text passwords. For production use, implement proper password hashing and additional security measures. 