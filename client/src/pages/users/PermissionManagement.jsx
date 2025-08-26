import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Checkbox from "@/components/ui/Checkbox";
import { toast } from "react-toastify";
import { getApiUrl } from "@/utils/apiUtils";

const PermissionManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/permissions/users'), {
        headers: { 'Authorization': `Bearer ${token}` }
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

  const fetchUserPermissions = async (userId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/permissions/users/${userId}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user permissions');
      }

      const data = await response.json();
      setUserPermissions(data.permissions);
    } catch (err) {
      console.error('Error fetching user permissions:', err);
      toast.error('Failed to load user permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchUserPermissions(user.user_id);
  };

  const togglePermission = (pageName) => {
    setUserPermissions(prev => prev.map(perm => 
      perm.page_name === pageName 
        ? { ...perm, can_access: !perm.can_access }
        : perm
    ));
  };

  // Select all permissions
  const selectAllPermissions = () => {
    setUserPermissions(prev => prev.map(perm => ({ ...perm, can_access: true })));
  };

  // Deselect all permissions
  const deselectAllPermissions = () => {
    setUserPermissions(prev => prev.map(perm => ({ ...perm, can_access: false })));
  };

  // Select all permissions in a category
  const selectCategoryPermissions = (category) => {
    setUserPermissions(prev => prev.map(perm => 
      perm.category === category 
        ? { ...perm, can_access: true }
        : perm
    ));
  };

  // Deselect all permissions in a category
  const deselectCategoryPermissions = (category) => {
    setUserPermissions(prev => prev.map(perm => 
      perm.category === category 
        ? { ...perm, can_access: false }
        : perm
    ));
  };

  // Check if all permissions are selected
  const areAllPermissionsSelected = () => {
    return userPermissions.length > 0 && userPermissions.every(perm => perm.can_access);
  };

  // Check if all permissions in a category are selected
  const areCategoryPermissionsSelected = (category) => {
    const categoryPermissions = userPermissions.filter(perm => perm.category === category);
    return categoryPermissions.length > 0 && categoryPermissions.every(perm => perm.can_access);
  };

  // Check if some permissions in a category are selected
  const areSomeCategoryPermissionsSelected = (category) => {
    const categoryPermissions = userPermissions.filter(perm => perm.category === category);
    const selectedCount = categoryPermissions.filter(perm => perm.can_access).length;
    return selectedCount > 0 && selectedCount < categoryPermissions.length;
  };

  const savePermissions = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(getApiUrl(`/permissions/users/${selectedUser.user_id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permissions: userPermissions })
      });

      if (!response.ok) {
        throw new Error('Failed to update permissions');
      }

      toast.success('Permissions updated successfully');
      fetchUsers(); // Refresh user list to update permission counts
    } catch (err) {
      console.error('Error saving permissions:', err);
      toast.error('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  // Group permissions by category
  const groupedPermissions = userPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {});

  // Get selected permissions summary
  const getSelectedPermissionsSummary = () => {
    const selectedPermissions = userPermissions.filter(perm => perm.can_access);
    const selectedCategories = [...new Set(selectedPermissions.map(perm => perm.category))];
    
    return {
      totalSelected: selectedPermissions.length,
      totalAvailable: userPermissions.length,
      selectedCategories: selectedCategories,
      selectedPages: selectedPermissions.map(perm => perm.display_name)
    };
  };

  const summary = getSelectedPermissionsSummary();

  if (loading && !selectedUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Icon icon="ph:exclamation-triangle-bold" className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Error Loading Users</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <Button 
          onClick={fetchUsers} 
          text="Try Again"
          icon="ph:arrow-path"
          className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-700 dark:hover:bg-slate-600"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Page Permissions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage user access to different pages and features
          </p>
        </div>
        {selectedUser && (
          <Button
            onClick={savePermissions}
            disabled={saving}
            text={saving ? "Saving..." : "Save Changes"}
            icon="ph:floppy-disk"
            className="btn btn-primary"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <Card className="lg:col-span-1">
          <div className="p-4 border-b dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Select User
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {users.map(user => (
                <div
                  key={user.user_id}
                  onClick={() => handleUserSelect(user)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedUser?.user_id === user.user_id
                      ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.employee_name} • {user.role}
                      </div>
                    </div>
                    <div className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {user.permission_count} pages
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Permissions Grid */}
        <Card className="lg:col-span-2">
          <div className="p-4 border-b dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedUser ? `Permissions for ${selectedUser.username}` : 'Select a user to manage permissions'}
            </h3>
            {selectedUser && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {selectedUser.employee_name} • {selectedUser.role}
              </p>
            )}
          </div>
          <div className="p-4">
            {!selectedUser ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Icon icon="ph:user-circle" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select a user from the list to manage their page permissions</p>
              </div>
            ) : loading ? (
              <div className="text-center py-12">Loading permissions...</div>
            ) : (
              <div className="space-y-6">
                {/* Global Select All */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">All Permissions</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {summary.totalSelected} of {summary.totalAvailable} pages selected
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      text="Select All"
                      onClick={selectAllPermissions}
                      className="btn btn-sm btn-outline-primary"
                      disabled={areAllPermissionsSelected()}
                    />
                    <Button
                      text="Clear All"
                      onClick={deselectAllPermissions}
                      className="btn btn-sm btn-outline-secondary"
                      disabled={summary.totalSelected === 0}
                    />
                  </div>
                </div>

                {/* Selected Permissions Summary */}
                {summary.totalSelected > 0 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Selected Access ({summary.totalSelected} pages)
                    </h5>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <div className="mb-1">
                        <strong>Categories:</strong> {summary.selectedCategories.join(', ')}
                      </div>
                      <div>
                        <strong>Pages:</strong> {summary.selectedPages.join(', ')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Category Groups */}
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category} className="border rounded-lg dark:border-gray-600">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          value={areCategoryPermissionsSelected(category)}
                          onChange={() => {
                            if (areCategoryPermissionsSelected(category)) {
                              deselectCategoryPermissions(category);
                            } else {
                              selectCategoryPermissions(category);
                            }
                          }}
                          label={category}
                          indeterminate={areSomeCategoryPermissionsSelected(category)}
                        />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({permissions.filter(p => p.can_access).length}/{permissions.length})
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          text="Select All"
                          onClick={() => selectCategoryPermissions(category)}
                          className="btn btn-xs btn-outline-primary"
                          disabled={areCategoryPermissionsSelected(category)}
                        />
                        <Button
                          text="Clear"
                          onClick={() => deselectCategoryPermissions(category)}
                          className="btn btn-xs btn-outline-secondary"
                          disabled={permissions.filter(p => p.can_access).length === 0}
                        />
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      {permissions.map(permission => (
                        <div
                          key={permission.page_name}
                          className="flex items-center justify-between p-2 border rounded dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {permission.display_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              /{permission.page_name}
                            </div>
                          </div>
                          <Checkbox
                            value={permission.can_access}
                            onChange={() => togglePermission(permission.page_name)}
                            label=""
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PermissionManagement; 