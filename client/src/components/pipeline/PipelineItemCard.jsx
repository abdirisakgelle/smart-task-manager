import React from 'react';
import { Calendar, User, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StageBadge, MoveForwardButton } from './index';
import Badge from '../ui/Badge';

const PipelineItemCard = ({ 
  item, 
  stage, 
  userRole,
  onMoveForward,
  className = ''
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800', 
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || colors.medium;
  };

  const getStageSpecificInfo = () => {
    switch (stage) {
      case 'Idea':
        return (
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <User size={14} className="mr-1" />
              <span>Script Writer: {item.script_writer_name || 'Not assigned'}</span>
            </div>
            {item.script_deadline && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar size={14} className="mr-1" />
                <span>Deadline: {formatDate(item.script_deadline)}</span>
              </div>
            )}
          </div>
        );
      
      case 'Script':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge className={`text-xs ${
                item.script_status === 'completed' ? 'bg-green-100 text-green-800' :
                item.script_status === 'in progress' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {item.script_status}
              </Badge>
              <Badge className={`text-xs ${
                item.content_status === 'Completed' ? 'bg-green-100 text-green-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {item.content_status}
              </Badge>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <User size={14} className="mr-1" />
              <span>Director: {item.director_name || 'Not assigned'}</span>
            </div>
            {item.filming_date && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar size={14} className="mr-1" />
                <span>Filming: {formatDate(item.filming_date)}</span>
              </div>
            )}
          </div>
        );
      
      case 'Production':
        return (
          <div className="space-y-2">
            <Badge className={`text-xs ${
              item.production_status === 'completed' ? 'bg-green-100 text-green-800' :
              item.production_status === 'in progress' ? 'bg-blue-100 text-blue-800' :
              item.production_status === 'blocked' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {item.production_status}
            </Badge>
            <div className="flex items-center text-sm text-gray-600">
              <User size={14} className="mr-1" />
              <span>Editor: {item.editor_name || 'Not assigned'}</span>
            </div>
            {item.start_time && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock size={14} className="mr-1" />
                <span>Started: {formatDate(item.start_time)}</span>
              </div>
            )}
            {item.completion_date && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar size={14} className="mr-1" />
                <span>Completed: {formatDate(item.completion_date)}</span>
              </div>
            )}
          </div>
        );
      
      case 'Social':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge className={`text-xs ${
                item.social_status === 'published' ? 'bg-green-100 text-green-800' :
                item.social_status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {item.social_status}
              </Badge>
              {item.social_approved && (
                <Badge className="text-xs bg-green-100 text-green-800">
                  ✓ Approved
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-600">
              <span>Platforms: {item.platforms || 'Not set'}</span>
            </div>
            <div className="text-sm text-gray-600">
              <span>Type: {item.post_type || 'Not set'}</span>
            </div>
            {item.post_date && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar size={14} className="mr-1" />
                <span>Post Date: {formatDate(item.post_date)}</span>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <StageBadge stage={stage} size="sm" />
            <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
              {item.priority} priority
            </Badge>
          </div>
          <Link 
            to={`/content-pipeline/details/${item.idea_id}`}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            {item.title}
          </Link>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <User size={14} className="mr-1" />
            <span>Contributor: {item.contributor_name || 'Unknown'}</span>
          </div>
        </div>
        
        {!item.canMoveForward && (
          <AlertCircle size={16} className="text-yellow-500 flex-shrink-0 mt-1" title="Cannot move forward - check requirements" />
        )}
      </div>

      {/* Stage-specific information */}
      <div className="mb-4">
        {getStageSpecificInfo()}
      </div>

      {/* Notes preview */}
      {item.notes && (
        <div className="mb-4 p-2 bg-gray-50 rounded text-sm text-gray-600">
          <p className="line-clamp-2">{item.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Created: {formatDate(item.submission_date || item.created_at)}
        </div>
        
        <MoveForwardButton
          ideaId={item.idea_id}
          currentStage={stage}
          canMoveForward={item.canMoveForward}
          userRole={userRole}
          onSuccess={onMoveForward}
          className="text-sm px-3 py-1.5"
        />
      </div>
    </div>
  );
};

export default PipelineItemCard;