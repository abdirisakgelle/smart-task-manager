import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

const UserRoleModal = ({ user, onUpdate, onClose }) => {
  const [selectedRole, setSelectedRole] = useState(user.system_role || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedRole === user.system_role) {
      onClose();
      return;
    }

    setLoading(true);
    await onUpdate(user.user_id, selectedRole);
    setLoading(false);
  };

  const getRoleDescription = (systemRole) => {
    const descriptions = {
      admin: 'Full system access and user management. Can override organizational hierarchy.',
      ceo: 'Executive access and oversight. Can view all data but limited management capabilities.',
      '': 'Regular user access. Permissions based on organizational hierarchy (unit, section, department).'
    };
    return descriptions[systemRole] || 'Regular user access. Permissions based on organizational hierarchy.';
  };

  const getRoleBadgeColor = (systemRole) => {
    switch (systemRole) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'ceo':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case '':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="max-w-md w-full mx-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Update User Role
            </h3>
            <Button
              icon="ph:x"
              onClick={onClose}
              disabled={loading}
              className="btn btn-sm btn-outline h-8 w-8 p-0"
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center mb-3">
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.username}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  Current role: <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.system_role)}`}>
                  {user.system_role || 'Regular'}
                </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select New Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                disabled={loading}
              >
                <option value="">Regular User (No system override)</option>
                <option value="admin">Admin</option>
                <option value="ceo">CEO</option>
              </select>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Role Description
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getRoleDescription(selectedRole)}
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
              <div className="flex items-start">
                <Icon icon="ph:warning" className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Important Note
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Changing a user's system role will immediately affect their access permissions across the system. 
                    System roles override organizational hierarchy. Regular users get permissions based on their unit/section/department.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                text="Cancel"
                onClick={onClose}
                disabled={loading}
                className="btn btn-outline-secondary"
              />
              <Button
                type="submit"
                text={loading ? "Updating..." : "Update Role"}
                icon={loading ? "ph:arrow-path" : "ph:check"}
                disabled={loading || selectedRole === user.role}
                isLoading={loading}
                className="btn btn-primary min-w-[100px]"
              />
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default UserRoleModal; 