import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import { PlusIcon, MagnifyingGlassIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useGetProductionQuery, useCreateProductionMutation, useDeleteProductionMutation, useGetProductionEmployeesQuery, useGetContentQuery } from '@/store/api/apiSlice';

const ProductionWorkflow = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    content_id: '',
    editor_id: '',
    production_status: 'pending',
    completion_date: '',
        completion_time: '',
    completion_time: '',
    sent_to_social_team: false,
    notes: ''
  });

  // API hooks
  const { data: production = [], isLoading, error, refetch } = useGetProductionQuery();
  const { data: employees = [] } = useGetProductionEmployeesQuery();
  const { data: content = [] } = useGetContentQuery();
  const [createProduction, { isLoading: isCreating }] = useCreateProductionMutation();
  const [deleteProduction, { isLoading: isDeleting }] = useDeleteProductionMutation();

  const filteredProduction = production.filter(item => {
    const matchesSearch = (item.content_title && item.content_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (item.editor_name && item.editor_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || item.production_status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Combine date and time into a single datetime string
      let completion_date = null;
      if (formData.completion_date && formData.completion_time) {
        completion_date = `${formData.completion_date}T${formData.completion_time}`;
      } else if (formData.completion_date) {
        // If only date is provided, set time to end of day
        completion_date = `${formData.completion_date}T23:59`;
      }

      const submissionData = {
        ...formData,
        completion_date
      };

      await createProduction(submissionData).unwrap();
      setFormData({
        content_id: '',
        editor_id: '',
        production_status: 'pending',
        completion_date: '',
        completion_time: '',
        sent_to_social_team: false,
        notes: ''
      });
      setShowModal(false);
      refetch();
    } catch (error) {
      console.error('Failed to create production:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this production record?')) {
      try {
        await deleteProduction(id).unwrap();
        refetch();
      } catch (error) {
        console.error('Failed to delete production:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      editing: 'bg-purple-100 text-purple-800 border-purple-200',
      review: 'bg-orange-100 text-orange-800 border-orange-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      approved: 'bg-green-100 text-green-800 border-green-200'
    };
    return `px-2 py-1 rounded-full text-xs font-medium border ${statusClasses[status] || statusClasses.pending}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold mb-2">Error Loading Production</div>
          <div className="text-gray-600 mb-4">Failed to load production data. Please check your connection.</div>
          <button 
            onClick={() => refetch()} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Workflow</h1>
          <p className="text-gray-600">Manage and track video production workflow</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create New Production
        </button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search production..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="editing">Editing</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </Card>

      {/* Production Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Editor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Production Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Social Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProduction.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No production records found
                  </td>
                </tr>
              ) : (
                filteredProduction.map((item) => (
                  <tr key={item.production_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.content_title || 'Unknown Content'}</div>
                      <div className="text-sm text-gray-500">{item.notes}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.editor_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(item.production_status)}>
                        {item.production_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(item.completion_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        item.sent_to_social_team 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {item.sent_to_social_team ? 'Sent' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button className="text-yellow-600 hover:text-yellow-900">
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.production_id)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal for New Production */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create New Production</h2>
              <p className="text-sm text-gray-600 mt-1">Enter Production Information</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content *
                  </label>
                  <select
                    required
                    value={formData.content_id}
                    onChange={(e) => setFormData({...formData, content_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select Content</option>
                    {content.map((item) => (
                      <option key={item.content_id} value={item.content_id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Editor *
                  </label>
                  <select
                    required
                    value={formData.editor_id}
                    onChange={(e) => setFormData({...formData, editor_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select Editor</option>
                    {employees.map((emp) => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Production Status
                  </label>
                  <select 
                    value={formData.production_status}
                    onChange={(e) => setFormData({...formData, production_status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="editing">Editing</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Completion Date
                  </label>
                  <input
                    type="date"
                    value={formData.completion_date}
                    onChange={(e) => setFormData({...formData, completion_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Completion Time
                  </label>
                  <input
                    type="time"
                    value={formData.completion_time}
                    onChange={(e) => setFormData({...formData, completion_time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.sent_to_social_team}
                      onChange={(e) => setFormData({...formData, sent_to_social_team: e.target.checked})}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Sent to Social Media Team</span>
                  </label>
                </div>
              </div>
              
              {/* Full Width Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows="4"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Add production notes..."
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Production'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionWorkflow; 