import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { toast } from "react-toastify";
import { useGetCurrentUserQuery } from "@/store/api/auth/authApiSlice";
import { getApiUrl } from "@/utils/apiUtils";
import UserRegistration from "./UserRegistration";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: currentUser } = useGetCurrentUserQuery();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      toast.success('User deleted successfully');
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'manager':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'user':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Icon icon="heroicons:exclamation-triangle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Users</h3>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
        <Button onClick={fetchUsers} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage system users and their roles
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Logged in as: {currentUser?.username} ({currentUser?.role})
          </span>
        </div>
      </div>

      {/* User Registration Component */}
      <UserRegistration onUserCreated={fetchUsers} />

      {/* Users Table */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            System Users ({users.length})
          </h3>
          <Button
            onClick={fetchUsers}
            variant="outline"
            size="sm"
          >
            <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {user.user_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="ml-3">{user.username}</span>
                      {user.user_id === currentUser?.user_id && (
                        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {user.employee_id || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(user.user_id)}
                        disabled={user.user_id === currentUser?.user_id}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title={user.user_id === currentUser?.user_id ? "Cannot delete your own account" : "Delete user"}
                      >
                        <Icon icon="heroicons:trash" className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-8">
            <Icon icon="heroicons:users" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Users Found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              There are no users in the system yet. Create the first user above.
            </p>
          </div>
        )}
      </Card>

      {/* System Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            System Information
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <p>• Total Users: {users.length}</p>
            <p>• Admin Users: {users.filter(u => u.role === 'admin').length}</p>
            <p>• Manager Users: {users.filter(u => u.role === 'manager').length}</p>
            <p>• Regular Users: {users.filter(u => u.role === 'user').length}</p>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
            Quick Actions
          </h3>
          <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
            <p>• Click "Add New User" to create accounts</p>
            <p>• Use the refresh button to update the list</p>
            <p>• Delete users (except your own account)</p>
            <p>• Manage user roles and permissions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage; 