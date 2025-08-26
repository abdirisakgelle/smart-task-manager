import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import { getApiUrl } from "@/utils/apiUtils";
import { hasAccess, getAllowedPages, initializePermissions } from "@/utils/permissionUtils";
import { useSelector } from "react-redux";

const TestPermissions = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const runTests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('=== PERMISSION TEST START ===');
      console.log('User:', user);
      console.log('Token:', token ? 'Present' : 'Missing');
      
      // Test 1: Check localStorage
      const storedUser = localStorage.getItem('user');
      const storedPermissions = localStorage.getItem('userPermissions');
      console.log('Stored User:', storedUser);
      console.log('Stored Permissions:', storedPermissions);
      
      // Test 2: Try to fetch permissions from backend
      let backendPermissions = [];
      try {
        const response = await fetch(getApiUrl('/permissions/current-user'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          backendPermissions = data.allowed_pages || [];
          console.log('✅ Backend permissions fetched:', backendPermissions);
        } else {
          const errorData = await response.json();
          console.log('❌ Backend permissions failed:', response.status, errorData);
        }
      } catch (error) {
        console.log('❌ Backend permissions error:', error);
      }
      
      // Test 3: Test permission initialization
      let initResult = false;
      try {
        initResult = await initializePermissions(user.user_id);
        console.log('✅ Permission initialization:', initResult);
      } catch (error) {
        console.log('❌ Permission initialization error:', error);
      }
      
      // Test 4: Test permission checks
      const testPages = ['dashboard', 'users', 'tickets', 'tasks', 'permissions'];
      const permissionChecks = testPages.map(page => ({
        page,
        hasAccess: hasAccess(page),
        backendAccess: backendPermissions.includes(page)
      }));
      
      console.log('Permission checks:', permissionChecks);
      
      // Test 5: Get cached permissions
      const cachedPermissions = getAllowedPages();
      console.log('Cached permissions:', cachedPermissions);
      
      setTestResults({
        user: user,
        token: token ? 'Present' : 'Missing',
        storedUser: storedUser,
        storedPermissions: storedPermissions,
        backendPermissions: backendPermissions,
        initResult: initResult,
        permissionChecks: permissionChecks,
        cachedPermissions: cachedPermissions
      });
      
      console.log('=== PERMISSION TEST END ===');
      
      toast.success('Permission tests completed. Check console for details.');
      
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Test failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    localStorage.removeItem('userPermissions');
    toast.success('Permission cache cleared');
  };

  const reinitialize = async () => {
    try {
      setLoading(true);
      await initializePermissions(user.user_id);
      toast.success('Permissions reinitialized');
      runTests(); // Run tests again
    } catch (error) {
      console.error('Reinitialization error:', error);
      toast.error('Failed to reinitialize permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      runTests();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Permission Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Test permission system functionality
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runTests}
            disabled={loading}
            text="Run Tests"
            className="btn btn-primary"
          />
          <Button
            onClick={clearCache}
            text="Clear Cache"
            className="btn btn-outline-secondary"
          />
          <Button
            onClick={reinitialize}
            disabled={loading}
            text="Reinitialize"
            className="btn btn-outline-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Results */}
        <Card>
          <div className="p-4 border-b dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Test Results
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              <div><strong>User ID:</strong> {testResults.user?.user_id}</div>
              <div><strong>Username:</strong> {testResults.user?.username}</div>
              <div><strong>Role:</strong> {testResults.user?.role}</div>
              <div><strong>Token:</strong> {testResults.token}</div>
              <div><strong>Init Result:</strong> {testResults.initResult ? '✅ Success' : '❌ Failed'}</div>
              <div><strong>Backend Permissions:</strong> {testResults.backendPermissions?.length || 0} pages</div>
              <div><strong>Cached Permissions:</strong> {testResults.cachedPermissions?.length || 0} pages</div>
            </div>
          </div>
        </Card>

        {/* Permission Checks */}
        <Card>
          <div className="p-4 border-b dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Permission Checks
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {testResults.permissionChecks?.map((check, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded">
                  <span className="font-medium">{check.page}</span>
                  <div className="flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${check.hasAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      Frontend: {check.hasAccess ? '✅' : '❌'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${check.backendAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      Backend: {check.backendAccess ? '✅' : '❌'}
                    </span>
                  </div>
                </div>
              ))}
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
            {testResults.backendPermissions?.length > 0 ? (
              <div className="space-y-1">
                {testResults.backendPermissions.map((page, index) => (
                  <div key={index} className="text-sm bg-green-100 dark:bg-green-900/20 p-2 rounded">
                    ✅ {page}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No backend permissions found</div>
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
            {testResults.cachedPermissions?.length > 0 ? (
              <div className="space-y-1">
                {testResults.cachedPermissions.map((page, index) => (
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

        {/* Debug Info */}
        <Card className="lg:col-span-2">
          <div className="p-4 border-b dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Debug Information
            </h3>
          </div>
          <div className="p-4">
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-64">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TestPermissions; 