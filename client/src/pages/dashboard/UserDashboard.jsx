import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";

const UserDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect users to their specific role-based dashboards
    const role = user?.system_role || user?.role;
    if (role === 'admin') {
      navigate('/dashboard/admin');
    } else if (role === 'ceo') {
      navigate('/dashboard/admin');
    } else if (role === 'media') {
      navigate('/dashboard/content');
    } else {
      // For regular users, show a simple dashboard
      // Don't redirect, just show the current component
    }
  }, [user, navigate]);

  return (
    <div className="space-y-8">
      <div className="mb-6 flex items-center gap-3">
        <Icon icon="ph:user" className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-blue-700">User Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">My Tasks</h3>
              <p className="text-2xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-500">Active tasks</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:list-checks" className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Completed</h3>
              <p className="text-2xl font-bold text-green-600">0</p>
              <p className="text-sm text-gray-500">This week</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:check-circle" className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Profile</h3>
              <p className="text-2xl font-bold text-purple-600">100%</p>
              <p className="text-sm text-gray-500">Complete</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon icon="ph:user-circle" className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="text-center">
          <Icon icon="ph:info" className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Welcome, {user?.username || 'User'}!</h2>
          <p className="text-gray-600">This is your personal dashboard. You can view your tasks, track your progress, and manage your profile from here.</p>
        </div>
      </Card>
    </div>
  );
};

export default UserDashboard;
