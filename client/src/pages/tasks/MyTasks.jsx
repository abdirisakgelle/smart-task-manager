import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Badge from '@/components/ui/Badge';
import TaskTimer from '@/components/TaskTimer';
import TaskProgress from '@/components/TaskProgress';
import TaskNotification from '@/components/TaskNotification';
import { ExtensionRequestModal, TaskCompletionModal } from '@/components/TaskModals';
import { getTimeRemaining, formatDueDate, formatDueTime } from '@/utils/countdownTimer';
import { formatDueDateForDisplay, formatDueTimeForDisplay } from '@/utils/timeUtils';
import { toast } from 'react-toastify';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dueDateFilter, setDueDateFilter] = useState('all');
  const [extensionModalOpen, setExtensionModalOpen] = useState(false);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: 'task_id', direction: 'desc' });
  const [viewMode, setViewMode] = useState('table'); // table, grid, list
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/tasks/my-tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error(error.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      
      const statusMapping = {
        'In Progress': 'in_progress',
        'Completed': 'completed',
        'Pending': 'pending',
        'Not Started': 'pending'
      };
      
      const backendStatus = statusMapping[newStatus] || newStatus;
      
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: backendStatus })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update task status');
      }

      toast.success('Task status updated successfully');
      fetchMyTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error(error.message || 'Failed to update task status');
    } finally {
      setUpdating(false);
    }
  };

  const requestExtension = async (formData) => {
    try {
      setModalLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/tasks/${selectedTask.task_id}/extension-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to request extension');
      }

      toast.success('Extension request submitted successfully');
      setExtensionModalOpen(false);
      setSelectedTask(null);
      fetchMyTasks();
    } catch (error) {
      console.error('Error requesting extension:', error);
      toast.error(error.message || 'Failed to request extension');
    } finally {
      setModalLoading(false);
    }
  };

  const completeTask = async (formData) => {
    try {
      setModalLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/tasks/${selectedTask.task_id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to complete task');
      }

      toast.success('Task completed successfully');
      setCompletionModalOpen(false);
      setSelectedTask(null);
      fetchMyTasks();
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error(error.message || 'Failed to complete task');
    } finally {
      setModalLoading(false);
    }
  };

  const openExtensionModal = (task) => {
    setSelectedTask(task);
    setExtensionModalOpen(true);
  };

  const openCompletionModal = (task) => {
    setSelectedTask(task);
    setCompletionModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'warning', text: 'Pending', icon: '⏳', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
      'in_progress': { color: 'info', text: 'In Progress', icon: '🔄', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
      'completed': { color: 'success', text: 'Completed', icon: '✅', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
      'cancelled': { color: 'danger', text: 'Cancelled', icon: '❌', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' },
      'Not Started': { color: 'warning', text: 'Pending', icon: '⏳', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
      'In Progress': { color: 'info', text: 'In Progress', icon: '🔄', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
      'Completed': { color: 'success', text: 'Completed', icon: '✅', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
      'Cancelled': { color: 'danger', text: 'Cancelled', icon: '❌', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' }
    };

    const config = statusConfig[status] || statusConfig['pending'];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor} shadow-sm`}>
        <span className="text-sm">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'High': { icon: '🔴', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' },
      'Medium': { icon: '🟡', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
      'Low': { icon: '🟢', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' }
    };

    const config = priorityConfig[priority] || priorityConfig['Medium'];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor} shadow-sm`}>
        <span className="text-sm">{config.icon}</span>
        {priority}
      </span>
    );
  };

  const getTaskIcon = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('video') || lowerTitle.includes('production')) return '🎬';
    if (lowerTitle.includes('content') || lowerTitle.includes('write')) return '✍️';
    if (lowerTitle.includes('design') || lowerTitle.includes('graphic')) return '🎨';
    if (lowerTitle.includes('social') || lowerTitle.includes('media')) return '📱';
    if (lowerTitle.includes('support') || lowerTitle.includes('help')) return '🆘';
    return '📋';
  };

  const getTimeRemainingStatus = (dueDate, status) => {
    const isCompleted = status === 'Completed' || status === 'completed';
    
    if (isCompleted) {
      return { text: '✅ Completed', color: 'text-emerald-600', bgColor: 'bg-emerald-50' };
    }

    const now = new Date();
    const due = new Date(dueDate);
    const diffHours = (due - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return { text: '🔺 Overdue', color: 'text-red-600 font-semibold', bgColor: 'bg-red-50' };
    } else if (diffHours < 24) {
      return { text: '⏳ Due soon', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    } else {
      return { text: '📅 Due later', color: 'text-slate-600', bgColor: 'bg-slate-50' };
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = () => {
    if (selectedRows.size === filteredTasks.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredTasks.map(task => task.task_id)));
    }
  };

  const handleSelectRow = (taskId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedRows(newSelected);
  };

  // Filter and search logic
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        const isCompleted = task.status === 'Completed' || task.status === 'completed';
        
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            task.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || 
                            task.status.toLowerCase() === statusFilter.toLowerCase();
        
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        
        const matchesDueDate = dueDateFilter === 'all' || 
                              (dueDateFilter === 'today' && new Date(task.due_date).toDateString() === new Date().toDateString()) ||
                              (dueDateFilter === 'overdue' && new Date(task.due_date) < new Date() && !isCompleted);

        const shouldShow = !isCompleted || statusFilter === 'completed' || statusFilter === 'Completed';

        return shouldShow && matchesSearch && matchesStatus && matchesPriority && matchesDueDate;
      })
      .sort((a, b) => {
        const { key, direction } = sortConfig;
        let aValue = a[key];
        let bValue = b[key];

        if (key === 'due_date') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [tasks, searchTerm, statusFilter, priorityFilter, dueDateFilter, sortConfig]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Tasks</h1>
          <p className="text-slate-600">View and manage your active tasks (completed tasks are hidden)</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchMyTasks}
            disabled={loading}
            className="bg-slate-600 hover:bg-slate-700 text-white border-0"
            title="Refresh tasks"
          >
            <Icon icon="heroicons:arrow-path" className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {tasks.map((task) => (
        <TaskNotification 
          key={`notification-${task.task_id}`}
          task={task}
          timeLeft={null}
        />
      ))}

      {/* Advanced Data Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {/* Table Header Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-4 mb-4 lg:mb-0">
            {/* Search */}
            <div className="relative">
              <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white min-w-[200px]"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white text-sm"
              >
                <option value="all">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                value={dueDateFilter}
                onChange={(e) => setDueDateFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white text-sm"
              >
                <option value="all">All Due Dates</option>
                <option value="today">Due Today</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {selectedRows.size > 0 && (
              <span className="text-sm text-slate-600">
                {selectedRows.size} selected
              </span>
            )}
            <button className="p-2 rounded-md hover:bg-slate-200 transition-colors text-slate-600">
              <Icon icon="heroicons:arrow-down-tray" className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || dueDateFilter !== 'all'
                ? 'No tasks match your filters'
                : 'No tasks for now'
              }
            </h3>
            <p className="text-slate-500 mb-4">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || dueDateFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Enjoy your focus time!'
              }
            </p>
            {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || dueDateFilter !== 'all') && (
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setDueDateFilter('all');
                }}
                className="bg-slate-600 hover:bg-slate-700 text-white border-0"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input 
                      type="checkbox" 
                      checked={selectedRows.size === filteredTasks.length && filteredTasks.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-2">
                      Title
                      <Icon 
                        icon={sortConfig.key === 'title' ? (sortConfig.direction === 'asc' ? 'heroicons:chevron-up' : 'heroicons:chevron-down') : 'heroicons:chevron-up-down'} 
                        className="w-4 h-4" 
                      />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center gap-2">
                      Priority
                      <Icon 
                        icon={sortConfig.key === 'priority' ? (sortConfig.direction === 'asc' ? 'heroicons:chevron-up' : 'heroicons:chevron-down') : 'heroicons:chevron-up-down'} 
                        className="w-4 h-4" 
                      />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('due_date')}
                  >
                    <div className="flex items-center gap-2">
                      Due Date
                      <Icon 
                        icon={sortConfig.key === 'due_date' ? (sortConfig.direction === 'asc' ? 'heroicons:chevron-up' : 'heroicons:chevron-down') : 'heroicons:chevron-up-down'} 
                        className="w-4 h-4" 
                      />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredTasks.map((task) => (
                  <SimpleTaskRow
                    key={task.task_id}
                    task={task}
                    user={user}
                    isSelected={selectedRows.has(task.task_id)}
                    onSelect={() => handleSelectRow(task.task_id)}
                    getStatusBadge={getStatusBadge}
                    getPriorityBadge={getPriorityBadge}
                    getTaskIcon={getTaskIcon}
                    updateTaskStatus={updateTaskStatus}
                    updating={updating}
                    openExtensionModal={openExtensionModal}
                    openCompletionModal={openCompletionModal}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Extension Request Modal */}
      <ExtensionRequestModal
        isOpen={extensionModalOpen}
        onClose={() => setExtensionModalOpen(false)}
        onSubmit={requestExtension}
        task={selectedTask}
        loading={modalLoading}
      />

      {/* Task Completion Modal */}
      <TaskCompletionModal
        isOpen={completionModalOpen}
        onClose={() => setCompletionModalOpen(false)}
        onSubmit={completeTask}
        task={selectedTask}
        loading={modalLoading}
      />
    </div>
  );
};

// Simple Task Row Component
const SimpleTaskRow = ({ 
  task, 
  user,
  isSelected,
  onSelect,
  getStatusBadge, 
  getPriorityBadge, 
  getTaskIcon, 
  updateTaskStatus, 
  updating,
  openExtensionModal,
  openCompletionModal
}) => {
  const timeRemaining = getTimeRemaining(task.due_date, task.status);
  const isOverdue = task.status !== 'Completed' && task.status !== 'completed' && new Date(task.due_date) < new Date();
  const canRequestExtension = task.status !== 'Completed' && task.status !== 'completed' && !task.extension_requested && !isOverdue;
  const canComplete = task.status !== 'Completed' && task.status !== 'completed';
  
  const getProgressPercentage = () => {
    if (task.status === 'Completed' || task.status === 'completed') return 100;
    if (task.status === 'In Progress' || task.status === 'in_progress') return 70;
    return 0;
  };

  const getOverdueText = () => {
    if (!isOverdue) return null;
    const now = new Date();
    const due = new Date(task.due_date);
    const diffMs = now - due;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `Overdue by ${diffDays}d ${diffHours}h`;
  };
  
  return (
    <tr className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-slate-100' : ''}`}>
      {/* Checkbox Column */}
      <td className="px-4 py-3">
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={onSelect}
          className="rounded border-slate-300 text-slate-600 focus:ring-slate-500" 
        />
      </td>

      {/* Title Column */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-xs">
              {getTaskIcon(task.title)}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-slate-900 truncate">
                {task.title}
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                #{task.task_id}
              </span>
            </div>
            {task.description && (
              <p className="text-sm text-slate-500 truncate mt-1">
                {task.description}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Status Column */}
      <td className="px-4 py-3">
        <div className="space-y-1">
          {getStatusBadge(task.status)}
          {isOverdue && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-medium">
              <Icon icon="heroicons:exclamation-triangle" className="w-3 h-3" />
              <span>Overdue</span>
            </div>
          )}
        </div>
      </td>

      {/* Priority Column */}
      <td className="px-4 py-3">
        {getPriorityBadge(task.priority)}
      </td>

      {/* Due Date Column */}
      <td className="px-4 py-3">
        <div className="space-y-1">
          <div className="text-sm font-medium text-slate-900">
            {formatDueDateForDisplay(task.due_date)}
          </div>
          <div className="text-xs text-slate-500">
            {formatDueTimeForDisplay(task.due_date)}
          </div>
          {getOverdueText() && (
            <div className="text-xs text-red-600 font-medium">
              {getOverdueText()}
            </div>
          )}
        </div>
      </td>

      {/* Progress Column */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-slate-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                getProgressPercentage() > 0 ? 'bg-slate-600' : 'bg-slate-200'
              }`}
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-slate-600 min-w-[3rem]">
            {getProgressPercentage()}%
          </span>
        </div>
      </td>

      {/* Actions Column */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {(task.status === 'pending' || task.status === 'Not Started') && (
            <button
              onClick={() => updateTaskStatus(task.task_id, 'In Progress')}
              disabled={updating}
              className="p-1.5 rounded hover:bg-slate-200 transition-colors text-slate-600 disabled:opacity-50"
              title="Start Task"
            >
              <Icon icon="heroicons:play" className="w-4 h-4" />
            </button>
          )}
          
          {canRequestExtension && (
            <button
              onClick={() => openExtensionModal(task)}
              className="p-1.5 rounded hover:bg-slate-200 transition-colors text-slate-600"
              title="Request Extension"
            >
              <Icon icon="heroicons:clock" className="w-4 h-4" />
            </button>
          )}

          {canComplete && (
            <button
              onClick={() => openCompletionModal(task)}
              className="p-1.5 rounded hover:bg-slate-200 transition-colors text-slate-600"
              title="Complete Task"
            >
              <Icon icon="heroicons:check" className="w-4 h-4" />
            </button>
          )}

          <button className="p-1.5 rounded hover:bg-slate-200 transition-colors text-slate-500">
            <Icon icon="heroicons:ellipsis-horizontal" className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default MyTasks; 