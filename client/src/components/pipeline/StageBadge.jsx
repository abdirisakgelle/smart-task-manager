import React from 'react';
import { Badge } from '../ui/badge';

const stageConfig = {
  'Idea': {
    icon: '💡',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Idea'
  },
  'Script': {
    icon: '📝',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'Script'
  },
  'Production': {
    icon: '🎬',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    label: 'Production'
  },
  'Social': {
    icon: '📱',
    color: 'bg-green-100 text-green-800 border-green-200',
    label: 'Social'
  },
  'Published': {
    icon: '✅',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    label: 'Published'
  }
};

const StageBadge = ({ stage, size = 'default', showIcon = true, className = '' }) => {
  const config = stageConfig[stage] || stageConfig['Idea'];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    default: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };
  
  return (
    <div className={`inline-flex items-center space-x-1 rounded-full border ${config.color} ${sizeClasses[size]} ${className}`}>
      {showIcon && (
        <span className="text-sm">{config.icon}</span>
      )}
      <span className="font-medium">{config.label}</span>
    </div>
  );
};

export default StageBadge;