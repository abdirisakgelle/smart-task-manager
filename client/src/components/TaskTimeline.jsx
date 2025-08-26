import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';

const TaskTimeline = ({ taskId, onClose }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [taskId]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/tasks/${taskId}/timeline`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch timeline');
      }

      const data = await response.json();
      setTimeline(data.timeline || []);
    } catch (error) {
      console.error('Error fetching timeline:', error);
      toast.error('Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType) => {
    const iconMap = {
      'created': 'ph:plus-circle',
      'status_changed': 'ph:arrows-clockwise',
      'assigned': 'ph:user-plus',
      'reassigned': 'ph:user-switch',
      'commented': 'ph:chat-circle',
      'due_date_changed': 'ph:calendar'
    };
    return iconMap[eventType] || 'ph:circle';
  };

  const getEventColor = (eventType) => {
    const colorMap = {
      'created': 'text-green-500',
      'status_changed': 'text-blue-500',
      'assigned': 'text-purple-500',
      'reassigned': 'text-orange-500',
      'commented': 'text-gray-500',
      'due_date_changed': 'text-red-500'
    };
    return colorMap[eventType] || 'text-gray-400';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Task Timeline
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <Icon icon="ph:x" className="w-6 h-6" />
          </button>
        </div>

        {/* Timeline Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {timeline.length === 0 ? (
            <div className="text-center py-8">
              <Icon icon="ph:clock" className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                No timeline events
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                Timeline events will appear here as the task progresses.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={event.timeline_id} className="flex items-start space-x-4">
                  {/* Timeline Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getEventColor(event.event_type)} bg-gray-100 dark:bg-gray-700`}>
                      <Icon icon={getEventIcon(event.event_type)} className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Timeline Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {event.description}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(event.created_at)}
                      </span>
                    </div>
                    
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        by {event.user_name} ({event.user_role})
                      </span>
                      
                      {event.old_value && event.new_value && (
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-400">Changed from</span>
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                            {event.old_value}
                          </span>
                          <span className="text-xs text-gray-400">to</span>
                          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                            {event.new_value}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="btn btn-outline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskTimeline; 