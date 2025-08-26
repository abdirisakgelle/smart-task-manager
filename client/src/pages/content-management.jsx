import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import { PlusIcon, MagnifyingGlassIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useGetContentQuery, useCreateContentMutation, useDeleteContentMutation, useGetAllEmployeesQuery, useGetIdeasQuery } from '@/store/api/apiSlice';

const ContentManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    idea_id: '',
    script_status: 'pending',
    content_status: 'in_progress',
    director_id: '',
    filming_date: '',
    filming_time: '',
    cast_and_presenters: [],
    notes: ''
  });

  // API hooks
  const { data: content = [], isLoading, error, refetch } = useGetContentQuery();
  const { data: employees = [], isLoading: employeesLoading, error: employeesError } = useGetAllEmployeesQuery();
  const { data: ideas = [], error: ideasError } = useGetIdeasQuery();
  const [createContent, { isLoading: isCreating }] = useCreateContentMutation();
  const [deleteContent, { isLoading: isDeleting }] = useDeleteContentMutation();

  // Filter employees by department for dynamic dropdowns
  const contentEmployees = employees.filter(emp => emp.department === 'Marcom' && emp.section === 'Digital Media' && emp.unit === 'Content Creator');
  const editorEmployees = employees.filter(emp => emp.department === 'Marcom' && emp.section === 'Digital Media' && emp.unit === 'Editor');
  const directorEmployees = employees.filter(emp => 
    emp.department === 'Marcom' && emp.section === 'Digital Media' && ['Content Creator', 'Editor', 'Social Media Specialist'].includes(emp.unit)
  );
  const castAndPresentersEmployees = employees.filter(emp => 
    emp.department === 'Marcom' && emp.section === 'Digital Media' && ['Content Creator', 'Editor', 'Social Media Specialist'].includes(emp.unit)
  );

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.idea_title && item.idea_title.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || item.script_status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Combine date and time into a single datetime string
      let filming_date = null;
      if (formData.filming_date && formData.filming_time) {
        // Store as simple datetime string to avoid timezone issues
        filming_date = `${formData.filming_date}T${formData.filming_time}`;
      } else if (formData.filming_date) {
        // If only date is provided, set time to end of day
        filming_date = `${formData.filming_date}T23:59`;
      }

      const submissionData = {
        ...formData,
        filming_date
      };

      await createContent(submissionData).unwrap();
      setFormData({
        idea_id: '',
        script_status: 'pending',
        content_status: 'in_progress',
        director_id: '',
        filming_date: '',
        filming_time: '',
        cast_and_presenters: [],
        notes: ''
      });
      setShowModal(false);
      refetch();
    } catch (error) {
      console.error('Failed to create content:', error);
    }
  };

  const handleIdeaChange = (ideaId) => {
    setFormData({
      ...formData,
      idea_id: ideaId
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await deleteContent(id).unwrap();
        refetch();
      } catch (error) {
        console.error('Failed to delete content:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      review: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return `px-2 py-1 rounded-full text-xs font-medium border ${statusClasses[status] || statusClasses.pending}`;
  };

  const getContentStatusBadge = (status) => {
    const statusClasses = {
      planning: 'bg-gray-100 text-gray-800 border-gray-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      filming: 'bg-orange-100 text-orange-800 border-orange-200',
      editing: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      published: 'bg-green-100 text-green-800 border-green-200'
    };
    return `px-2 py-1 rounded-full text-xs font-medium border ${statusClasses[status] || statusClasses.in_progress}`;
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
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      // Format as "Aug 24, 2:30 PM" for better readability
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }) + ', ' + date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.employee_id == employeeId);
    return employee ? employee.name : 'Unknown';
  };

  const getSelectedCastNames = () => {
    if (!formData.cast_and_presenters || formData.cast_and_presenters.length === 0) {
      return [];
    }
    return formData.cast_and_presenters.map(id => {
      const employee = employees.find(emp => emp.employee_id == id);
      return employee ? employee.name : 'Unknown';
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Content</div>
          <div className="text-gray-600">Failed to load content from database.</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600">Manage and track content production workflow</p>
          <p className="text-sm text-gray-500 mt-1">Total Content: {content.length} | Showing: {filteredContent.length}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <PlusIcon className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create New Content
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
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
            <option value="completed">Completed</option>
            <option value="review">Review</option>
          </select>
        </div>
      </Card>

      {/* Content Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Director
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filming Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cast & Presenters
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Script Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContent.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      {content.length === 0 ? (
                        <div>
                          <div className="text-lg font-semibold mb-2">No content available</div>
                          <div className="text-sm">Create new content to get started.</div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-lg font-semibold mb-2">No content found</div>
                          <div className="text-sm">Try adjusting your search or filters.</div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredContent.map((item) => (
                  <tr key={item.content_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-500">{item.notes}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getEmployeeName(item.director_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.filming_date ? formatDateTime(item.filming_date) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.cast_and_presenters || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(item.script_status)}>
                        {item.script_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getContentStatusBadge(item.content_status)}>
                        {item.content_status.replace('_', ' ')}
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
                          onClick={() => handleDelete(item.content_id)}
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

      {/* Modal for New Content */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl mx-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create New Content</h2>
              <p className="text-gray-600 mt-2">Enter content information to submit for production</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Original Idea & Director - Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Idea *
                  </label>
                  <select
                    required
                    value={formData.idea_id}
                    onChange={(e) => handleIdeaChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select Original Idea</option>
                    {ideas.map((idea) => (
                      <option key={idea.idea_id} value={idea.idea_id}>
                        {idea.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Director *
                  </label>
                  <select
                    required
                    value={formData.director_id}
                    onChange={(e) => setFormData({...formData, director_id: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    disabled={employeesLoading}
                  >
                    <option value="">Select Director</option>
                    {directorEmployees.map((emp) => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                  {directorEmployees.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">No employees available for Director role</p>
                  )}
                </div>
              </div>
              
              {/* Filming Date & Time - Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filming Date
                  </label>
                  <input
                    type="date"
                    value={formData.filming_date}
                    onChange={(e) => setFormData({...formData, filming_date: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filming Time
                  </label>
                  <input
                    type="time"
                    value={formData.filming_time}
                    onChange={(e) => setFormData({...formData, filming_time: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
              
              {/* Script Status & Content Status - Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Script Status
                  </label>
                  <select 
                    value={formData.script_status}
                    onChange={(e) => setFormData({...formData, script_status: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="review">Review</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content Status
                  </label>
                  <select 
                    value={formData.content_status}
                    onChange={(e) => setFormData({...formData, content_status: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  >
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="filming">Filming</option>
                    <option value="editing">Editing</option>
                    <option value="completed">Completed</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              
              {/* Cast & Presenters & Notes - Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cast & Presenters
                  </label>
                  <select
                    multiple
                    value={formData.cast_and_presenters}
                    onChange={(e) => {
                      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                      setFormData({...formData, cast_and_presenters: selectedOptions});
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors min-h-[80px] resize-none"
                  >
                    <option value="" disabled>Select Cast & Presenters</option>
                    {castAndPresentersEmployees.map((emp) => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                  {castAndPresentersEmployees.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">No employees available for cast & presenters</p>
                  )}
                  
                  {/* Show selected cast members */}
                  {formData.cast_and_presenters.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 mb-1">Selected:</p>
                      <div className="flex flex-wrap gap-1">
                        {getSelectedCastNames().map((name, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows="4"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Add production notes..."
                  />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-5 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium shadow-sm"
                >
                  {isCreating ? 'Creating...' : 'Create Content'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement; 