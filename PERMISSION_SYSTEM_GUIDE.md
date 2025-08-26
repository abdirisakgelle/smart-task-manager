# 🔐 RBAC Permission System - Complete Implementation Guide

## 🎯 Overview

This document outlines the complete implementation of a simplified but secure Role-Based Access Control (RBAC) system for the Smart Task Management platform. The system uses your existing database structure without any schema changes.

## 🏗️ System Architecture

### Database Tables (Existing)
```sql
-- Users table (existing)
users (
  user_id, employee_id, username, password_hash, role, status
)

-- Permissions table (existing)
permissions (
  permission_id, user_id, page_name, can_access
)
```

### Core Components

#### 1. **Backend Components**
- `server/controllers/permissionsController.js` - Permission management logic
- `server/routes/permissions.js` - API endpoints for permissions
- `server/middleware/pageAccess.js` - Route protection middleware
- `server/scripts/init-permissions.js` - Permission initialization script

#### 2. **Frontend Components**
- `client/src/pages/users/PermissionManagement.jsx` - Main permission management page
- `client/src/pages/users/UserPermissionsModal.jsx` - Individual user permission modal
- `client/src/hooks/usePermissions.js` - Custom hook for permission checking

## 🚀 Quick Start

### 1. Initialize Permissions
```bash
cd server
node scripts/init-permissions.js
```

This will:
- Set default permissions for all existing users based on their roles
- Show a summary of permissions assigned to each user

### 2. Start the Application
```bash
# From project root
npm run dev
```

### 3. Access Permission Management
- Login as admin user (`admin` / `admin123`)
- Navigate to "Permission Management" in the sidebar
- Manage user page access

## 🔧 How It Works

### **Permission Flow**

#### **1. User Login**
```javascript
// User logs in → JWT token contains user_id and role
// Frontend fetches user permissions
const response = await fetch('/api/permissions/current-user');
const { allowed_pages } = await response.json();
// Store in localStorage for caching
localStorage.setItem('userPermissions', JSON.stringify(allowed_pages));
```

#### **2. Page Access Check**
```javascript
// Frontend checks permission before showing menu items
const hasPermission = (pageName) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user.role === 'admin') return true; // Admin bypass
  
  const permissions = JSON.parse(localStorage.getItem('userPermissions'));
  return permissions.includes(pageName);
};
```

#### **3. Backend Route Protection**
```javascript
// Backend middleware checks permission on each request
router.get('/tickets', verifyToken, checkPageAccess('tickets'), getTickets);

// checkPageAccess middleware:
const checkPageAccess = (pageName) => {
  return async (req, res, next) => {
    if (req.user.role === 'admin') return next(); // Admin bypass
    
    const [result] = await pool.query(`
      SELECT can_access FROM permissions 
      WHERE user_id = ? AND page_name = ? AND can_access = TRUE
    `, [req.user.user_id, pageName]);
    
    if (result.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    next();
  };
};
```

### **Admin Permission Management**

#### **1. View All Users**
```javascript
GET /api/permissions/users
// Returns: List of users with permission counts
[
  {
    user_id: 1,
    username: "john_agent",
    role: "agent",
    employee_name: "John Smith",
    permission_count: 4
  }
]
```

#### **2. Manage User Permissions**
```javascript
// Get user's current permissions
GET /api/permissions/users/1
// Returns: User info + all available pages with access status

// Update user permissions
PUT /api/permissions/users/1
Body: {
  permissions: [
    { page_name: "dashboard", can_access: true },
    { page_name: "tickets", can_access: true },
    { page_name: "users", can_access: false }
  ]
}
```

## 📋 Available Pages

The system manages access to these pages:

| Page Name | Display Name | Category |
|-----------|-------------|----------|
| `dashboard` | Dashboard | Core |
| `users` | User Management | Administration |
| `employees` | Employee Management | Administration |
| `tickets` | Tickets | Support |
| `ideas` | Creative Ideas | Content |
| `content` | Content Management | Content |
| `production` | Production | Content |
| `social_media` | Social Media | Content |
| `supervisor_reviews` | Supervisor Reviews | Support |
| `follow_ups` | Follow-ups | Support |
| `tasks` | Tasks | Productivity |
| `calendar` | Calendar | Productivity |
| `boards` | Kanban Boards | Productivity |
| `notifications` | Notifications | System |
| `profile` | Profile | Personal |

## 🔐 Default Role Permissions

### **Admin Role**
- ✅ **Full Access**: All pages and features
- ✅ **Permission Management**: Can manage other users' permissions
- ✅ **System Administration**: Complete system control

### **Manager Role**
- ✅ **Management Access**: Most pages except user management
- ❌ **User Management**: Cannot manage users or permissions
- ✅ **Content & Support**: Full access to content and support features

### **Supervisor Role**
- ✅ **Support Focus**: Tickets, supervisor reviews, follow-ups
- ❌ **Content Access**: No access to content creation
- ❌ **User Management**: Cannot manage users

### **Agent Role**
- ✅ **Basic Access**: Dashboard, tickets, notifications
- ❌ **Limited Scope**: No content or management access
- ✅ **Support Tasks**: Can handle tickets and basic tasks

### **Media Role**
- ✅ **Content Focus**: Ideas, content, production, social media
- ❌ **Support Access**: No access to tickets or support features
- ✅ **Creative Workflow**: Full content creation and management

### **Follow-up Role**
- ✅ **Follow-up Focus**: Dashboard, follow-ups, notifications
- ❌ **Limited Scope**: No content or ticket management
- ✅ **Customer Service**: Specialized in follow-up activities

## 🛠️ Implementation Examples

### **Frontend Permission Checking**

#### **1. Menu Item Visibility**
```jsx
import usePermissions from '@/hooks/usePermissions';

const Sidebar = () => {
  const { hasPermission } = usePermissions();
  
  return (
    <nav>
      {hasPermission('dashboard') && (
        <MenuItem title="Dashboard" link="/dashboard" />
      )}
      {hasPermission('users') && (
        <MenuItem title="User Management" link="/users" />
      )}
      {hasPermission('tickets') && (
        <MenuItem title="Tickets" link="/tickets" />
      )}
    </nav>
  );
};
```

#### **2. Route Protection**
```jsx
import { Navigate } from 'react-router-dom';
import usePermissions from '@/hooks/usePermissions';

const ProtectedRoute = ({ pageName, children }) => {
  const { hasPermission, loading } = usePermissions();
  
  if (loading) return <Loading />;
  
  if (!hasPermission(pageName)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Usage
<Route path="/tickets" element={
  <ProtectedRoute pageName="tickets">
    <TicketsPage />
  </ProtectedRoute>
} />
```

#### **3. Component-Level Protection**
```jsx
const TicketActions = () => {
  const { hasPermission } = usePermissions();
  
  return (
    <div>
      <Button>View Ticket</Button>
      {hasPermission('tickets') && (
        <Button>Edit Ticket</Button>
      )}
      {hasPermission('supervisor_reviews') && (
        <Button>Review Ticket</Button>
      )}
    </div>
  );
};
```

### **Backend Route Protection**

#### **1. Basic Route Protection**
```javascript
// Protect entire route group
router.use('/tickets', verifyToken, checkPageAccess('tickets'));

// Or protect individual routes
router.get('/tickets', verifyToken, checkPageAccess('tickets'), getTickets);
router.post('/tickets', verifyToken, checkPageAccess('tickets'), createTicket);
```

#### **2. Feature-Level Protection**
```javascript
// Protect specific features within a page
router.post('/tickets/:id/assign', 
  verifyToken, 
  checkPageAccess('tickets'), 
  checkFeatureAccess('ticket_assignment'), 
  assignTicket
);
```

#### **3. Conditional Logic**
```javascript
const getTickets = async (req, res) => {
  const { hasPermission } = req.user;
  
  // Different data based on permissions
  if (hasPermission('supervisor_reviews')) {
    // Return all tickets with review data
    return res.json(await getAllTicketsWithReviews());
  } else {
    // Return only user's tickets
    return res.json(await getUserTickets(req.user.user_id));
  }
};
```

## 🔄 Permission Update Workflow

### **1. Admin Workflow**
```
1. Admin logs in → Navigate to "Permission Management"
2. Select user from list → See current permissions
3. Toggle page access → Preview changes
4. Click "Save Changes" → Update database
5. User immediately has new access → No restart needed
```

### **2. User Experience**
```
1. User logs in → System fetches permissions
2. Menu items filtered → Only authorized pages shown
3. User navigates to page → Backend verifies access
4. If unauthorized → Redirect to dashboard with message
5. If authorized → Normal page access
```

## 🚨 Error Handling

### **Frontend Error Handling**
```javascript
// API call with permission check
try {
  const response = await fetch('/api/tickets');
  if (response.status === 403) {
    toast.error('Access denied. Please contact your administrator.');
    navigate('/dashboard');
  }
} catch (error) {
  toast.error('Failed to load data');
}
```

### **Backend Error Responses**
```javascript
// 403 Forbidden - No permission
{
  error: "Access denied",
  message: "You don't have permission to access tickets. Please contact your system administrator.",
  page: "tickets"
}

// 401 Unauthorized - No token
{
  error: "Authentication required"
}

// 500 Server Error
{
  error: "Server error checking permissions"
}
```

## 📊 Monitoring & Debugging

### **Permission Summary**
```bash
# Check current permissions
node server/scripts/init-permissions.js

# Output:
# Username         Role            Permissions
# --------        ----            -----------
# admin           admin           15
# john_agent      agent           4
# sarah_manager   manager         14
```

### **Database Queries**
```sql
-- Check user permissions
SELECT u.username, p.page_name, p.can_access
FROM users u
LEFT JOIN permissions p ON u.user_id = p.user_id
WHERE u.username = 'john_agent';

-- Count permissions by role
SELECT u.role, COUNT(p.permission_id) as permission_count
FROM users u
LEFT JOIN permissions p ON u.user_id = p.user_id AND p.can_access = TRUE
GROUP BY u.role;
```

## 🔧 Configuration

### **Adding New Pages**
```javascript
// In server/controllers/permissionsController.js
const availablePages = [
  // ... existing pages
  { name: 'new_page', display: 'New Page', category: 'New Category' }
];
```

### **Custom Permission Categories**
```javascript
const permissionCategories = {
  core: "Core System",
  admin: "Administration", 
  support: "Support & Tickets",
  content: "Content Creation",
  analytics: "Analytics & Reports"
};
```

## ✅ Benefits

1. **No Schema Changes**: Uses existing database structure
2. **Granular Control**: Page-level access management
3. **Admin Bypass**: Admins always have full access
4. **Real-time Updates**: Permission changes take effect immediately
5. **User-Friendly**: Clear error messages and redirects
6. **Secure**: Backend verification on every request
7. **Scalable**: Easy to add new pages and permissions
8. **Audit Trail**: Database records all permission changes

## 🚫 What NOT to Do

❌ **Don't rely on role alone** - Always check specific page permissions
❌ **Don't assume access** - Verify `can_access = TRUE` exists
❌ **Don't hardcode menu visibility** - Use permission checks
❌ **Don't skip backend verification** - Frontend checks can be bypassed
❌ **Don't forget admin bypass** - Admins should always have access

## 🎯 Next Steps

1. **Run the initialization script** to set up default permissions
2. **Test with different user roles** to verify access control
3. **Add permission checks** to existing routes as needed
4. **Customize default permissions** for your specific use case
5. **Monitor and adjust** permissions based on user feedback

This implementation provides a robust, secure, and user-friendly permission system that integrates seamlessly with your existing codebase! 