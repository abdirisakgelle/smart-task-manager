import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import AdminDashboard from '../../pages/dashboard/AdminDashboard';
import UserDashboard from '../../pages/dashboard/UserDashboard';
import AgentDashboard from '../../pages/dashboard/AgentDashboard';
import ContentDashboard from '../../pages/dashboard/ContentDashboard';

const DashboardRouter = () => {
  const { user, isAuth } = useSelector((state) => state.auth);

  // If not authenticated, redirect to login
  if (!isAuth || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Route based on user role
  switch (user.role) {
    case 'admin':
    case 'ceo':
      return <AdminDashboard />;
    case 'media':
      return <ContentDashboard />;
    case 'agent':
    case 'manager':
    case 'supervisor':
    case 'follow_up':
      return <AgentDashboard />; // Support dashboard
    default:
      return <UserDashboard />;
  }
};

export default DashboardRouter;
