import React, { useEffect, useState, useMemo, useRef } from "react";
import Card from "@/components/ui/Card";
import { useTable, useSortBy, usePagination } from "react-table";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/Icon";
import { useSelector } from "react-redux";

const NewTicketsPage = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("all"); // "all", "reopened", "active"
  const issueTypeOptions = {
    App: [
      { value: 'Streaming', label: 'Streaming' },
      { value: 'VOD', label: 'VOD' },
      { value: 'OTP', label: 'OTP' },
      { value: 'App', label: 'App' },
      { value: 'Other', label: 'Other' },
    ],
    IPTV: [
      { value: 'Subscription Issue', label: 'Subscription Issue' },
      { value: 'Dark Channels / Black Screen', label: 'Dark Channels / Black Screen' },
      { value: 'Channel Not Loading', label: 'Channel Not Loading' },
      { value: 'VOD', label: 'VOD' },
      { value: 'Streaming', label: 'Streaming' },
    ],
  };
  const issueCategories = [
    { value: 'App', label: 'App' },
    { value: 'IPTV', label: 'IPTV' },
  ];
  const [form, setForm] = useState({
    customer_phone: "",
    communication_channel: "",
    device_type: "",
    issue_category: "App",
    issue_type: "",
    resolution_status: "Pending",
    issue_description: "",
    first_call_resolution: false,
  });
  const [formError, setFormError] = useState("");
  const formRef = useRef();
  const [viewTicket, setViewTicket] = useState(null);
  const [editTicket, setEditTicket] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, viewMode]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      let url = "/api/tickets";
      
      if (viewMode === "reopened") {
        url = "/api/follow-ups/reopened";
      } else if (viewMode === "active") {
        // For active tickets, we'll fetch all and filter on frontend
        url = "/api/tickets";
      } else if (statusFilter !== "all") {
        url = `/api/tickets/resolution-status/${statusFilter}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch tickets");
      let data = await response.json();
      
      // Filter for active tickets if needed
      if (viewMode === "active") {
        data = data.filter(ticket => 
          ['Pending', 'In Progress', 'Reopened'].includes(ticket.resolution_status)
        );
      }
      
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ticket_id) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      const response = await fetch(`/api/tickets/${ticket_id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete ticket");
      setTickets((prev) => prev.filter((t) => t.ticket_id !== ticket_id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    // If the user changes the status away from 'Done', clear FCR
    if (name === 'resolution_status' && value !== 'Done') {
      setForm((prev) => ({
        ...prev,
        [name]: value,
        first_call_resolution: false,
      }));
      return;
    }
    // If issue_category changes, reset issue_type
    if (name === 'issue_category') {
      setForm((prev) => ({
        ...prev,
        issue_category: value,
        issue_type: '',
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setFormError("");
    // Basic validation
    if (!form.customer_phone || !form.communication_channel || !form.issue_category || !form.issue_type || !form.issue_description) {
      setFormError("Please fill all required fields.");
      return;
    }
    setCreating(true);
    try {
      const payload = {
        ...form,
        agent_id: currentUser.employee_id, // Use employee_id for agent_id
        device_type: form.device_type || null,
      };
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("Failed to create ticket. " + errorText);
      }
      setShowModal(false);
      setForm({
        customer_phone: "",
        communication_channel: "",
        device_type: "",
        issue_category: "App",
        issue_type: "",
        resolution_status: "Pending",
        issue_description: "",
        first_call_resolution: false,
      });
      await fetchTickets();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleView = (ticket) => setViewTicket(ticket);
  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
  const handleEdit = (ticket) => {
    setEditTicket({
      ...ticket,
      communication_channel: ticket.communication_channel || '',
      device_type: ticket.device_type || '',
      issue_type: capitalize(ticket.issue_type) || '',
      resolution_status: ticket.resolution_status || 'Pending',
      agent_id: ticket.agent_id || '',
      first_call_resolution: !!ticket.first_call_resolution,
      customer_phone: ticket.customer_phone || '',
      issue_description: ticket.issue_description || '',
    });
  };
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'issue_category') {
      setEditTicket((prev) => ({
        ...prev,
        issue_category: value,
        issue_type: '',
      }));
      return;
    }
    setEditTicket((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editTicket,
        agent_id: currentUser.employee_id || editTicket.agent_id,
        device_type: editTicket.device_type || null,
      };
      const response = await fetch(`/api/tickets/${editTicket.ticket_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update ticket");
      setEditTicket(null);
      await fetchTickets();
    } catch (err) {
      alert(err.message);
    }
  };

  const COLUMNS = [
    { Header: "Ticket ID", accessor: "ticket_id", Cell: ({ value }) => `#${String(value).padStart(4, '0')}` },
    { Header: "Date", accessor: "created_at", Cell: ({ value }) => value ? new Date(value).toLocaleDateString('en-CA') : '' },
    { Header: "Customer Phone", accessor: "customer_phone" },
    { Header: "Channel", accessor: "communication_channel" },
    { Header: "Issue Type", accessor: "issue_type" },
    { Header: "Status", accessor: "resolution_status", Cell: ({ value }) => {
      const getStatusBadge = (status) => {
        switch (status) {
          case 'Done':
            return <span className="badge bg-green-100 text-green-700">{status}</span>;
          case 'In Progress':
            return <span className="badge bg-yellow-100 text-yellow-700">{status}</span>;
          case 'Reopened':
            return <span className="badge bg-orange-100 text-orange-700">{status}</span>;
          case 'Escalated':
            return <span className="badge bg-red-100 text-red-700">{status}</span>;
          default:
            return <span className="badge bg-gray-100 text-gray-700">{status}</span>;
        }
      };
      return getStatusBadge(value);
    }},
    { Header: "FCR", accessor: "first_call_resolution", Cell: ({ value }) => value ? "Yes" : "No" },
    { Header: "Ticket State", accessor: "ticket_state", disableSortBy: true, Cell: ({ row }) => {
      const isClosed = row.original.end_time !== null && row.original.end_time !== undefined;
      const stateLabel = isClosed ? 'Closed' : 'Open';
      const stateClass = isClosed 
        ? 'bg-green-100 text-green-700' 
        : 'bg-red-100 text-red-700';
      const handleClose = async () => {
        if (isClosed) return;
        if (row.original.resolution_status !== 'Done') {
          alert('You can only close tickets with status "Done".');
          return;
        }
        if (!window.confirm('Are you sure you want to close this ticket?')) return;
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const formatted =
          now.getFullYear() + '-' +
          pad(now.getMonth() + 1) + '-' +
          pad(now.getDate()) + ' ' +
          pad(now.getHours()) + ':' +
          pad(now.getMinutes()) + ':' +
          pad(now.getSeconds());
        const { ticket_id, customer_phone, communication_channel, device_type, issue_category, issue_type, issue_description, agent_id, first_call_resolution, resolution_status, created_at } = row.original;
        // Calculate AHT in seconds
        let fcrValue = first_call_resolution;
        if (created_at) {
          const createdDate = new Date(created_at);
          const diffSeconds = (now - createdDate) / 1000;
          if (diffSeconds > 60) {
            fcrValue = false;
          }
        }
        const payload = {
          customer_phone,
          communication_channel,
          device_type,
          issue_category, // Ensure this is included
          issue_type,
          issue_description,
          agent_id,
          first_call_resolution: fcrValue,
          resolution_status,
          end_time: formatted
        };
        try {
          const response = await fetch(`/api/tickets/${ticket_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error('Failed to close ticket. ' + errorText);
          }
          await fetchTickets();
        } catch (err) {
          alert(err.message);
        }
      };
      return (
        <button
          className={`px-2 py-1 rounded-full text-sm font-medium ${stateClass} ${!isClosed ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
          disabled={isClosed}
          onClick={handleClose}
        >
          {stateLabel}
        </button>
      );
    } },
    {
      Header: "Actions",
      Cell: ({ row }) => (
        <div className="flex space-x-2">
          <button className="btn btn-xs btn-outline" title="View" onClick={() => handleView(row.original)}>
            <Icon icon="ph:eye" className="text-blue-500 text-lg" />
          </button>
          <button className="btn btn-xs btn-outline" title="Edit" onClick={() => handleEdit(row.original)}>
            <Icon icon="ph:pencil-simple" className="text-yellow-500 text-lg" />
          </button>
          <button className="btn btn-xs btn-outline" title="Delete" onClick={() => handleDelete(row.original.ticket_id)}>
            <Icon icon="ph:trash" className="text-red-500 text-lg" />
          </button>
        </div>
      ),
    },
  ];

  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => tickets, [tickets]);
  const tableInstance = useTable({ columns, data, initialState: { pageSize: 10 } }, useSortBy, usePagination);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    state,
    gotoPage,
    pageCount,
    setPageSize,
    prepareRow,
  } = tableInstance;

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">New Tickets</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage customer support tickets and track their resolution status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="input input-sm"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
            <option value="Reopened">Reopened</option>
          </select>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            Create New Ticket
          </button>
        </div>
      </div>
      {/* Notification for reopened tickets */}
      {viewMode === "all" && tickets.some(t => t.resolution_status === "Reopened") && (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center">
            <Icon icon="ph:warning" className="text-orange-500 text-xl mr-3" />
            <div>
              <h3 className="font-medium text-orange-800">Reopened Tickets Require Attention</h3>
              <p className="text-sm text-orange-700">
                You have {tickets.filter(t => t.resolution_status === "Reopened").length} reopened ticket(s) that need your attention. 
                <button 
                  className="ml-2 text-orange-600 underline hover:text-orange-800"
                  onClick={() => setViewMode("reopened")}
                >
                  View reopened tickets
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Modal for Create New Ticket */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto py-8 px-4">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <Icon icon="heroicons-outline:ticket" className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="text-xl font-medium text-slate-900">Create New Ticket</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Enter Ticket Information</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-500 transition-colors"
              >
                <Icon icon="heroicons:x-mark" className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form ref={formRef} onSubmit={handleCreateTicket} className="px-6 pb-6">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="customer_phone"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      placeholder="Enter phone number"
                      value={form.customer_phone}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Communication Channel
                    </label>
                    <select
                      name="communication_channel"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      value={form.communication_channel}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Select channel</option>
                      <option value="Phone">Phone</option>
                      <option value="Email">Email</option>
                      <option value="Chat">Chat</option>
                      <option value="Social Media">Social Media</option>
                      <option value="In Person">In Person</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Device Type
                    </label>
                    <select
                      name="device_type"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      value={form.device_type}
                      onChange={handleFormChange}
                    >
                      <option value="">Select device</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Laptop">Laptop</option>
                      <option value="Tablet">Tablet</option>
                      <option value="Desktop">Desktop</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Issue Category
                    </label>
                    <select
                      name="issue_category"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      value={form.issue_category}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Select category</option>
                      {issueCategories.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Issue Type
                    </label>
                    <select
                      name="issue_type"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      value={form.issue_type}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Select type</option>
                      {form.issue_category && issueTypeOptions[form.issue_category].map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Status
                    </label>
                    <select
                      name="resolution_status"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      value={form.resolution_status}
                      onChange={handleFormChange}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    Issue Description
                  </label>
                  <textarea
                    name="issue_description"
                    rows="3"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                    placeholder="Describe the issue in detail..."
                    value={form.issue_description}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                {form.resolution_status === 'Done' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="fcr"
                      name="first_call_resolution"
                      checked={form.first_call_resolution}
                      onChange={handleFormChange}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="fcr" className="text-sm text-slate-600">
                      First Call Resolution (FCR)
                    </label>
                  </div>
                )}

                {formError && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                    <Icon icon="heroicons:exclamation-circle" className="w-5 h-5 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-primary/20 transition-colors min-w-[100px] flex items-center justify-center"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <Icon icon="heroicons:arrow-path" className="w-4 h-4 animate-spin mr-2" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    'Create Ticket'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table {...getTableProps()} className="min-w-full table-auto border">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())} className="px-3 py-2 border-b bg-gray-50 text-left">
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} className="px-3 py-2 border-b">
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex justify-between items-center mt-2">
          <button onClick={() => previousPage()} disabled={!canPreviousPage} className="btn btn-sm">
            Previous
          </button>
          <span>
            Page {state.pageIndex + 1} of {pageOptions.length}
          </span>
          <button onClick={() => nextPage()} disabled={!canNextPage} className="btn btn-sm">
            Next
          </button>
        </div>
      </div>
      {/* View Ticket Modal */}
      {viewTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setViewTicket(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold mb-4">Ticket Details</h2>
            <div className="space-y-3">
              <div><b>Ticket ID:</b> #{String(viewTicket.ticket_id).padStart(4, '0')}</div>
              <div><b>Date:</b> {viewTicket.created_at ? new Date(viewTicket.created_at).toLocaleString() : ''}</div>
              <div><b>Customer Phone:</b> {viewTicket.customer_phone}</div>
              <div><b>Channel:</b> {viewTicket.communication_channel}</div>
              <div><b>Device Type:</b> {viewTicket.device_type}</div>
              <div><b>Issue Type:</b> {viewTicket.issue_type}</div>
              <div><b>Agent ID:</b> {viewTicket.agent_id}</div>
              <div><b>Status:</b> {viewTicket.resolution_status}</div>
              <div><b>Issue Description:</b> {viewTicket.issue_description}</div>
              <div><b>FCR:</b> {viewTicket.first_call_resolution ? 'Yes' : 'No'}</div>
              <div><b>End Time:</b> {viewTicket.end_time ? new Date(viewTicket.end_time).toLocaleString() : '-'}</div>
            </div>
            <div className="flex justify-end mt-6">
              <button className="btn btn-secondary" onClick={() => setViewTicket(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Ticket Modal */}
      {editTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto py-8 px-4">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => setEditTicket(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <Icon icon="heroicons-outline:ticket" className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="text-xl font-medium text-slate-900">Edit Ticket</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Update Ticket Information</p>
                </div>
              </div>
              <button
                onClick={() => setEditTicket(null)}
                className="text-slate-400 hover:text-slate-500 transition-colors"
              >
                <Icon icon="heroicons:x-mark" className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Body */}
            <form onSubmit={handleEditSubmit} className="px-6 pb-6">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      name="customer_phone"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      placeholder="Enter phone number"
                      value={editTicket.customer_phone}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Communication Channel</label>
                    <select
                      name="communication_channel"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      value={editTicket.communication_channel}
                      onChange={handleEditChange}
                      required
                    >
                      <option value="">Select channel</option>
                      <option value="Phone">Phone</option>
                      <option value="Email">Email</option>
                      <option value="Chat">Chat</option>
                      <option value="Social Media">Social Media</option>
                      <option value="In Person">In Person</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Device Type</label>
                    <select
                      name="device_type"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      value={editTicket.device_type}
                      onChange={handleEditChange}
                    >
                      <option value="">Select device</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Laptop">Laptop</option>
                      <option value="Tablet">Tablet</option>
                      <option value="Desktop">Desktop</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Issue Category</label>
                    <select
                      name="issue_category"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      value={editTicket.issue_category}
                      onChange={handleEditChange}
                      required
                    >
                      <option value="">Select category</option>
                      {issueCategories.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Issue Type</label>
                    <select
                      name="issue_type"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      value={editTicket.issue_type}
                      onChange={handleEditChange}
                      required
                    >
                      <option value="">Select type</option>
                      {editTicket.issue_category && issueTypeOptions[editTicket.issue_category].map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Status</label>
                    <select
                      name="resolution_status"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      value={editTicket.resolution_status}
                      onChange={handleEditChange}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                      <option value="Reopened">Reopened</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Issue Description</label>
                  <textarea
                    name="issue_description"
                    rows="3"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                    placeholder="Describe the issue in detail..."
                    value={editTicket.issue_description}
                    onChange={handleEditChange}
                    required
                  />
                </div>
              </div>
              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setEditTicket(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-primary/20 transition-colors min-w-[100px] flex items-center justify-center"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};

export default NewTicketsPage; 