import React from "react";
import Icon from "@/components/ui/Icon";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const SingleMenu = ({ item }) => {
  const { user } = useSelector((state) => state.auth);

  // Get the appropriate title based on user role and menu item
  const getDisplayTitle = () => {
    if (item.link === '/dashboard') {
      if (user?.role === 'admin') {
        return 'Admin Dashboard';
      } else if (user?.role === 'ceo') {
        return 'Admin Dashboard';
      } else if (user?.role === 'manager') {
        return 'Support Dashboard';
      } else if (user?.role === 'agent') {
        return 'Support Dashboard';
      } else if (user?.role === 'media') {
        return 'Content Dashboard';
      } else if (user?.role === 'supervisor') {
        return 'Support Dashboard';
      } else if (user?.role === 'follow_up') {
        return 'Support Dashboard';
      } else {
        return 'Dashboard';
      }
    }
    return item.title;
  };

  return (
    <NavLink 
      className={({ isActive }) => `
        menu-link flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors
        ${isActive ? 'bg-white/10 text-white' : ''}
      `}
      to={item.link}
    >
      <span className="menu-icon flex items-center justify-center w-5 h-5">
        <Icon icon={item.icon} className="text-current" width="18" />
      </span>
      <span className="text-sm font-medium">{getDisplayTitle()}</span>
    </NavLink>
  );
};

export default SingleMenu;
