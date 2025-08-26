import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import Icon from "@/components/ui/Icon";
import { toast } from "react-toastify";
import { getApiUrl } from "@/utils/apiUtils";

const UserPermissionsModal = ({ user, onClose, onUpdate }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserPermissions();
    }
  }, [user]);

  const fetchUserPermissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/permissions/users/${user.user_id}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to load permissions');
      }

      const data = await response.json();
      setPermissions(data.permissions);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      toast.error('Failed to load user permissions');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (pageName) => {
    setPermissions(prev => prev.map(perm => 
      perm.page_name === pageName 
        ? { ...perm, can_access: !perm.can_access }
        : perm
    ));
  };

  // Select all permissions
  const selectAllPermissions = () => {
    setPermissions(prev => prev.map(perm => ({ ...perm, can_access: true })));
  };

  // Deselect all permissions
  const deselectAllPermissions = () => {
    setPermissions(prev => prev.map(perm => ({ ...perm, can_access: false })));
  };

  // Select all permissions in a category
  const selectCategoryPermissions = (category) => {
    setPermissions(prev => prev.map(perm => 
      perm.category === category 
        ? { ...perm, can_access: true }
        : perm
    ));
  };

  // Deselect all permissions in a category
  const deselectCategoryPermissions = (category) => {
    setPermissions(prev => prev.map(perm => 
      perm.category === category 
        ? { ...perm, can_access: false }
        : perm
    ));
  };

  // Check if all permissions are selected
  const areAllPermissionsSelected = () => {
    return permissions.length > 0 && permissions.every(perm => perm.can_access);
  };

  // Check if all permissions in a category are selected
  const areCategoryPermissionsSelected = (category) => {
    const categoryPermissions = permissions.filter(perm => perm.category === category);
    return categoryPermissions.length > 0 && categoryPermissions.every(perm => perm.can_access);
  };

  // Check if some permissions in a category are selected
  const areSomeCategoryPermissionsSelected = (category) => {
    const categoryPermissions = permissions.filter(perm => perm.category === category);
    const selectedCount = categoryPermissions.filter(perm => perm.can_access).length;
    return selectedCount > 0 && selectedCount < categoryPermissions.length;
  };

  const savePermissions = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(getApiUrl(`/permissions/users/${user.user_id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permissions })
      });

      if (!response.ok) {
        throw new Error('Failed to update permissions');
      }

      toast.success('User permissions updated successfully');
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Error saving permissions:', err);
      toast.error('Failed to save user permissions');
    } finally {
      setSaving(false);
    }
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {});

  // Get selected permissions summary
  const getSelectedPermissionsSummary = () => {
    const selectedPermissions = permissions.filter(perm => perm.can_access);
    const selectedCategories = [...new Set(selectedPermissions.map(perm => perm.category))];
    
    return {
      totalSelected: selectedPermissions.length,
      totalAvailable: permissions.length,
      selectedCategories: selectedCategories,
      selectedPages: selectedPermissions.map(perm => perm.display_name)
    };
  };

  const summary = getSelectedPermissionsSummary();

  return (
    <Modal
      title=""
      activeModal={true}
      onClose={onClose}
      className="max-w-4xl"
    >
      {/* Enhanced Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
            <Icon icon="ph:shield-check" className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Manage Permissions
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Control access for {user?.username}
            </p>
          </div>
        </div>
        
        {/* User Info Card */}
        {user && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Icon icon="ph:user" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white text-lg">
                  {user.username}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {user.employee_name} • {user.role}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {summary.totalSelected}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  of {summary.totalAvailable} pages
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading permissions...</p>
          </div>
        ) : (
          <>
            {/* Enhanced Global Controls */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Global Permission Controls
                  </h4>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    {summary.totalSelected} of {summary.totalAvailable} pages currently accessible
                  </p>
                  <div className="mt-3">
                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(summary.totalSelected / summary.totalAvailable) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    text="Grant All Access"
                    onClick={selectAllPermissions}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={areAllPermissionsSelected()}
                  />
                  <Button
                    text="Revoke All Access"
                    onClick={deselectAllPermissions}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={summary.totalSelected === 0}
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Selected Permissions Summary */}
            {summary.totalSelected > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Icon icon="ph:check-circle" className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-green-900 dark:text-green-100 mb-3">
                      Access Granted ({summary.totalSelected} pages)
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-green-800 dark:text-green-200">Categories:</span>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {summary.selectedCategories.map(category => (
                            <span key={category} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-green-800 dark:text-green-200">Pages:</span>
                        <div className="mt-1 text-green-700 dark:text-green-300">
                          {summary.selectedPages.slice(0, 3).join(', ')}
                          {summary.selectedPages.length > 3 && (
                            <span className="text-green-600 dark:text-green-400">
                              {' '}and {summary.selectedPages.length - 3} more...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Category Groups */}
            <div className="max-h-96 overflow-y-auto space-y-4">
              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        value={areCategoryPermissionsSelected(category)}
                        onChange={() => {
                          if (areCategoryPermissionsSelected(category)) {
                            deselectCategoryPermissions(category);
                          } else {
                            selectCategoryPermissions(category);
                          }
                        }}
                        label=""
                      />
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white">
                          {category}
                        </h5>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {perms.filter(p => p.can_access).length} of {perms.length} pages accessible
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        text="Select All"
                        onClick={() => selectCategoryPermissions(category)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={areCategoryPermissionsSelected(category)}
                      />
                      <Button
                        text="Clear"
                        onClick={() => deselectCategoryPermissions(category)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={perms.filter(p => p.can_access).length === 0}
                      />
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {perms.map(permission => (
                      <div
                        key={permission.page_name}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white mb-1">
                            {permission.display_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                            /{permission.page_name}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            permission.can_access
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {permission.can_access ? 'Accessible' : 'Restricted'}
                          </span>
                          <Checkbox
                            value={permission.can_access}
                            onChange={() => togglePermission(permission.page_name)}
                            label=""
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* Enhanced Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            text="Cancel"
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors duration-200"
          />
          <Button
            text={saving ? "Saving Changes..." : "Save Changes"}
            onClick={savePermissions}
            disabled={saving || loading}
            icon={saving ? "ph:circle-notch" : "ph:floppy-disk"}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              saving 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          />
        </div>
      </div>
    </Modal>
  );
};

export default UserPermissionsModal; 