import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import { useGetIdeasQuery, useCreateIdeaMutation, useGetContentEmployeesQuery } from '@/store/api/apiSlice';
import { EyeIcon, PencilIcon, TrashIcon, PlusIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const priorities = [
  { value: '', label: 'All' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];
const statuses = [
  { value: '', label: 'All' },
  { value: 'bank', label: 'Bank' },
  { value: 'production', label: 'Production' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const PAGE_SIZE = 8;

// Move Modal component outside to prevent re-creation on every render
const Modal = ({ show, onClose, children }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-0 relative animate-fadeIn">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        {children}
      </div>
    </div>
  );
};

// Badge style helpers for status and priority
const statusBadgeClass = (status) => {
  if (status === 'production') return 'bg-green-100 text-green-700 border border-green-200';
  if (status === 'bank') return 'bg-gray-100 text-gray-700 border border-gray-200';
  if (status === 'approved') return 'bg-blue-100 text-blue-700 border border-blue-200';
  if (status === 'rejected') return 'bg-red-100 text-red-700 border border-red-200';
  return 'bg-gray-100 text-gray-700 border border-gray-200';
};
const priorityBadgeClass = (priority) => {
  if (priority === 'high') return 'bg-red-100 text-red-700 border border-red-200';
  if (priority === 'medium') return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
  if (priority === 'low') return 'bg-blue-100 text-blue-700 border border-blue-200';
  return 'bg-gray-100 text-gray-700 border border-gray-200';
};

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const NewCreativeIdeas = () => {
  // Modal state
  const [showModal, setShowModal] = useState(false);
  // Form state
  const [form, setForm] = useState({
    title: '',
    notes: '',
    contributor_id: '',
    script_writer_id: '',
    script_deadline: '',
    priority: 'medium',
    status: 'bank',
  });
  const [formError, setFormError] = useState('');
  const [createIdea, { isLoading: isCreating }] = useCreateIdeaMutation();
  const { data: ideas = [], isLoading, refetch } = useGetIdeasQuery();
  const { data: employees = [], isLoading: isLoadingEmployees } = useGetContentEmployeesQuery();

  // Filter/search state
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({
    contributor: '',
    script_writer: '',
    priority: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });
  // Pagination state
  const [page, setPage] = useState(1);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  // Handle filter input
  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
    setPage(1);
  };
  // Handle search
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };
  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.title || !form.contributor_id || !form.script_writer_id) {
      setFormError('Title, Contributor, and Script Writer are required.');
      return;
    }
    try {
      await createIdea({
        ...form,
        submission_date: new Date().toISOString().slice(0, 10),
      }).unwrap();
      setForm({ title: '', notes: '', contributor_id: '', script_writer_id: '', script_deadline: '', priority: 'medium', status: 'bank' });
      setShowModal(false);
      refetch();
    } catch (err) {
      setFormError('Failed to submit idea.');
    }
  };

  // Filtered ideas
  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch = search ? idea.title.toLowerCase().includes(search.toLowerCase()) : true;
    const matchesContributor = filter.contributor ? String(idea.contributor_id) === filter.contributor : true;
    const matchesScriptWriter = filter.script_writer ? String(idea.script_writer_id) === filter.script_writer : true;
    const matchesPriority = filter.priority ? idea.priority === filter.priority : true;
    const matchesStatus = filter.status ? idea.status === filter.status : true;
    const matchesDateFrom = filter.dateFrom ? new Date(idea.script_deadline) >= new Date(filter.dateFrom) : true;
    const matchesDateTo = filter.dateTo ? new Date(idea.script_deadline) <= new Date(filter.dateTo) : true;
    return matchesSearch && matchesContributor && matchesScriptWriter && matchesPriority && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredIdeas.length / PAGE_SIZE) || 1;
  const paginatedIdeas = filteredIdeas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Action handlers (stubbed)
  const handleView = (idea) => {
    alert(`View idea: ${idea.title}`);
  };
  const handleEdit = (idea) => {
    alert(`Edit idea: ${idea.title}`);
  };
  const handleDelete = (idea) => {
    if (window.confirm('Are you sure you want to delete this idea?')) {
      // Implement delete logic here
      alert('Delete not implemented.');
    }
  };

  // Helper to get employee name by ID
  const getEmployeeName = (id) => {
    const emp = employees.find(e => String(e.employee_id) === String(id));
    return emp ? emp.name : id;
  };

  const statusOptions = [
    { value: 'bank', label: 'Bank' },
    { value: 'production', label: 'Production' },
  ];

  // Responsive layout: full width card, header, filters, table, pagination
  return (
    <div className="w-full px-6 space-y-4">
      {/* Top Card: Search & Filters */}
      <div className="bg-white shadow rounded-lg p-6 w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#D2232A]">New Creative Ideas</h2>
            <p className="text-gray-600 text-sm">Manage content proposals and track development status</p>
          </div>
          <button
            className="btn bg-[#D2232A] hover:bg-[#b71c1c] text-white font-semibold flex items-center gap-2 h-10 px-4 rounded"
            onClick={() => setShowModal(true)}
          >
            <PlusIcon className="w-5 h-5" /> Submit New Idea
          </button>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4 w-full">
          {/* Search bar */}
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search ideas..."
            className="input input-bordered h-10 text-sm w-full md:w-48"
          />
          {/* Filters */}
          <select
            name="contributor"
            value={filter.contributor}
            onChange={handleFilterChange}
            className="input input-bordered h-10 text-sm w-full md:w-36"
          >
            <option value="">All Contributors</option>
            {[...new Set(ideas.map(i => i.contributor_id))].filter(Boolean).map(id => (
              <option key={id} value={id}>{getEmployeeName(id)}</option>
            ))}
          </select>
          <select
            name="script_writer"
            value={filter.script_writer}
            onChange={handleFilterChange}
            className="input input-bordered h-10 text-sm w-full md:w-36"
          >
            <option value="">All Script Writers</option>
            {[...new Set(ideas.map(i => i.script_writer_id))].filter(Boolean).map(id => (
              <option key={id} value={id}>{getEmployeeName(id)}</option>
            ))}
          </select>
          <select
            name="priority"
            value={filter.priority}
            onChange={handleFilterChange}
            className="input input-bordered h-10 text-sm w-full md:w-28"
          >
            {priorities.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <select
            name="status"
            value={filter.status}
            onChange={handleFilterChange}
            className="input input-bordered h-10 text-sm w-full md:w-32"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {/* Date range picker */}
          <input
            type="date"
            name="dateFrom"
            value={filter.dateFrom}
            onChange={handleFilterChange}
            className="input input-bordered h-10 text-sm w-full md:w-32"
            placeholder="From"
          />
          <input
            type="date"
            name="dateTo"
            value={filter.dateTo}
            onChange={handleFilterChange}
            className="input input-bordered h-10 text-sm w-full md:w-32"
            placeholder="To"
          />
        </div>
      </div>
      {/* Bottom Card: Ideas Table */}
      <div className="bg-white shadow rounded-lg p-6 w-full">
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="px-4 py-3 border-b font-semibold text-left">Title</th>
                <th className="px-4 py-3 border-b font-semibold text-left">Contributor</th>
                <th className="px-4 py-3 border-b font-semibold text-left">Script Writer</th>
                <th className="px-4 py-3 border-b font-semibold text-left">Deadline</th>
                <th className="px-4 py-3 border-b font-semibold text-left">Priority</th>
                <th className="px-4 py-3 border-b font-semibold text-left">Status</th>
                <th className="px-4 py-3 border-b font-semibold text-left">Notes</th>
                <th className="px-4 py-3 border-b font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-6 text-gray-400">Loading...</td></tr>
              ) : paginatedIdeas.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-6 text-gray-400">No ideas found.</td></tr>
              ) : (
                paginatedIdeas.map((idea) => (
                  <tr key={idea.idea_id} className="border-b hover:bg-gray-50 transition-all">
                    <td className="px-4 py-3 align-middle border-b text-sm font-medium text-gray-900">{idea.title}</td>
                    <td className="px-4 py-3 align-middle border-b text-sm">{getEmployeeName(idea.contributor_id)}</td>
                    <td className="px-4 py-3 align-middle border-b text-sm">{getEmployeeName(idea.script_writer_id)}</td>
                    <td className="px-4 py-3 align-middle border-b text-sm">{formatDate(idea.script_deadline)}</td>
                    <td className="px-4 py-3 align-middle border-b text-sm">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${priorityBadgeClass(idea.priority)}`}>{idea.priority}</span>
                    </td>
                    <td className="px-4 py-3 align-middle border-b text-sm">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(idea.status)}`}>{idea.status}</span>
                    </td>
                    <td className="px-4 py-3 align-middle border-b text-sm">{idea.notes}</td>
                    <td className="px-4 py-3 align-middle border-b text-center text-lg">
                      <button className="text-blue-500 hover:text-blue-700 mx-1" title="View">
                        <EyeIcon className="w-5 h-5 inline align-middle" />
                      </button>
                      <button className="text-yellow-500 hover:text-yellow-700 mx-1" title="Edit">
                        <PencilIcon className="w-5 h-5 inline align-middle" />
                      </button>
                      <button className="text-red-500 hover:text-red-700 mx-1" title="Delete">
                        <TrashIcon className="w-5 h-5 inline align-middle" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex flex-col md:flex-row justify-between items-center px-6 pb-6 gap-2">
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sm btn-outline flex items-center"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeftIcon className="w-4 h-4" /> Previous
            </button>
            <button
              className="btn btn-sm btn-outline flex items-center"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {/* Modal for New Idea Form */}
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-1">Submit New Idea</h2>
          <p className="text-gray-500 mb-6">Enter idea information</p>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Title *</label>
              <input name="title" value={form.title} onChange={handleChange} className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-200" required placeholder="Enter idea title" />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Contributor *</label>
              <select
                name="contributor_id"
                value={form.contributor_id}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-200"
                required
              >
                <option value="">Select Contributor</option>
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Script Writer *</label>
              <select
                name="script_writer_id"
                value={form.script_writer_id}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-200"
                required
              >
                <option value="">Select Script Writer</option>
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Script Deadline</label>
              <input type="date" name="script_deadline" value={form.script_deadline} onChange={handleChange} className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-200" placeholder="dd/mm/yyyy" />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-200">
                {priorities.slice(1).map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-200">
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-1">Notes / Description</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-200" rows={3} placeholder="Describe the idea in detail..." />
            </div>
            {formError && <div className="md:col-span-2 text-red-600 text-sm mt-2">{formError}</div>}
            <div className="md:col-span-2 flex justify-end gap-4 mt-2">
              <button type="button" className="text-gray-700 hover:underline" onClick={() => setShowModal(false)} disabled={isCreating}>Cancel</button>
              <button type="submit" className="bg-[#D2232A] text-white font-semibold rounded-lg px-6 py-2 hover:bg-[#b71c1c] transition-colors" disabled={isCreating}>Submit Idea</button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default NewCreativeIdeas; 