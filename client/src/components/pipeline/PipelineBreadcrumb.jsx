import React from 'react';
import { ChevronRight, CheckCircle } from 'lucide-react';

const stages = [
  { key: 'Idea', label: 'New Creative Ideas', icon: '💡' },
  { key: 'Script', label: 'Content Management', icon: '📝' },
  { key: 'Production', label: 'Production Workflow', icon: '🎬' },
  { key: 'Social', label: 'Social Media', icon: '📱' }
];

const PipelineBreadcrumb = ({ currentStage, className = '' }) => {
  const currentIndex = stages.findIndex(stage => stage.key === currentStage);
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {stages.map((stage, index) => {
        const isCurrent = stage.key === currentStage;
        const isCompleted = index < currentIndex;
        const isUpcoming = index > currentIndex;
        
        return (
          <React.Fragment key={stage.key}>
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
              isCurrent 
                ? 'bg-blue-100 text-blue-800 font-semibold shadow-sm' 
                : isCompleted 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-gray-50 text-gray-500'
            }`}>
              <div className="flex items-center space-x-2">
                {isCompleted ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : (
                  <span className="text-lg">{stage.icon}</span>
                )}
                <span className="text-sm font-medium">{stage.label}</span>
              </div>
            </div>
            
            {index < stages.length - 1 && (
              <ChevronRight 
                size={16} 
                className={`${
                  isCompleted ? 'text-green-400' : 'text-gray-300'
                }`} 
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default PipelineBreadcrumb;