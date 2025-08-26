import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import { Icon } from '@iconify/react';
import dayjs from 'dayjs';

// Extension Request Modal
export const ExtensionRequestModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  task, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    extension_reason: '',
    requested_due_date: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({ extension_reason: '', requested_due_date: '' });
    onClose();
  };

  return (
    <Modal activeModal={isOpen} onClose={handleClose} className="max-w-md">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon icon="heroicons:clock" className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Request Extension</h3>
            <p className="text-sm text-slate-500">Extend the deadline for this task</p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-medium text-slate-900 mb-2">{task?.title}</h4>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>Current due: {dayjs(task?.due_date).format('MMM D, YYYY h:mm A')}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              New Due Date & Time
            </label>
            <input
              type="datetime-local"
              required
              value={formData.requested_due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, requested_due_date: e.target.value }))}
              min={dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Must be at least 1 hour from now
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Reason for Extension
            </label>
            <Textarea
              required
              value={formData.extension_reason}
              onChange={(e) => setFormData(prev => ({ ...prev, extension_reason: e.target.value }))}
              placeholder="Explain why you need an extension..."
              rows={3}
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || !formData.extension_reason || !formData.requested_due_date}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2 animate-spin" />
                  Requesting...
                </>
              ) : (
                <>
                  <Icon icon="heroicons:paper-airplane" className="w-4 h-4 mr-2" />
                  Request Extension
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={handleClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-0 px-4 py-2 rounded-lg font-medium transition-all duration-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

// Task Completion Modal
export const TaskCompletionModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  task, 
  loading = false 
}) => {
  const [completionComment, setCompletionComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ completion_comment: completionComment });
  };

  const handleClose = () => {
    setCompletionComment('');
    onClose();
  };

  return (
    <Modal activeModal={isOpen} onClose={handleClose} className="max-w-md">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Icon icon="heroicons:check-circle" className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Mark as Completed</h3>
            <p className="text-sm text-slate-500">Complete this task with optional notes</p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-medium text-slate-900 mb-2">{task?.title}</h4>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>Due: {dayjs(task?.due_date).format('MMM D, YYYY h:mm A')}</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
              {task?.priority}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Completion Notes (Optional)
            </label>
            <Textarea
              value={completionComment}
              onChange={(e) => setCompletionComment(e.target.value)}
              placeholder="Add any notes about the completion..."
              rows={3}
              className="w-full"
            />
            <p className="text-xs text-slate-500 mt-1">
              Optional: Add details about what was accomplished
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white border-0 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <Icon icon="heroicons:check" className="w-4 h-4 mr-2" />
                  Mark as Completed
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={handleClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-0 px-4 py-2 rounded-lg font-medium transition-all duration-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

// Extension Approval Modal (for managers/admins)
export const ExtensionApprovalModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  task, 
  loading = false 
}) => {
  const [decision, setDecision] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ extension_status: decision });
  };

  const handleClose = () => {
    setDecision('');
    onClose();
  };

  if (!task?.extension_requested || task?.extension_status !== 'Pending') {
    return null;
  }

  return (
    <Modal activeModal={isOpen} onClose={handleClose} className="max-w-md">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Icon icon="heroicons:clock" className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Extension Request</h3>
            <p className="text-sm text-slate-500">Review and approve/reject the extension request</p>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-900 mb-2">{task?.title}</h4>
            <div className="space-y-2 text-sm text-slate-600">
              <div>Current due: {dayjs(task?.due_date).format('MMM D, YYYY h:mm A')}</div>
              <div>Requested due: {dayjs(task?.requested_due_date).format('MMM D, YYYY h:mm A')}</div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-slate-900 mb-2">Reason for Extension</h5>
            <p className="text-sm text-slate-700">{task?.extension_reason}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Decision
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="decision"
                  value="Approved"
                  checked={decision === 'Approved'}
                  onChange={(e) => setDecision(e.target.value)}
                  className="text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-green-700">Approve</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="decision"
                  value="Rejected"
                  checked={decision === 'Rejected'}
                  onChange={(e) => setDecision(e.target.value)}
                  className="text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-medium text-red-700">Reject</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || !decision}
              className={`border-0 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
                decision === 'Approved' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : decision === 'Rejected'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Icon icon={decision === 'Approved' ? 'heroicons:check' : 'heroicons:x-mark'} className="w-4 h-4 mr-2" />
                  {decision || 'Select Decision'}
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={handleClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-0 px-4 py-2 rounded-lg font-medium transition-all duration-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}; 