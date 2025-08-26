import React, { useState } from "react";
import Icon from "@/components/ui/Icon";
import { Link } from "react-router-dom";
import { Menu } from "@headlessui/react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { 
  useGetMyNotificationsQuery, 
  useMarkAsReadMutation, 
  useMarkAllAsReadMutation, 
  useDeleteNotificationMutation 
} from "@/store/api/apiSlice";
import { toast } from "react-toastify";

const NotificationPage = () => {
  const [filter, setFilter] = useState('all'); // all, unread, read
  const { data: notifications = [], isLoading, error, refetch } = useGetMyNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'read') return notification.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const readCount = notifications.filter(n => n.is_read).length;

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId).unwrap();
      toast.success('Notification marked as read');
    } catch (err) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await deleteNotification(notificationId).unwrap();
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete notification');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Icon icon="heroicons:exclamation-triangle-20-solid" className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Notifications</h3>
        <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
        <Button onClick={refetch} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Card bodyClass="p-0">
        <div className="flex justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-600">
          <div className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-6">
            All Notifications
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <Button
                size="sm"
                className={`${filter === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setFilter('all')}
              >
                All ({notifications.length})
              </Button>
              <Button
                size="sm"
                className={`${filter === 'unread' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setFilter('unread')}
              >
                Unread ({unreadCount})
              </Button>
              <Button
                size="sm"
                className={`${filter === 'read' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setFilter('read')}
              >
                Read ({readCount})
              </Button>
            </div>
            {unreadCount > 0 && (
              <Button
                size="sm"
                onClick={handleMarkAllAsRead}
                className="bg-green-500 text-white hover:bg-green-600"
              >
                Mark All Read
              </Button>
            )}
          </div>
        </div>
        
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Icon icon="heroicons:bell" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {filter === 'all' ? 'No notifications yet' : 
                 filter === 'unread' ? 'No unread notifications' : 'No read notifications'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filter === 'all' ? 'You\'ll see notifications here when tasks are assigned to you.' :
                 filter === 'unread' ? 'All caught up! No unread notifications.' : 'No read notifications to show.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((item, i) => (
              <Menu as="div" key={i} className="relative">
                {({ open }) => (
                  <>
                    <div className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      !item.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}>
                      <div className="flex items-start space-x-4">
                        <div className="flex-none">
                          <div
                            className={`h-12 w-12 rounded-full flex items-center justify-center text-2xl text-white
                            ${getNotificationStatus(item.type) === "cyan" ? "bg-cyan-500" : ""} 
                            ${getNotificationStatus(item.type) === "blue" ? "bg-indigo-500" : ""} 
                            ${getNotificationStatus(item.type) === "red" ? "bg-red-500" : ""} 
                            ${getNotificationStatus(item.type) === "green" ? "bg-green-500" : ""}
                            ${getNotificationStatus(item.type) === "yellow" ? "bg-yellow-500" : ""}
                            `}
                          >
                            <Icon icon={getNotificationIcon(item.type)} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.title}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {item.message}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                {formatTimeAgo(item.created_at)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {!item.is_read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                              <Menu.Button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                <Icon icon="heroicons:ellipsis-vertical" className="w-4 h-4 text-gray-400" />
                              </Menu.Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Menu.Items className="absolute right-0 top-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <div className="py-1">
                        {!item.is_read && (
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => handleMarkAsRead(item.notification_id)}
                                className={`${
                                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                              >
                                Mark as read
                              </button>
                            )}
                          </Menu.Item>
                        )}
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => handleDeleteNotification(item.notification_id)}
                              className={`${
                                active ? 'bg-gray-100 dark:bg-gray-700' : ''
                              } block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                            >
                              Delete
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </>
                )}
              </Menu>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default NotificationPage;
