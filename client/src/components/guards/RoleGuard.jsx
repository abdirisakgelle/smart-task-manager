import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const RoleGuard = ({ children, allowedRoles, fallbackPath = '/dashboard/user' }) => {
  const { user, isAuth } = useSelector((state) => state.auth);

  // If not authenticated, redirect to login
  if (!isAuth || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Check if user has required role (use system_role first, then fallback to role)
  const userRole = user.system_role || user.role;
  if (!allowedRoles.includes(userRole)) {
    console.warn(`Access denied: User role '${userRole}' not in allowed roles: [${allowedRoles.join(', ')}]`);
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default RoleGuard;
