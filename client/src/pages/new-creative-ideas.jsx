import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import { PlusIcon, MagnifyingGlassIcon, EyeIcon, PencilIcon, TrashIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useGetIdeasQuery, useCreateIdeaMutation, useDeleteIdeaMutation, useGetAllEmployeesQuery } from '@/store/api/apiSlice';

const NewCreativeIdeas = () => {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    contributor_id: '',
    script_writer_id: '',
    script_deadline_date: '',
    script_deadline_time: '',
    priority: 'medium',
    status: 'bank',
    notes: ''
  });

  // API hooks - using real database data only
  const { data: ideas = [], isLoading, error, refetch } = useGetIdeasQuery();
  const { data: employees = [], isLoading: employeesLoading, error: employeesError } = useGetAllEmployeesQuery();
  const [createIdea, { isLoading: isCreating }] = useCreateIdeaMutation();
  const [deleteIdea, { isLoading: isDeleting }] = useDeleteIdeaMutation();

  // Filter employees by department for dynamic dropdowns
  const contentEmployees = employees.filter(emp => emp.department === 'Marcom' && emp.section === 'Digital Media' && emp.unit === 'Content Creator');
  const editorEmployees = employees.filter(emp => emp.department === 'Marcom' && emp.section === 'Digital Media' && emp.unit === 'Editor');
  const contributorEmployees = employees.filter(emp => 
    emp.department === 'Marcom' && emp.section === 'Digital Media' && ['Content Creator', 'Editor', 'Social Media Specialist'].includes(emp.unit)
  );
  const scriptWriterEmployees = employees.filter(emp => 
    emp.department === 'Marcom' && emp.section === 'Digital Media' && ['Content Creator', 'Editor', 'Social Media Specialist'].includes(emp.unit)
  );
  const castAndPresentersEmployees = employees.filter(emp => 
    emp.department === 'Marcom' && emp.section === 'Digital Media' && ['Content Creator', 'Editor', 'Social Media Specialist'].includes(emp.unit)
  );

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (idea.contributor_name && idea.contributor_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || idea.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || idea.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleViewIdea = (idea) => {
    setSelectedIdea(idea);
    setShowViewModal(true);
  };

  const getEmployeeWithRole = (employeeId) => {
    const employee = employees.find(emp => emp.employee_id === employeeId);
    if (!employee) return { name: 'Unknown', unit: 'Unknown' };
    return { name: employee.name, unit: employee.unit };
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Combine date and time into a single datetime string
      let script_deadline = null;
      if (formData.script_deadline_date && formData.script_deadline_time) {
        // Create a proper datetime string for MySQL DATETIME field
        const dateTimeStr = `${formData.script_deadline_date}T${formData.script_deadline_time}`;
        script_deadline = dateTimeStr;
      } else if (formData.script_deadline_date) {
        // If only date is provided, set time to end of day
        script_deadline = `${formData.script_deadline_date}T23:59:59`;
      }

      const submissionData = {
        ...formData,
        script_deadline
      };

      await createIdea(submissionData).unwrap();
      setFormData({
        title: '',
        contributor_id: '',
        script_writer_id: '',
        script_deadline_date: '',
        script_deadline_time: '',
        priority: 'medium',
        status: 'bank',
        notes: ''
      });
      setShowModal(false);
      refetch();
    } catch (error) {
      console.error('Failed to create idea:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this idea?')) {
      try {
        await deleteIdea(id).unwrap();
        refetch();
      } catch (error) {
        console.error('Failed to delete idea:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      production: 'bg-green-100 text-green-800 border-green-200',
      bank: 'bg-gray-100 text-gray-800 border-gray-200',
      approved: 'bg-blue-100 text-blue-800 border-blue-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    return `px-2 py-1 rounded-full text-xs font-medium border ${statusClasses[status] || statusClasses.bank}`;
  };

  const getPriorityBadge = (priority) => {
    const priorityClasses = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return `px-2 py-1 rounded-full text-xs font-medium border ${priorityClasses[priority] || priorityClasses.medium}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    
    // Parse the date string (now properly stored as DATETIME in database)
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Format date and time separately for better control
    const dateStr = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    return `${dateStr}, ${timeStr}`;
  };

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Ideas</div>
          <div className="text-gray-600">Failed to load ideas from database. Please try refreshing the page.</div>
          <button 
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading state
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
          <h1 className="text-2xl font-bold text-gray-900">New Creative Ideas</h1>
          <p className="text-gray-600">Manage and track creative content proposals</p>
          <p className="text-sm text-gray-500 mt-1">Total Ideas: {ideas.length} | Showing: {filteredIdeas.length}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Submit New Idea
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
              placeholder="Search ideas..."
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
            <option value="production">Production</option>
            <option value="bank">Bank</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </Card>

      {/* Ideas Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contributor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Script Writer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIdeas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      {ideas.length === 0 ? (
                        <div>
                          <div className="text-lg font-semibold mb-2">No ideas available</div>
                          <div className="text-sm">Submit a new idea to get started.</div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-lg font-semibold mb-2">No ideas found</div>
                          <div className="text-sm">Try adjusting your search or filters.</div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredIdeas.map((idea) => {
                  const contributor = getEmployeeWithRole(idea.contributor_id);
                  const scriptWriter = getEmployeeWithRole(idea.script_writer_id);
                  
                  return (
                    <tr key={idea.idea_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{idea.title}</div>
                        <div className="text-sm text-gray-500">{idea.notes}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {contributor.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {scriptWriter.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {idea.script_deadline ? formatDateTime(idea.script_deadline) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getPriorityBadge(idea.priority)}>
                          {idea.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(idea.status)}>
                          {idea.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewIdea(idea)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button className="text-yellow-600 hover:text-yellow-900">
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button 
                             onClick={() => handleDelete(idea.idea_id)}
                             disabled={isDeleting}
                             className="text-red-600 hover:text-red-900 disabled:opacity-50"
                           >
                             <TrashIcon className="w-5 h-5" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Idea Modal */}
      {showViewModal && selectedIdea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">View Idea Details</h2>
                <p className="text-sm text-gray-600 mt-1">Read-only view of idea information</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📌 Title
                </label>
                <div className="text-lg font-semibold text-gray-900">{selectedIdea.title}</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🗓️ Submitted
                  </label>
                  <div className="text-sm text-gray-900">{formatDate(selectedIdea.submission_date)}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📊 Status
                  </label>
                  <span className={getStatusBadge(selectedIdea.status)}>
                    {selectedIdea.status}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🔵 Priority
                  </label>
                  <span className={getPriorityBadge(selectedIdea.priority)}>
                    {selectedIdea.priority}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📅 Deadline
                  </label>
                  <div className="text-sm text-gray-900">
                    {selectedIdea.script_deadline ? formatDateTime(selectedIdea.script_deadline) : 'Not set'}
                  </div>
                </div>
              </div>
              
                              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    👤 Contributor
                  </label>
                  <div className="text-sm text-gray-900">
                    {getEmployeeWithRole(selectedIdea.contributor_id).name}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ✍️ Script Writer
                  </label>
                  <div className="text-sm text-gray-900">
                    {getEmployeeWithRole(selectedIdea.script_writer_id).name}
                  </div>
                </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📝 Notes
                </label>
                <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {selectedIdea.notes || 'No notes provided'}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for New Idea */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl mx-4">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Submit New Idea</h2>
              <p className="text-gray-600 mt-2">Enter idea information to submit for review</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Title - Full Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  placeholder="Enter idea title"
                />
              </div>
              
              {/* Contributor & Script Writer - Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contributor *
                  </label>
                  <select
                    required
                    value={formData.contributor_id}
                    onChange={(e) => setFormData({...formData, contributor_id: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    disabled={employeesLoading}
                  >
                    <option value="">Select Contributor</option>
                    {contributorEmployees.map((emp) => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                  {contributorEmployees.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">No employees available for Contributor role</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Script Writer *
                  </label>
                  <select
                    required
                    value={formData.script_writer_id}
                    onChange={(e) => setFormData({...formData, script_writer_id: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    disabled={employeesLoading}
                  >
                    <option value="">Select Script Writer</option>
                    {scriptWriterEmployees.map((emp) => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                  {scriptWriterEmployees.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">No employees available for Script Writer role</p>
                    )}
                  </div>
                </div>
                
              {/* Script Deadline Date & Time - Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Script Deadline Date
                  </label>
                  <input
                    type="date"
                    value={formData.script_deadline_date}
                    onChange={(e) => setFormData({...formData, script_deadline_date: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Script Deadline Time
                  </label>
                  <input
                    type="time"
                    value={formData.script_deadline_time}
                    onChange={(e) => setFormData({...formData, script_deadline_time: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
              
              {/* Priority Level & Initial Status - Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority Level
                  </label>
                  <select 
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  >
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Status
                  </label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  >
                    <option value="bank">Bank</option>
                    <option value="production">Production</option>
                  </select>
                </div>
              </div>
              
              {/* Idea Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="4"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Describe your creative idea in detail..."
                />
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
                  {isCreating ? 'Submitting...' : 'Submit Idea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewCreativeIdeas; 