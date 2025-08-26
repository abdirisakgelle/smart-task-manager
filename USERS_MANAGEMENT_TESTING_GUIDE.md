# Users Management Module - Testing Guide

## 🎯 **How to Test the Users Management Module**

The Users Management Module is now fully implemented and ready for testing. Here's how to access and test it:

## 📋 **Step-by-Step Testing Instructions**

### **1. Access the Application**
1. Start the frontend: `npm run dev` (runs on http://localhost:5173)
2. Start the backend: `cd server && npm run dev` (runs on http://localhost:3000)

### **2. Login with Admin Credentials**
Navigate to the login page and use one of these admin credentials:

**Option 1: Admin User**
- Username: `admin`
- Password: `admin123`
- Role: Admin

**Option 2: Gelle User**
- Username: `gelle`
- Password: `123`
- Role: Admin

### **3. Access Users Management**
1. After logging in, navigate to the **Users** section in the sidebar
2. You should see the Users Management interface with:
   - User listing table
   - Search and filter options
   - User creation form
   - Action buttons for each user

### **4. Test Features**

#### **View Users**
- ✅ Should display all users in the system
- ✅ Shows username, role, status, employee info
- ✅ Role badges with color coding
- ✅ Status indicators (active/inactive)

#### **Search and Filter**
- ✅ Search by username or employee name
- ✅ Filter by role (admin, manager, agent, supervisor, media, follow_up)
- ✅ Filter by status (active, inactive)

#### **Create New User**
- ✅ Click "Add New User" button
- ✅ Fill in username and password
- ✅ Select role from dropdown
- ✅ Optionally link to an employee
- ✅ Submit form to create user

#### **Update User Role**
- ✅ Click the user icon button for any user
- ✅ Select new role from modal
- ✅ Role change takes effect immediately

#### **Update User Status**
- ✅ Click the power icon button for any user
- ✅ Select active/inactive status
- ✅ Status change takes effect immediately

#### **Reset Password**
- ✅ Click the key icon button for any user
- ✅ Generate or enter new password
- ✅ Password reset completed

#### **Delete User**
- ✅ Click the trash icon button for any user
- ✅ Confirm deletion
- ✅ User removed from system

## 🔐 **Security Features Tested**

### **Authentication**
- ✅ Only logged-in users can access
- ✅ Token-based authentication
- ✅ Session validation

### **Authorization**
- ✅ Only admin users can access user management
- ✅ Role-based access control
- ✅ Permission validation

### **Data Protection**
- ✅ bcrypt password hashing
- ✅ Input validation
- ✅ SQL injection prevention
- ✅ Unique constraint enforcement

## 📊 **Expected Results**

### **User Listing**
You should see 4 users in the system:
1. **gelle** (admin) - Linked to employee "Abdirisak Mohamed Gelle"
2. **admin** (admin) - No employee linked
3. **manager** (manager) - No employee linked  
4. **user** (agent) - No employee linked

### **Role Distribution**
- Admin: 2 users
- Manager: 1 user
- Agent: 1 user

### **Status**
- All users should be "active"

## 🚨 **Troubleshooting**

### **If you can't see any users:**
1. Check if you're logged in as an admin user
2. Check browser console for errors
3. Verify the backend server is running
4. Check network tab for API calls

### **If you get "Access denied" errors:**
1. Make sure you're logged in with admin credentials
2. Check if your token is valid
3. Try logging out and logging back in

### **If the page doesn't load:**
1. Check if both frontend and backend are running
2. Verify the Vite proxy configuration
3. Check browser console for errors

## 🎉 **Success Indicators**

The Users Management Module is working correctly if you can:
- ✅ View all users in a table format
- ✅ See role badges and status indicators
- ✅ Search and filter users
- ✅ Create new users with role assignment
- ✅ Update user roles and status
- ✅ Reset user passwords
- ✅ Delete users (except your own account)

## 📝 **Notes**

- The module is admin-only for security
- All passwords are securely hashed with bcrypt
- Employee linking is optional but recommended
- Role changes take effect immediately
- User deletion is permanent (no soft delete yet)

The Users Management Module is now fully functional and ready for production use! 