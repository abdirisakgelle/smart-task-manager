import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Collapse } from "react-collapse";
import Icon from "@/components/ui/Icon";

import { useDispatch, useSelector } from "react-redux";
import useMobileMenu from "@/hooks/useMobileMenu";
import usePermissions from "@/hooks/usePermissions";
import Submenu from "./sub-menu";
import MenuItem from "./menu-item";
import SingleMenu from "./single-menu";

const Navmenu = ({ menus }) => {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const { hasPermission } = usePermissions();

  // Map menu links to permission page names
  const getPermissionName = (link) => {
    const linkName = link.replace('/', '');
    const permissionMap = {
      'dashboard': 'dashboard',
      'dashboard/admin': 'admin_dashboard',
      'dashboard/agent': 'agent_dashboard',
      'dashboard/content': 'content_dashboard',
      'dashboard/user': 'user_dashboard',
      'users': 'users',
      'employee-management': 'employees',
      'tickets': 'tickets',
      'follow-ups': 'follow_ups',
      'supervisor-reviews': 'supervisor_reviews',
      'new-creative-ideas': 'ideas',
      'content-management': 'content',
      'calendar': 'calendar',
      'production-workflow': 'production',
      'social-media': 'social_media',
      'ticket-analytics': 'ticket_analytics',
      'content-analytics': 'content_analytics',
      'employee-analytics': 'employee_analytics',
      'permissions': 'users', // Permission management uses users permission
      'tasks': 'tasks',
      'my-tasks': 'my_tasks',
    };
    return permissionMap[linkName] || linkName;
  };

  const toggleSubmenu = (i) => {
    if (activeSubmenu === i) {
      setActiveSubmenu(null);
    } else {
      setActiveSubmenu(i);
    }
  };

  const location = useLocation();
  const locationName = location.pathname.replace("/", "");
  const [mobileMenu, setMobileMenu] = useMobileMenu();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    let submenuIndex = null;
    menus.map((item, i) => {
      if (!item.child) return;
      if (item.link === locationName) {
        submenuIndex = null;
      } else {
        const ciIndex = item.child.findIndex(
          (ci) => ci.childlink === locationName
        );
        if (ciIndex !== -1) {
          submenuIndex = i;
        }
      }
    });
    document.title = `Nasiye Smart | ${locationName}`;

    setActiveSubmenu(submenuIndex);
    if (mobileMenu) {
      setMobileMenu(false);
    }
  }, [location]);

  return (
    <>
      <ul>
        {menus.map((item, i) => {
          // Skip menu items that user doesn't have permission for
          if (!item.isHeadr && item.link && !hasPermission(getPermissionName(item.link))) {
            return null;
          }
          
          // Role-based menu item filtering
          if (!item.isHeadr && item.link) {
            // For tasks permission, show different items based on role
            if (item.page_name === 'tasks') {
              // Show "Tasks" for admin, manager, and media (content dashboard) users
              if (item.link === '/tasks' && user?.role !== 'admin' && user?.role !== 'manager' && user?.role !== 'media') {
                return null; // Hide "Tasks" for users who should only see their own tasks
              }
              // Hide "My Tasks" for admin, manager, and media users (they should see "Tasks")
              if (item.link === '/my-tasks' && (user?.role === 'admin' || user?.role === 'manager' || user?.role === 'media')) {
                return null; // Hide "My Tasks" for users who should see "Tasks"
              }
            }
          }
          
          // For section headers, check if they have any visible children
          if (item.isHeadr) {
            // Find all items after this header until the next header
            const sectionItems = [];
            for (let j = i + 1; j < menus.length; j++) {
              const nextItem = menus[j];
              if (nextItem.isHeadr) break; // Stop at next header
              sectionItems.push(nextItem);
            }
            
            // Check if any section items are visible (have permissions)
            const hasVisibleChildren = sectionItems.some(sectionItem => {
              if (!sectionItem.link) return false;
              if (!hasPermission(getPermissionName(sectionItem.link))) return false;
              
              // Role-based filtering for section items
              if (sectionItem.page_name === 'tasks') {
                if (sectionItem.link === '/tasks' && user?.role !== 'admin' && user?.role !== 'manager' && user?.role !== 'media') {
                  return false; // Hide "Tasks" for users who should only see their own tasks
                }
                if (sectionItem.link === '/my-tasks' && (user?.role === 'admin' || user?.role === 'manager' || user?.role === 'media')) {
                  return false; // Hide "My Tasks" for users who should see "Tasks"
                }
              }
              
              return true;
            });
            
            // Hide section header if no children are visible
            if (!hasVisibleChildren) {
              return null;
            }
          }
          
          return (
            <li
              key={i}
              className={` single-menu-item 
                ${item.child ? "item-has-children" : ""}
                ${activeSubmenu === i ? "open" : ""}
                ${locationName === item.link ? "menu-item-active" : ""}`}
            >
              {/* single menu with no childred*/}
              {!item.child && !item.isHeadr && <SingleMenu item={item} />}
              {/* only for menu-label */}
              {item.isHeadr && !item.child && (
                <div className="menu-label">{item.title}</div>
              )}
              {/*    !!sub menu parent   */}
              {item.child && (
                <MenuItem
                  activeSubmenu={activeSubmenu}
                  item={item}
                  i={i}
                  toggleSubmenu={toggleSubmenu}
                />
              )}
              <Submenu activeSubmenu={activeSubmenu} item={item} i={i} />
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default Navmenu;
