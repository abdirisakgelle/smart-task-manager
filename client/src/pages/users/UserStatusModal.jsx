import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

const UserStatusModal = ({ user, onUpdate, onClose }) => {
  const [selectedStatus, setSelectedStatus] = useState(user.status);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedStatus === user.status) {
      onClose();
      return;
    }

    setLoading(true);
    await onUpdate(user.user_id, selectedStatus);
    setLoading(false);
  };

  const getStatusDescription = (status) => {
    return status === 'active' 
      ? 'Active users can log in and access the system according to their role permissions.'
      : 'Inactive users cannot log in or access the system, but their data is preserved.';
  };

  const getStatusBadgeColor = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="max-w-md w-full mx-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Update User Status
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
                  Current status: <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                    {user.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select New Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                disabled={loading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Status Description
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getStatusDescription(selectedStatus)}
              </p>
            </div>

            {selectedStatus === 'inactive' && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                <div className="flex items-start">
                  <Icon icon="ph:warning" className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Warning: Deactivating User
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      This user will immediately lose access to the system. They will not be able to log in until their account is reactivated.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedStatus === 'active' && user.status === 'inactive' && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <div className="flex items-start">
                  <Icon icon="ph:check-circle" className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                      Reactivating User
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      This user will regain access to the system immediately and can log in with their existing credentials.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                text={loading ? "Updating..." : (selectedStatus === 'active' ? 'Activate' : 'Deactivate')}
                icon={loading ? "ph:arrow-path" : (selectedStatus === 'active' ? "ph:check" : "ph:power")}
                disabled={loading || selectedStatus === user.status}
                isLoading={loading}
                className={`min-w-[100px] ${selectedStatus === 'inactive' ? 'btn btn-danger' : 'btn btn-primary'}`}
              />
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default UserStatusModal; 