import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import { useSelector } from "react-redux";
import { hasAccess } from "@/utils/permissionUtils";
import { menuItems } from "@/mocks/data";

const MenuTest = () => {
  const [visibleMenu, setVisibleMenu] = useState([]);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    // Simulate the same filtering logic as Navmenu
    const filteredMenu = menuItems.filter((item, i) => {
      // Skip menu items that user doesn't have permission for
      if (!item.isHeadr && item.link && !hasAccess(item.page_name)) {
        return false;
      }
      
      // Role-based menu item filtering
      if (!item.isHeadr && item.link) {
        // For tasks permission, show different items based on role
        if (item.page_name === 'tasks') {
          if (item.link === '/tasks' && user?.role !== 'admin') {
            return false; // Hide "Tasks" for non-admin users
          }
          if (item.link === '/my-tasks' && user?.role === 'admin') {
            return false; // Hide "My Tasks" for admin users
          }
        }
      }
      
      // For section headers, check if they have any visible children
      if (item.isHeadr) {
        // Find all items after this header until the next header
        const sectionItems = [];
        for (let j = i + 1; j < menuItems.length; j++) {
          const nextItem = menuItems[j];
          if (nextItem.isHeadr) break; // Stop at next header
          sectionItems.push(nextItem);
        }
        
        // Check if any section items are visible (have permissions)
        const hasVisibleChildren = sectionItems.some(sectionItem => {
          if (!sectionItem.link) return false;
          if (!hasAccess(sectionItem.page_name)) return false;
          
          // Role-based filtering for section items
          if (sectionItem.page_name === 'tasks') {
            if (sectionItem.link === '/tasks' && user?.role !== 'admin') {
              return false; // Hide "Tasks" for non-admin users
            }
            if (sectionItem.link === '/my-tasks' && user?.role === 'admin') {
              return false; // Hide "My Tasks" for admin users
            }
          }
          
          return true;
        });
        
        // Hide section header if no children are visible
        if (!hasVisibleChildren) {
          return false;
        }
      }
      
      return true;
    });
    
    setVisibleMenu(filteredMenu);
  }, [user]);

  const getPermissionName = (link) => {
    const linkName = link.replace('/', '');
    const permissionMap = {
      'dashboard': 'dashboard',
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
      'permissions': 'users',
      'tasks': 'tasks',
      'my-tasks': 'tasks',
    };
    return permissionMap[linkName] || linkName;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Menu Visibility Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Shows which menu sections and items are visible for the current user
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Info */}
        <Card>
          <div className="p-4 border-b dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Current User
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              <div><strong>Username:</strong> {user?.username}</div>
              <div><strong>Role:</strong> {user?.role}</div>
              <div><strong>Name:</strong> {user?.name}</div>
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
              {['dashboard', 'users', 'tickets', 'follow_ups', 'supervisor_reviews', 'tasks', 'content', 'employees', 'ticket_analytics', 'content_analytics', 'employee_analytics'].map(permission => (
                <div key={permission} className="flex justify-between items-center">
                  <span className="font-medium">{permission}</span>
                  <span className={`px-2 py-1 rounded text-xs ${hasAccess(permission) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {hasAccess(permission) ? '✅' : '❌'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Visible Menu Structure */}
        <Card className="lg:col-span-2">
          <div className="p-4 border-b dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Visible Menu Structure
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {visibleMenu.map((item, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  {item.isHeadr ? (
                    <div className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                      📁 {item.title}
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">📄</span>
                        <span className="font-medium">{item.title}</span>
                        <span className="text-sm text-gray-500">({item.link})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Permission: {item.page_name}</span>
                        <span className={`px-2 py-1 rounded text-xs ${hasAccess(item.page_name) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {hasAccess(item.page_name) ? '✅' : '❌'}
                        </span>
                        {item.page_name === 'tasks' && (
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            {item.link === '/tasks' ? 'Admin Only' : 'User Only'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Hidden Sections */}
        <Card className="lg:col-span-2">
          <div className="p-4 border-b dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Hidden Sections (No Visible Items)
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {menuItems.filter(item => item.isHeadr).map((header, index) => {
                // Check if this section has any visible children
                const sectionStartIndex = menuItems.findIndex(item => item === header);
                const sectionItems = [];
                for (let j = sectionStartIndex + 1; j < menuItems.length; j++) {
                  const nextItem = menuItems[j];
                  if (nextItem.isHeadr) break;
                  sectionItems.push(nextItem);
                }
                
                const hasVisibleChildren = sectionItems.some(sectionItem => {
                  if (!sectionItem.link) return false;
                  return hasAccess(sectionItem.page_name);
                });
                
                if (!hasVisibleChildren) {
                  return (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="font-medium">📁 {header.title}</span>
                      <span className="text-xs text-gray-500">Hidden (no permissions)</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MenuTest; 