import React, { useState, useEffect } from "react";
import Dropdown from "@/components/ui/Dropdown";
import Icon from "@/components/ui/Icon";
import { Link } from "react-router-dom";
import { Menu } from "@headlessui/react";
import { useGetMyNotificationsQuery, useGetUnreadCountQuery, useMarkAsReadMutation } from "@/store/api/apiSlice";
import { toast } from "react-toastify";

const notifyLabel = (unreadCount = 0) => {
  return (
    <span className="relative">
      <svg
        width="24"
        height="25"
        viewBox="0 0 24 25"
        fill="none"
        className=""
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 18.8476C17.6392 18.8476 20.2481 18.1242 20.5 15.2205C20.5 12.3188 18.6812 12.5054 18.6812 8.94511C18.6812 6.16414 16.0452 3 12 3C7.95477 3 5.31885 6.16414 5.31885 8.94511C5.31885 12.5054 3.5 12.3188 3.5 15.2205C3.75295 18.1352 6.36177 18.8476 12 18.8476Z"
          className=" stroke-gray-600 dark:stroke-gray-100"
          strokeWidth="1.5"
          strokeLinecap="round"
        ></path>
        <path
          d="M14.3889 21.8572C13.0247 23.372 10.8967 23.3899 9.51953 21.8572"
          className=" stroke-gray-600 dark:stroke-gray-100"
          strokeWidth="1.5"
          strokeLinecap="round"
        ></path>
        {unreadCount > 0 && (
          <circle
            cx="17"
            cy="5"
            r="4.5"
            className=" fill-red-500"
            stroke="white"
          ></circle>
        )}
      </svg>
      {unreadCount > 0 && (
        <span className="absolute right-1 top-0 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 ring-1 ring-white"></span>
        </span>
      )}
    </span>
  );
};

const Notification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notifications = [], isLoading, error } = useGetMyNotificationsQuery({ limit: 10 });
  const { data: unreadData } = useGetUnreadCountQuery();
  const [markAsRead] = useMarkAsReadMutation();

  const unreadCount = unreadData?.unread_count || 0;

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await markAsRead(notification.notification_id).unwrap();
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assignment':
        return 'heroicons:user-plus';
      case 'task_update':
        return 'heroicons:pencil-square';
      case 'task_completion':
        return 'heroicons:check-circle';
      case 'script_assignment':
        return 'heroicons:document-text';
      case 'idea_assignment':
        return 'heroicons:light-bulb';
      case 'content_assignment':
        return 'heroicons:film';
      case 'cast_assignment':
        return 'heroicons:user-group';
      case 'system':
        return 'heroicons:information-circle';
      default:
        return 'heroicons:bell';
    }
  };

  const getNotificationStatus = (type) => {
    switch (type) {
      case 'task_assignment':
        return 'blue';
      case 'task_update':
        return 'yellow';
      case 'task_completion':
        return 'green';
      case 'script_assignment':
        return 'purple';
      case 'idea_assignment':
        return 'orange';
      case 'content_assignment':
        return 'indigo';
      case 'cast_assignment':
        return 'pink';
      default:
        return 'cyan';
    }
  };

  const formatTimeAgo = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now - created) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return created.toLocaleDateString();
  };

  if (error) {
    console.error('Error loading notifications:', error);
  }

  return (
    <div className="md:block hidden">
      <Dropdown 
        classMenuItems="md:w-[360px] top-[30px]" 
        label={notifyLabel(unreadCount)}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
      >
        <div className="flex justify-between px-4 py-4 border-b border-gray-10 dark:border-gray-600">
          <div className="text-sm text-gray-800 dark:text-gray-200 font-semibold leading-6">
            Recent Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
        </div>
        <div className="divide-y divide-gray-10 dark:divide-gray-800 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-2 text-sm">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Icon icon="heroicons:bell" className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((item, i) => (
              <Menu.Item key={i}>
                {({ active }) => (
                  <div
                    className={`${
                      active
                        ? "bg-gray-100 dark:bg-gray-700 dark:bg-opacity-70 text-gray-800"
                        : "text-gray-600 dark:text-gray-300"
                    } block w-full px-4 py-2 text-sm cursor-pointer group ${
                      !item.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => handleNotificationClick(item)}
                  >
                    <div className="flex ltr:text-left rtl:text-right">
                      <div className="flex-none ltr:mr-4 rtl:ml-4">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-all duration-200 text-white
                          ${getNotificationStatus(item.type) === "cyan" ? "bg-cyan-500 " : ""} 
                          ${getNotificationStatus(item.type) === "blue" ? "bg-indigo-500 " : ""} 
                          ${getNotificationStatus(item.type) === "red" ? "bg-red-500 " : ""} 
                          ${getNotificationStatus(item.type) === "green" ? "bg-green-500 " : ""}
                          ${getNotificationStatus(item.type) === "yellow" ? "bg-yellow-500 " : ""}
                          `}
                        >
                          <Icon icon={getNotificationIcon(item.type)} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div
                          className={`${
                            active
                              ? "text-gray-600 dark:text-gray-300"
                              : " text-gray-600 dark:text-gray-300"
                          } text-sm`}
                        >
                          <div className="font-medium">{item.title}</div>
                          <div className="text-gray-500 dark:text-gray-400 mt-1">
                            {item.message}
                          </div>
                        </div>
                        <div className="text-gray-400 dark:text-gray-400 text-xs mt-1 text-light">
                          {formatTimeAgo(item.created_at)}
                        </div>
                      </div>
                      {!item.is_read && (
                        <div className="flex-none">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Menu.Item>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <div className="text-center mb-3 mt-1">
            <Link
              to="/notifications"
              className="text-sm text-indigo-500 hover:underline transition-all duration-150"
            >
              View all
            </Link>
          </div>
        )}
      </Dropdown>
    </div>
  );
};

export default Notification;
