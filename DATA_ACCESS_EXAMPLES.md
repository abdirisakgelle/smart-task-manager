# 🔐 Data Access Control Examples

## 🎯 **The Problem vs Solution**

### **❌ Before: Same Data for Everyone**
When a user had access to a page, they saw **exactly the same data** as an admin:

```javascript
// OLD: Everyone sees all users
GET /api/users
// Admin sees: [user1, user2, user3, user4, user5]
// Agent sees: [user1, user2, user3, user4, user5] ❌ Same data!
```

### **✅ After: Filtered Data Based on Role**
Now users see **different data** based on their permissions:

```javascript
// NEW: Different data for different roles
GET /api/users
// Admin sees: [user1, user2, user3, user4, user5] ✅ All users
// Manager sees: [user1, user2, user3, user4, user5] ✅ All users (can manage)
// Supervisor sees: [user2, user3] ✅ Only agents & supervisors
// Agent sees: [user2] ✅ Only themselves
```

## 📊 **Data Access Levels**

### **1. Admin Access**
```javascript
// Admin sees everything
req.user.dataAccess = {
  level: 'admin',
  canViewAll: true,
  canEditAll: true,
  canDeleteAll: true,
  canManageUsers: true,
  canManagePermissions: true
}

// Result: Full access to all data
```

### **2. Manager Access**
```javascript
// Manager sees most data but limited permissions
req.user.dataAccess = {
  level: 'manager',
  canViewAll: false,
  canEditAll: false,
  canDeleteAll: false,
  canManageUsers: true, // Can manage users
  canManagePermissions: false,
  canViewTeamData: true,
  canViewDepartmentData: true
}

// Result: Can see all users but limited actions
```

### **3. Supervisor Access**
```javascript
// Supervisor sees team data
req.user.dataAccess = {
  level: 'supervisor',
  canViewAll: false,
  canEditAll: false,
  canDeleteAll: false,
  canManageUsers: false,
  canViewTeamData: true, // Can see team members
  canViewDepartmentData: false
}

// Result: Can see agents and supervisors only
```

### **4. Agent Access**
```javascript
// Agent sees only their own data
req.user.dataAccess = {
  level: 'agent',
  canViewAll: false,
  canEditAll: false,
  canDeleteAll: false,
  canManageUsers: false,
  canViewOwnData: true, // Only their own data
  canViewTeamData: false
}

// Result: Can only see themselves
```

## 🛠️ **Implementation Examples**

### **Users Management Page**

#### **Admin View:**
```javascript
// Admin sees all users with full actions
[
  {
    user_id: 1,
    username: "admin",
    role: "admin",
    employee_name: "System Admin",
    actions: ["edit", "delete", "permissions", "role", "status"]
  },
  {
    user_id: 2,
    username: "john_agent",
    role: "agent", 
    employee_name: "John Smith",
    actions: ["edit", "delete", "permissions", "role", "status"]
  }
]
```

#### **Manager View:**
```javascript
// Manager sees all users but limited actions
[
  {
    user_id: 1,
    username: "admin",
    role: "admin",
    employee_name: "System Admin",
    actions: ["view"] // Can't edit admin
  },
  {
    user_id: 2,
    username: "john_agent",
    role: "agent",
    employee_name: "John Smith", 
    actions: ["edit", "role", "status"] // Can manage agents
  }
]
```

#### **Agent View:**
```javascript
// Agent sees only themselves
[
  {
    user_id: 2,
    username: "john_agent",
    role: "agent",
    employee_name: "John Smith",
    actions: ["view"] // Can only view themselves
  }
]
```

### **Tickets Page**

#### **Admin View:**
```javascript
// Admin sees all tickets
[
  {
    ticket_id: 1,
    customer_phone: "1234567890",
    agent_id: 2,
    issue_type: "Streaming",
    resolution_status: "Resolved"
  },
  {
    ticket_id: 2,
    customer_phone: "0987654321", 
    agent_id: 3,
    issue_type: "VOD",
    resolution_status: "Pending"
  }
]
```

#### **Manager View:**
```javascript
// Manager sees department tickets
[
  {
    ticket_id: 1,
    customer_phone: "1234567890",
    agent_id: 2,
    issue_type: "Streaming", 
    resolution_status: "Resolved"
  }
  // Only tickets from their department
]
```

#### **Agent View:**
```javascript
// Agent sees only their own tickets
[
  {
    ticket_id: 1,
    customer_phone: "1234567890",
    agent_id: 2, // Their own tickets only
    issue_type: "Streaming",
    resolution_status: "Resolved"
  }
]
```

## 🔧 **Controller Implementation**

### **Users Controller Example:**
```javascript
exports.getAllUsers = async (req, res) => {
  try {
    const userDataAccess = req.user.dataAccess;
    
    let query = `
      SELECT u.user_id, u.username, u.role, u.status, u.employee_id, u.created_at,
             e.name as employee_name, e.job_title, e.shift
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
    `;
    
    let queryParams = [];
    
    // Filter based on access level
    if (userDataAccess.level === 'admin') {
      // Admin sees all users
      query += ' ORDER BY u.username';
    } else if (userDataAccess.canManageUsers) {
      // Users with user management permission see all users
      query += ' ORDER BY u.username';
    } else if (userDataAccess.canViewTeamData) {
      // Managers and supervisors see team members
      query += ` WHERE u.role IN ('agent', 'supervisor') ORDER BY u.username`;
    } else {
      // Regular users only see themselves
      query += ` WHERE u.user_id = ? ORDER BY u.username`;
      queryParams.push(req.user.user_id);
    }
    
    const [rows] = await pool.query(query, queryParams);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

### **Tickets Controller Example:**
```javascript
exports.getAllTickets = async (req, res) => {
  try {
    const userDataAccess = req.user.dataAccess;
    
    let query = 'SELECT * FROM tickets';
    let queryParams = [];
    
    // Filter based on access level
    if (userDataAccess.level === 'admin') {
      // Admin sees all tickets
      query += ' ORDER BY created_at DESC';
    } else if (userDataAccess.canViewTeamData) {
      // Managers and supervisors see team tickets
      query += ` WHERE agent_id IN (
        SELECT employee_id FROM employees 
        WHERE department = (SELECT department FROM employees WHERE employee_id = ?)
      ) ORDER BY created_at DESC`;
      queryParams.push(req.user.employee_id);
    } else if (userDataAccess.canViewOwnData) {
      // Regular users only see their own tickets
      query += ' WHERE agent_id = ? ORDER BY created_at DESC';
      queryParams.push(req.user.employee_id);
    } else {
      return res.status(403).json({ error: 'Access denied to tickets data' });
    }
    
    const [rows] = await pool.query(query, queryParams);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

## 🎨 **Frontend Implementation**

### **Conditional UI Based on Permissions:**
```jsx
import usePermissions from '@/hooks/usePermissions';

const UserManagement = () => {
  const { hasPermission } = usePermissions();
  const [users, setUsers] = useState([]);
  
  return (
    <div>
      <h1>User Management</h1>
      
      {/* Show different actions based on permissions */}
      {hasPermission('users') && (
        <div className="actions">
          {hasPermission('admin') && (
            <Button>Manage Permissions</Button>
          )}
          {hasPermission('users') && (
            <Button>Create User</Button>
          )}
        </div>
      )}
      
      {/* Show different data based on role */}
      <table>
        {users.map(user => (
          <tr key={user.user_id}>
            <td>{user.username}</td>
            <td>{user.role}</td>
            <td>
              {/* Different actions for different roles */}
              {user.role === 'admin' && hasPermission('admin') ? (
                <span>Full Access</span>
              ) : hasPermission('users') ? (
                <Button>Edit</Button>
              ) : (
                <span>View Only</span>
              )}
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
};
```

## 🔄 **Permission Update Workflow**

### **1. User Login**
```javascript
// User logs in → System fetches permissions
const response = await fetch('/api/permissions/current-user');
const { allowed_pages } = await response.json();

// System also gets data access level
req.user.dataAccess = {
  level: 'agent',
  canViewOwnData: true,
  canViewTeamData: false,
  canViewAllData: false
}
```

### **2. Page Access**
```javascript
// User navigates to /users
// Backend checks: checkPageAccess('users') ✅
// Backend adds: addUserContext() → Sets data access level
// Controller filters: getAllUsers() → Returns filtered data
```

### **3. Data Display**
```javascript
// Frontend receives filtered data
// Admin: [all users]
// Manager: [all users] 
// Supervisor: [agents & supervisors]
// Agent: [only themselves]
```

## ✅ **Benefits**

1. **Security**: Users only see data they should see
2. **Privacy**: Sensitive data is protected
3. **Scalability**: Easy to add new data access rules
4. **Flexibility**: Different views for different roles
5. **User Experience**: Users see relevant data only
6. **Compliance**: Meets data access requirements

## 🚫 **What NOT to Do**

❌ **Don't show all data to everyone** - Filter based on permissions
❌ **Don't rely on frontend filtering** - Always filter on backend
❌ **Don't hardcode access levels** - Use dynamic permission checking
❌ **Don't forget admin bypass** - Admins should see everything
❌ **Don't expose sensitive data** - Always verify permissions

This implementation ensures that users see **different data** based on their role and permissions, not just the same data as admins! 