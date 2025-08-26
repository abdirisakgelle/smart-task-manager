import React from 'react';
import Icon from '@/components/ui/Icon';

const TaskProgress = ({ task, timeLeft }) => {
  const getProgressPercentage = () => {
    // For completed tasks, show 100%
    const isCompleted = task.status === 'Completed' || task.status === 'completed';
    if (isCompleted) {
      return 100;
    }
    
    // For active tasks, calculate based on time
    const totalDuration = new Date(task.due_date) - new Date(task.created_at);
    const elapsed = new Date() - new Date(task.created_at);
    const percentage = Math.min((elapsed / totalDuration) * 100, 100);
    return Math.max(percentage, 0);
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    const isCompleted = task.status === 'Completed' || task.status === 'completed';
    if (isCompleted) return 'bg-green-500';
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getEstimatedCompletion = () => {
    const isCompleted = task.status === 'Completed' || task.status === 'completed';
    if (isCompleted) return 'Completed';
    
    const totalMinutes = timeLeft?.days * 24 * 60 + timeLeft?.hours * 60 + timeLeft?.minutes || 0;
    const estimatedHours = Math.ceil(totalMinutes / 60);
    
    if (estimatedHours <= 1) return `${totalMinutes} mins`;
    if (estimatedHours <= 24) return `${estimatedHours} hrs`;
    return `${Math.ceil(estimatedHours / 24)} days`;
  };

  return (
    <div className="flex items-center gap-3">
      {/* Progress Bar */}
      <div className="flex-1">
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>
      
      {/* Progress Info */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="font-medium text-slate-700">{Math.round(getProgressPercentage())}%</span>
        <span className="text-slate-300">—</span>
        <span>Est. {getEstimatedCompletion()}</span>
      </div>
    </div>
  );
};

export default TaskProgress; 