import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

/**
 * Calculate time remaining until due date
 * @param {string} dueDate - The due date in ISO string format
 * @param {string} status - The task status
 * @returns {object} Object containing time remaining info
 */
export const getTimeRemaining = (dueDate, status) => {
  if (!dueDate) return null;
  
  const now = dayjs();
  const due = dayjs(dueDate);
  const isCompleted = status === 'Completed' || status === 'completed';
  
  if (isCompleted) {
    return {
      isOverdue: false,
      isCompleted: true,
      text: '✅ Completed',
      icon: 'heroicons:check-circle',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    };
  }
  
  const diff = due.diff(now, 'minute');
  
  if (diff < 0) {
    // Overdue
    const overdueDays = Math.abs(Math.floor(diff / 1440)); // 1440 minutes = 1 day
    const overdueHours = Math.abs(Math.floor((diff % 1440) / 60));
    
    let text = '';
    if (overdueDays > 0) {
      text = `⏰ Overdue by ${overdueDays}d ${overdueHours}h`;
    } else {
      text = `⏰ Overdue by ${overdueHours}h`;
    }
    
    return {
      isOverdue: true,
      isCompleted: false,
      text,
      icon: 'heroicons:exclamation-triangle',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    };
  } else {
    // Not overdue
    const days = Math.floor(diff / 1440);
    const hours = Math.floor((diff % 1440) / 60);
    const minutes = diff % 60;
    
    let text = '';
    if (days > 0) {
      text = `⏳ ${days}d ${hours}h left`;
    } else if (hours > 0) {
      text = `⏳ ${hours}h ${minutes}m left`;
    } else {
      text = `⏳ ${minutes}m left`;
    }
    
    // Determine urgency color
    let color = 'text-green-600';
    let bgColor = 'bg-green-100';
    let icon = 'heroicons:clock';
    
    if (diff < 60) { // Less than 1 hour
      color = 'text-red-600';
      bgColor = 'bg-red-100';
      icon = 'heroicons:exclamation-triangle';
    } else if (diff < 1440) { // Less than 1 day
      color = 'text-orange-600';
      bgColor = 'bg-orange-100';
      icon = 'heroicons:clock';
    } else if (diff < 4320) { // Less than 3 days
      color = 'text-yellow-600';
      bgColor = 'bg-yellow-100';
      icon = 'heroicons:clock';
    }
    
    return {
      isOverdue: false,
      isCompleted: false,
      text,
      icon,
      color,
      bgColor
    };
  }
};

/**
 * Format due date for display
 * @param {string} dueDate - The due date
 * @returns {string} Formatted date string
 */
export const formatDueDate = (dueDate) => {
  if (!dueDate) return 'No due date';
  
  const date = dayjs(dueDate);
  const now = dayjs();
  
  if (date.isSame(now, 'day')) {
    return 'Today';
  } else if (date.isSame(now.add(1, 'day'), 'day')) {
    return 'Tomorrow';
  } else if (date.isBefore(now)) {
    return date.format('MMM D, YYYY');
  } else {
    return date.format('MMM D, YYYY');
  }
};

/**
 * Format due time for display
 * @param {string} dueDate - The due date
 * @returns {string} Formatted time string
 */
export const formatDueTime = (dueDate) => {
  if (!dueDate) return '';
  
  return dayjs(dueDate).format('h:mm A');
};

/**
 * Check if task is overdue
 * @param {string} dueDate - The due date
 * @param {string} status - The task status
 * @returns {boolean} True if overdue
 */
export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'Completed' || status === 'completed') {
    return false;
  }
  
  return dayjs(dueDate).isBefore(dayjs());
}; 