import React from "react";
import Icon from "@/components/ui/Icon";
import { NavLink } from "react-router-dom";

const SingleMenu = ({ item }) => {
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
      <span className="text-sm font-medium">{item.title}</span>
    </NavLink>
  );
};

export default SingleMenu;
