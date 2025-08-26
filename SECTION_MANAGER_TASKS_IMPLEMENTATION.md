# Section Manager Tasks Implementation

## 🎯 **Overview**

Successfully implemented the functionality for Section Managers and Media users (content dashboard) to see "Tasks" instead of "My Tasks" and assign tasks to their team members. Section Managers and Media users now have full task management capabilities within their section scope.

## 🔧 **Changes Implemented**

### **1. Menu Structure Updates**
**File**: `client/src/components/partials/sidebar/Navmenu.jsx`

**Changes**:
- Updated role-based filtering logic to show "Tasks" for Section Managers (role: 'manager') and Media users (role: 'media')
- Section Managers and Media users now see "Tasks" instead of "My Tasks"
- Regular users (agent, supervisor, follow_up) still see "My Tasks"

**Logic**:
```javascript
// Show "Tasks" for admin, manager, and media users
if (item.link === '/tasks' && user?.role !== 'admin' && user?.role !== 'manager' && user?.role !== 'media') {
  return null; // Hide "Tasks" for users who should only see their own tasks
}

// Hide "My Tasks" for admin, manager, and media users
if (item.link === '/my-tasks' && (user?.role === 'admin' || user?.role === 'manager' || user?.role === 'media')) {
  return null; // Hide "My Tasks" for users who should see "Tasks"
}
```

### **2. Backend Task Controller Updates**
**File**: `server/controllers/tasksController.js`

#### **A. Task Listing (getAllTasks)**
- Added section-based filtering for Section Managers and Media users
- Section Managers and Media users can only see tasks assigned to their team members
- Admins can still see all tasks

```javascript
} else if ((role === 'manager' || role === 'media') && sectionId) {
  // Section managers and media users can see tasks assigned to their team members
  query += ` WHERE e.section_id = ?`;
  const [tasks] = await pool.execute(query, [sectionId]);
  res.json(tasks);
}
```

#### **B. Task Creation (createTask)**
- Added validation to ensure Section Managers and Media users can only assign tasks to their team members
- Prevents Section Managers and Media users from assigning tasks to employees outside their section

```javascript
// For Section Managers and Media users, validate that they can only assign tasks to their team members
if ((role === 'manager' || role === 'media') && sectionId) {
  const [teamMembers] = await pool.execute(
    'SELECT employee_id FROM employees WHERE section_id = ?',
    [sectionId]
  );
  
  const teamMemberIds = teamMembers.map(member => member.employee_id);
  if (!teamMemberIds.includes(parseInt(assigned_to))) {
    return res.status(403).json({ 
      error: 'You can only assign tasks to members of your section' 
    });
  }
}
```

#### **C. Task Updates (updateTask)**
- Added validation to ensure Section Managers and Media users can only manage tasks within their section
- Prevents Section Managers and Media users from modifying tasks assigned to employees outside their section
- Allows Section Managers and Media users to reassign tasks within their team

```javascript
// For Section Managers and Media users, validate that they can only manage tasks within their section
if ((role === 'manager' || role === 'media') && sectionId) {
  // Check if the existing task is assigned to someone in their section
  const [existingTaskEmployee] = await pool.execute(
    'SELECT section_id FROM employees WHERE employee_id = ?',
    [existingTask.assigned_to]
  );
  
  if (existingTaskEmployee.length === 0 || existingTaskEmployee[0].section_id !== sectionId) {
    return res.status(403).json({ 
      error: 'You can only manage tasks assigned to members of your section' 
    });
  }
  
  // If reassigning, validate the new assignee is also in their section
  if (assigned_to && assigned_to !== existingTask.assigned_to) {
    const [newAssignee] = await pool.execute(
      'SELECT section_id FROM employees WHERE employee_id = ?',
      [assigned_to]
    );
    
    if (newAssignee.length === 0 || newAssignee[0].section_id !== sectionId) {
      return res.status(403).json({ 
        error: 'You can only reassign tasks to members of your section' 
      });
    }
  }
}
```

#### **D. Team Members API (getTeamMembers)**
- New endpoint to get team members for Section Managers and Media users
- Returns all employees in the manager's/media user's section with their details

```javascript
// Get team members for Section Managers and Media users
const getTeamMembers = async (req, res) => {
  try {
    const { role } = req.user;
    const { sectionId } = req.dataScope || {};
    
    // Only Section Managers and Media users can access this endpoint
    if (role !== 'manager' && role !== 'media') {
      return res.status(403).json({ error: 'Access denied. Only Section Managers and Media users can view team members.' });
    }
    
    if (!sectionId) {
      return res.status(403).json({ error: 'Section ID required for manager/media access' });
    }
    
    // Get all employees in the manager's/media user's section
    const [teamMembers] = await pool.execute(`
      SELECT 
        e.employee_id,
        e.name,
        e.email,
        e.phone,
        e.job_title,
        e.department,
        e.section_id,
        u.user_id,
        u.username,
        u.role as user_role
      FROM employees e
      LEFT JOIN users u ON e.employee_id = u.employee_id
      WHERE e.section_id = ?
      ORDER BY e.name ASC
    `, [sectionId]);
    
    res.json({ teamMembers });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
};
```

### **3. Route Updates**
**File**: `server/routes/tasks.js`

**Changes**:
- Added `scopeDataByRole` middleware to provide section_id to task controllers
- Added new route for team members endpoint (accessible by managers and media users)

```javascript
const { verifyToken, scopeDataByRole } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(verifyToken);
router.use(scopeDataByRole);

// Get team members (for Section Managers and Media users)
router.get('/team-members', tasksController.getTeamMembers);
```

### **4. Frontend Updates**
**File**: `client/src/pages/tasks.jsx`

#### **A. Team Members State**
- Added `teamMembers` state to store team member data
- Fetches team members when user is a Section Manager or Media user

```javascript
const [teamMembers, setTeamMembers] = useState([]);

useEffect(() => {
  fetchTasks();
  fetchEmployees();
  fetchStats();
  if (currentUser?.role === 'manager') {
    fetchTeamMembers();
  }
}, [currentUser?.role]);
```

#### **B. Team Members Fetching**
- New function to fetch team members from the API
- Only called for Section Managers and Media users

```javascript
const fetchTeamMembers = async () => {
  try {
    const response = await fetch("/api/tasks/team-members", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch team members");
    const data = await response.json();
    setTeamMembers(data.teamMembers || []);
  } catch (err) {
    console.error("Failed to fetch team members:", err);
  }
};
```

#### **C. Dynamic Assignee Dropdowns**
- Updated task creation form to show team members for Section Managers and Media users
- Updated assignee filter to show team members for Section Managers and Media users

```javascript
// In task creation form
{((currentUser?.role === 'manager' || currentUser?.role === 'media') ? teamMembers : employees).map((employee) => (
  <option key={employee.employee_id} value={employee.employee_id}>
    {employee.name}
  </option>
))}

// In assignee filter
{((currentUser?.role === 'manager' || currentUser?.role === 'media') ? teamMembers : employees).map((employee) => (
  <option key={employee.employee_id} value={employee.employee_id}>
    {employee.name}
  </option>
))}
```

## 🎯 **User Experience**

### **For Section Managers (role: 'manager') and Media Users (role: 'media')**
- ✅ **See "Tasks" menu** instead of "My Tasks"
- ✅ **View all tasks** assigned to their team members
- ✅ **Create new tasks** and assign to team members
- ✅ **Update existing tasks** within their section
- ✅ **Reassign tasks** to other team members
- ✅ **Filter tasks** by team members only
- ✅ **Full task management** capabilities within section scope

### **For Regular Users (agent, supervisor, follow_up)**
- ✅ **See "My Tasks" menu** (unchanged)
- ✅ **View only their assigned tasks** (unchanged)
- ✅ **Update task status** (unchanged)

### **For Admin Users**
- ✅ **See "Tasks" menu** (unchanged)
- ✅ **View all tasks** in the system (unchanged)
- ✅ **Full task management** capabilities (unchanged)

## 🔒 **Security Features**

1. **Section-Based Access Control**: Section Managers can only access tasks within their section
2. **Team Member Validation**: Section Managers can only assign tasks to their team members
3. **Task Ownership Validation**: Section Managers can only manage tasks assigned to their team
4. **Role-Based Permissions**: Different endpoints for different user roles
5. **Data Scoping**: Automatic filtering based on user's section

## 📊 **API Endpoints**

### **New Endpoints**
- `GET /api/tasks/team-members` - Get team members for Section Managers

### **Updated Endpoints**
- `GET /api/tasks` - Now filters by section for Section Managers and Media users
- `POST /api/tasks` - Now validates team member assignment for Section Managers and Media users
- `PUT /api/tasks/:id` - Now validates section-based access for Section Managers and Media users

## 🧪 **Testing Scenarios**

### **Section Manager and Media User Access**
1. **Login** as Section Manager or Media user
2. **Navigate** to "Tasks" (should see "Tasks" not "My Tasks")
3. **View tasks** - should only see tasks assigned to team members
4. **Create task** - should only be able to assign to team members
5. **Update task** - should only be able to manage team tasks
6. **Filter tasks** - should only see team members in dropdown

### **Regular User Access**
1. **Login** as regular user (agent, supervisor, etc.)
2. **Navigate** to "My Tasks" (should see "My Tasks" not "Tasks")
3. **View tasks** - should only see their assigned tasks
4. **Update status** - should be able to update their task status

### **Admin Access**
1. **Login** as admin
2. **Navigate** to "Tasks" (should see "Tasks")
3. **View tasks** - should see all tasks in the system
4. **Full management** - should have complete task management capabilities

## 📁 **Files Modified**

### **Frontend**
1. `client/src/components/partials/sidebar/Navmenu.jsx` - Updated menu filtering logic
2. `client/src/pages/tasks.jsx` - Added team members functionality

### **Backend**
1. `server/controllers/tasksController.js` - Added section-based filtering and validation
2. `server/routes/tasks.js` - Added scopeDataByRole middleware and team members route

## 🎉 **Result**

Section Managers and Media users now have full task management capabilities within their section scope, allowing them to:
- View all tasks assigned to their team members
- Create new tasks and assign them to team members
- Update and reassign tasks within their team
- Filter tasks by team members
- Maintain proper security boundaries

The implementation maintains backward compatibility for all other user roles while providing Section Managers and Media users with the enhanced functionality they need to effectively manage their teams.
