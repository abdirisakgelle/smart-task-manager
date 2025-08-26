import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import { getApiUrl } from "@/utils/apiUtils";
import { hasAccess, getAllowedPages, initializePermissions } from "@/utils/permissionUtils";
import { useSelector } from "react-redux";

const PermissionDebug = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const fetchDebugInfo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Get current user permissions from backend
      const response = await fetch(getApiUrl('/permissions/current-user'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }

      const data = await response.json();
      
      // Get frontend cached permissions
      const cachedPermissions = localStorage.getItem('userPermissions');
      const parsedCached = cachedPermissions ? JSON.parse(cachedPermissions) : null;

      // Test permission checks
      const testPages = ['dashboard', 'users', 'tickets', 'tasks', 'permissions'];
      const permissionTests = testPages.map(page => ({
        page,
        hasAccess: hasAccess(page),
        backendAccess: data.allowed_pages?.includes(page) || false
      }));

      setDebugInfo({
        user: user,
        backendPermissions: data.allowed_pages || [],
        cachedPermissions: parsedCached,
        permissionTests,
        token: token ? 'Present' : 'Missing',
        localStorage: {
          user: localStorage.getItem('user'),
          token: localStorage.getItem('token'),
          permissions: cachedPermissions
        }
      });

    } catch (error) {
      console.error('Error fetching debug info:', error);
      toast.error('Failed to fetch debug information');
    } finally {
      setLoading(false);
    }
  };

  const reinitializePermissions = async () => {
    try {
      setLoading(true);
      await initializePermissions(user.user_id);
      toast.success('Permissions reinitialized successfully');
      fetchDebugInfo(); // Refresh debug info
    } catch (error) {
      console.error('Error reinitializing permissions:', error);
      toast.error('Failed to reinitialize permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDebugInfo();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Permission Debug
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Debug information for permission system
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchDebugInfo}
            disabled={loading}
            text="Refresh Debug Info"
            className="btn btn-outline-primary"
          />
          <Button
            onClick={reinitializePermissions}
            disabled={loading}
            text="Reinitialize Permissions"
            className="btn btn-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Information */}
        <Card>
          <div className="p-4 border-b dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              User Information
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              <div><strong>User ID:</strong> {user?.user_id}</div>
              <div><strong>Username:</strong> {user?.username}</div>
              <div><strong>Role:</strong> {user?.role}</div>
              <div><strong>Name:</strong> {user?.name}</div>
              <div><strong>Department:</strong> {user?.department}</div>
            </div>
          </div>
        </Card>

        {/* Permission Status */}
        <Card>
          <div className="p-4 border-b dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Permission Status
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              <div><strong>Token:</strong> {debugInfo.token}</div>
              <div><strong>Backend Permissions:</strong> {debugInfo.backendPermissions?.length || 0} pages</div>
              <div><strong>Cached Permissions:</strong> {debugInfo.cachedPermissions?.length || 0} pages</div>
            </div>
          </div>
        </Card>

        {/* Backend Permissions */}
        <Card>
          <div className="p-4 border-b dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Backend Permissions
            </h3>
          </div>
          <div className="p-4">
            {debugInfo.backendPermissions?.length > 0 ? (
              <div className="space-y-1">
                {debugInfo.backendPermissions.map((page, index) => (
                  <div key={index} className="text-sm bg-green-100 dark:bg-green-900/20 p-2 rounded">
                    ✅ {page}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No permissions found</div>
            )}
          </div>
        </Card>

        {/* Cached Permissions */}
        <Card>
          <div className="p-4 border-b dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cached Permissions
            </h3>
          </div>
          <div className="p-4">
            {debugInfo.cachedPermissions?.length > 0 ? (
              <div className="space-y-1">
                {debugInfo.cachedPermissions.map((page, index) => (
                  <div key={index} className="text-sm bg-blue-100 dark:bg-blue-900/20 p-2 rounded">
                    💾 {page}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No cached permissions</div>
            )}
          </div>
        </Card>

        {/* Permission Tests */}
        <Card className="lg:col-span-2">
          <div className="p-4 border-b dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Permission Tests
            </h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {debugInfo.permissionTests?.map((test, index) => (
                <div key={index} className="border rounded p-3">
                  <div className="font-medium">{test.page}</div>
                  <div className="text-sm space-y-1">
                    <div className={`flex items-center gap-2 ${test.hasAccess ? 'text-green-600' : 'text-red-600'}`}>
                      {test.hasAccess ? '✅' : '❌'} Frontend: {test.hasAccess ? 'Access' : 'Denied'}
                    </div>
                    <div className={`flex items-center gap-2 ${test.backendAccess ? 'text-green-600' : 'text-red-600'}`}>
                      {test.backendAccess ? '✅' : '❌'} Backend: {test.backendAccess ? 'Access' : 'Denied'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Local Storage Debug */}
        <Card className="lg:col-span-2">
          <div className="p-4 border-b dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Local Storage Debug
            </h3>
          </div>
          <div className="p-4">
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto">
              {JSON.stringify(debugInfo.localStorage, null, 2)}
            </pre>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PermissionDebug; 