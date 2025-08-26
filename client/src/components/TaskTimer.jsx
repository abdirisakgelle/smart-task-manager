import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';

const TaskTimer = ({ dueDate, status }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const due = new Date(dueDate);
      const difference = due - now;

      if (difference <= 0) {
        setIsOverdue(true);
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
      setIsOverdue(false);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [dueDate]);

  if (status === 'Completed') {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <Icon icon="ph:check-circle" className="w-4 h-4" />
        <span className="text-sm font-medium">Completed</span>
      </div>
    );
  }

  if (isOverdue) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <Icon icon="ph:warning" className="w-4 h-4" />
        <span className="text-sm font-medium">Overdue</span>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Icon icon="ph:clock" className="w-4 h-4" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  const formatTime = () => {
    if (timeLeft.days > 0) {
      return `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`;
    } else if (timeLeft.hours > 0) {
      return `${timeLeft.hours}h ${timeLeft.minutes}m`;
    } else if (timeLeft.minutes > 0) {
      return `${timeLeft.minutes}m ${timeLeft.seconds}s`;
    } else {
      return `${timeLeft.seconds}s`;
    }
  };

  const getTimeColor = () => {
    const totalMinutes = timeLeft.days * 24 * 60 + timeLeft.hours * 60 + timeLeft.minutes;
    
    if (totalMinutes <= 15) return 'text-red-600'; // Less than 15 minutes
    if (totalMinutes <= 30) return 'text-orange-600'; // Less than 30 minutes
    if (totalMinutes <= 60) return 'text-yellow-600'; // Less than 1 hour
    if (totalMinutes <= 240) return 'text-blue-600'; // Less than 4 hours
    return 'text-green-600'; // More than 4 hours
  };

  const getUrgencyLevel = () => {
    const totalMinutes = timeLeft.days * 24 * 60 + timeLeft.hours * 60 + timeLeft.minutes;
    
    if (totalMinutes <= 15) return 'Critical';
    if (totalMinutes <= 30) return 'Urgent';
    if (totalMinutes <= 60) return 'High';
    if (totalMinutes <= 240) return 'Medium';
    return 'Low';
  };

  return (
    <div className={`flex items-center gap-2 ${getTimeColor()}`}>
      <Icon icon="ph:clock" className="w-4 h-4" />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{formatTime()}</span>
        <span className="text-xs opacity-75">{getUrgencyLevel()}</span>
      </div>
    </div>
  );
};

export default TaskTimer; 