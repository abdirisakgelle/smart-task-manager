import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import SidebarLogo from "./Logo";
import Navmenu from "./Navmenu";
import { menuItems } from "@/mocks/data";
import SimpleBar from "simplebar-react";
import useSidebar from "@/hooks/useSidebar";
import clsx from "clsx";

const Sidebar = () => {
  const scrollableNodeRef = useRef();
  const [collapsed, setMenuCollapsed] = useSidebar();
  const [menuHover, setMenuHover] = useState(false);
  const user = useSelector((state) => state.auth.user);

  // Get the first character of the user's name for the avatar
  const getAvatarText = () => {
    const displayName = user?.name || user?.username || "";
    return displayName.charAt(0).toUpperCase();
  };

  return (
    <div
      className={clsx(
        "sidebar-wrapper fixed top-0 h-screen bg-gray-900 shadow-lg transition-all duration-200 flex flex-col",
        {
          "w-[72px]": collapsed,
          "w-[280px]": !collapsed || menuHover,
        }
      )}
      onMouseEnter={() => setMenuHover(true)}
      onMouseLeave={() => setMenuHover(false)}
    >
      {/* Static Logo Section */}
      <div className="flex-none">
        <SidebarLogo menuHover={menuHover} />
      </div>
      
      {/* Scrollable Menu Section */}
      <div className="flex-1 overflow-y-auto">
        <Navmenu menus={menuItems} />
      </div>

      {/* Static Bottom Section */}
      <div className="flex-none p-4 border-t border-white/10">
        <div className={clsx("transition-opacity", {
          "opacity-0": collapsed && !menuHover,
          "opacity-100": !collapsed || menuHover,
        })}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold text-lg">
              {getAvatarText()}
            </div>
            <div>
              <h5 className="text-sm font-medium text-white">{user?.name || user?.username}</h5>
              <p className="text-xs text-white/50">{user?.department || user?.departmentName || "Department not assigned"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
