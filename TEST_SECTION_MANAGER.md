# Testing Section Manager Tasks Functionality

## 🧪 **How to Test the Changes**

### **Step 1: Check Current User Role**
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Run this command to check your current user role:
   ```javascript
   console.log('Current user role:', JSON.parse(localStorage.getItem('user'))?.role);
   ```

### **Step 2: Test Menu Visibility**

#### **For Section Manager (role: 'manager')**
- You should see **"Tasks"** in the sidebar (not "My Tasks")
- Navigate to `/tasks` to see the tasks page

#### **For Regular User (role: 'agent', 'supervisor', etc.)**
- You should see **"My Tasks"** in the sidebar (not "Tasks")
- Navigate to `/my-tasks` to see your tasks

#### **For Admin (role: 'admin')**
- You should see **"Tasks"** in the sidebar
- Navigate to `/tasks` to see all tasks

### **Step 3: Test Task Management**

#### **Section Manager Testing:**
1. **Login as a Section Manager**
2. **Go to Tasks page** (`/tasks`)
3. **Check if you can see tasks** assigned to your team members
4. **Try to create a new task** - you should only see team members in the assignee dropdown
5. **Try to update a task** - you should only be able to manage tasks within your section

### **Step 4: Debug Information**

Add this to your browser console to see debug info:
```javascript
// Check user info
console.log('User:', JSON.parse(localStorage.getItem('user')));

// Check if team members are loaded (for managers)
if (JSON.parse(localStorage.getItem('user'))?.role === 'manager') {
  fetch('/api/tasks/team-members', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  })
  .then(res => res.json())
  .then(data => console.log('Team members:', data))
  .catch(err => console.error('Error fetching team members:', err));
}
```

## 🔍 **Common Issues & Solutions**

### **Issue 1: Menu not showing correctly**
**Solution**: Check if the user role is correct in localStorage

### **Issue 2: Can't see team members**
**Solution**: Verify the user has a section_id assigned

### **Issue 3: Backend errors**
**Solution**: Check server logs for any database connection issues

### **Issue 4: Frontend not loading**
**Solution**: Make sure both frontend and backend servers are running

## 📋 **Expected Behavior**

### **Section Manager Should See:**
- ✅ "Tasks" menu item (not "My Tasks")
- ✅ Tasks assigned to team members only
- ✅ Team members in assignee dropdowns
- ✅ Ability to create/update tasks within section

### **Regular User Should See:**
- ✅ "My Tasks" menu item (not "Tasks")
- ✅ Only their assigned tasks
- ✅ Ability to update task status only

### **Admin Should See:**
- ✅ "Tasks" menu item
- ✅ All tasks in the system
- ✅ All employees in assignee dropdowns
- ✅ Full task management capabilities

## 🚨 **If Changes Are Not Visible**

1. **Clear browser cache** and refresh the page
2. **Restart both frontend and backend servers**
3. **Check browser console** for any JavaScript errors
4. **Verify user role** in the database
5. **Check server logs** for any backend errors

## 📞 **Need Help?**

If you're still not seeing the changes:
1. What is your current user role?
2. What do you see in the sidebar menu?
3. Are there any console errors?
4. Are both servers running without errors?
