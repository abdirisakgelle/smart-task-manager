import React, { useEffect, useState } from 'react';
import Icon from '@/components/ui/Icon';

const TaskNotification = ({ task, timeLeft }) => {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('');

  useEffect(() => {
    if (!timeLeft || task.status === 'Completed') return;

    const totalMinutes = timeLeft.days * 24 * 60 + timeLeft.hours * 60 + timeLeft.minutes;
    
    if (totalMinutes <= 15) {
      setNotificationType('critical');
      setShowNotification(true);
    } else if (totalMinutes <= 30) {
      setNotificationType('urgent');
      setShowNotification(true);
    } else if (totalMinutes <= 60) {
      setNotificationType('warning');
      setShowNotification(true);
    } else {
      setShowNotification(false);
    }
  }, [timeLeft, task.status]);

  const getNotificationConfig = () => {
    switch (notificationType) {
      case 'critical':
        return {
          icon: 'ph:warning',
          color: 'bg-red-500',
          textColor: 'text-red-700',
          message: 'Critical: Task due very soon!'
        };
      case 'urgent':
        return {
          icon: 'ph:clock',
          color: 'bg-orange-500',
          textColor: 'text-orange-700',
          message: 'Urgent: Task due soon!'
        };
      case 'warning':
        return {
          icon: 'ph:bell',
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          message: 'Reminder: Task deadline approaching'
        };
      default:
        return null;
    }
  };

  if (!showNotification) return null;

  const config = getNotificationConfig();
  if (!config) return null;

  return (
    <div className={`${config.color} ${config.textColor} p-3 rounded-lg mb-4 flex items-center gap-3`}>
      <Icon icon={config.icon} className="w-5 h-5" />
      <div className="flex-1">
        <p className="font-medium">{config.message}</p>
        <p className="text-sm opacity-90">
          "{task.title}" - {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}{timeLeft.hours}h {timeLeft.minutes}m remaining
        </p>
      </div>
      <button
        onClick={() => setShowNotification(false)}
        className="text-sm opacity-75 hover:opacity-100"
      >
        <Icon icon="ph:x" className="w-4 h-4" />
      </button>
    </div>
  );
};

export default TaskNotification; 