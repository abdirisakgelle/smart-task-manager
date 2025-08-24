import React, { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'react-toastify';

const stageTransitions = {
  'Idea': 'Script',
  'Script': 'Production', 
  'Production': 'Social',
  'Social': 'Published'
};

const MoveForwardButton = ({ 
  ideaId, 
  currentStage, 
  canMoveForward, 
  onSuccess, 
  userRole,
  disabled = false,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [note, setNote] = useState('');

  const nextStage = stageTransitions[currentStage];
  const isPublishing = currentStage === 'Social';

  // Check if user has permission to move forward
  const hasPermission = () => {
    const allowedRoles = ['admin', 'media', 'manager'];
    return allowedRoles.includes(userRole);
  };

  const handleMoveForward = async () => {
    if (!hasPermission()) {
      toast.error('You do not have permission to move this item forward');
      return;
    }

    if (!canMoveForward) {
      toast.error('This item cannot be moved forward. Check validation requirements.');
      return;
    }

    if (isPublishing && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/ideas/${ideaId}/move-forward`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          note: note.trim() || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to move forward');
      }

      toast.success(data.message || `Successfully moved to ${nextStage} stage`);
      
      if (onSuccess) {
        onSuccess(data);
      }

      // Reset states
      setNote('');
      setShowConfirmation(false);

    } catch (error) {
      console.error('Error moving forward:', error);
      toast.error(error.message || 'Failed to move forward');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setNote('');
  };

  if (!hasPermission() || !nextStage) {
    return null;
  }

  if (showConfirmation) {
    return (
      <div className="space-y-3">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">
            Confirm Publication
          </h4>
          <p className="text-sm text-yellow-700 mb-3">
            Are you sure you want to publish this social media post? This action will mark it as published and approved.
          </p>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Add a note (optional):
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any additional notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleMoveForward}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4 mr-2" />
                Confirm Publish
              </>
            )}
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={handleMoveForward}
      disabled={disabled || !canMoveForward || isLoading}
      className={`bg-blue-600 hover:bg-blue-700 text-white ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Moving...
        </>
      ) : (
        <>
          <ArrowRight className="w-4 h-4 mr-2" />
          Move to {nextStage}
        </>
      )}
    </Button>
  );
};

export default MoveForwardButton;