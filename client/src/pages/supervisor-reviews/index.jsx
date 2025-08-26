import React, { useMemo, useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { useTable, useSortBy, usePagination } from "react-table";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import { useSmartPolling } from "@/hooks/useSmartPolling";
import { apiCall, POLLING_CONFIGS } from "@/utils/apiUtils";

const SupervisorReviewsPage = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state for editing notes
  const [modalOpen, setModalOpen] = useState(false);
  const [modalNotes, setModalNotes] = useState("");
  const [modalReview, setModalReview] = useState(null);

  // Smart polling fetch function
  const fetchReviews = async (signal) => {
    try {
      const data = await apiCall("/supervisor-reviews", { signal });
      setReviews(data);
      return data;
    } catch (err) {
      // Silently handle errors - data will refresh on next poll
      console.error('Error fetching reviews:', err);
      return [];
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await fetchReviews();
      } catch (err) {
        // Error already handled by fetchReviews
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Set polling interval to 30 seconds (30000 ms)
  const POLLING_INTERVAL_MS = 30000;
  // Smart polling with silent error handling
  const { isPolling } = useSmartPolling(
    fetchReviews,
    POLLING_INTERVAL_MS, // 30 seconds
    {
      ...POLLING_CONFIGS.INFREQUENT,
      onSuccess: (data) => {
        setReviews(data);
      }
    }
  );

  const handleUpdateReview = async (reviewId, updates) => {
    try {
      await apiCall(`/supervisor-reviews/${reviewId}`, {
        method: "PUT",
        body: updates,
      });
      
      // Refresh data after update
      await fetchReviews();
    } catch (err) {
      alert(err.message);
    }
  };

  const openNotesModal = (review) => {
    setModalReview(review);
    setModalNotes(review.notes || "");
    setModalOpen(true);
  };

  const closeNotesModal = () => {
    setModalOpen(false);
    setModalReview(null);
    setModalNotes("");
  };

  const handleSaveNotesModal = () => {
    if (modalReview) {
      handleUpdateReview(modalReview.review_id, {
        ...modalReview,
        notes: modalNotes
      });
    }
    closeNotesModal();
  };

  const COLUMNS = [
    { 
      Header: "Ticket ID", 
      accessor: "ticket_id", 
      Cell: ({ value }) => `#${String(value).padStart(4, '0')}` 
    },
    { 
      Header: "Created", 
      accessor: "ticket_created_at", 
      Cell: ({ value, row }) => {
        const ticketCreated = new Date(value);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const isEscalated = ticketCreated < oneHourAgo && 
          ['Pending', 'In Progress'].includes(row.original.resolution_status);
        
        return (
          <div className="flex items-center gap-2">
            <span>{value ? new Date(value).toLocaleDateString('en-CA') : ''}</span>
            {isEscalated && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                ⚠️ 1h+
              </span>
            )}
          </div>
        );
      }
    },
    { Header: "Customer Phone", accessor: "customer_phone" },
    { Header: "Channel", accessor: "communication_channel" },
    { 
      Header: "Time Open", 
      accessor: "time_open", 
      Cell: ({ row }) => {
        const value = row.original.ticket_created_at;
        if (!value) return '-';
        
        const ticketCreated = new Date(value);
        const now = new Date();
        const diffMs = now - ticketCreated;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        let timeDisplay = '';
        if (diffHours > 0) {
          timeDisplay = `${diffHours}h ${diffMinutes}m`;
        } else {
          timeDisplay = `${diffMinutes}m`;
        }
        
        const isEscalated = diffHours >= 1 && 
          ['Pending', 'In Progress'].includes(row.original.resolution_status);
        
        return (
          <span className={`text-sm ${isEscalated ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
            {timeDisplay}
          </span>
        );
      }
    },
    { Header: "Issue Type", accessor: "issue_type" },
    { 
      Header: "Status", 
      accessor: "effective_status", 
      Cell: ({ value, row }) => {
        // Check if ticket should be escalated based on time
        const ticketCreated = new Date(row.original.ticket_created_at);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const shouldBeEscalated = ticketCreated < oneHourAgo && 
          ['Pending', 'In Progress'].includes(row.original.resolution_status);
        
        const displayStatus = shouldBeEscalated ? 'Escalated' : value;
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            displayStatus === 'Done' || displayStatus === 'done' 
              ? 'bg-green-100 text-green-800' 
              : displayStatus === 'In Progress' 
              ? 'bg-yellow-100 text-yellow-800'
              : displayStatus === 'Escalated'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {displayStatus === 'Resolved' ? 'Done' : displayStatus}
          </span>
        );
      }
    },
    { 
      Header: "FCR", 
      accessor: "first_call_resolution", 
      Cell: ({ value }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? "Yes" : "No"}
        </span>
      )
    },
    { Header: "Agent Name", accessor: "agent_name", Cell: ({ value }) => value || "-" },
    {
      Header: "Review Status",
      accessor: "issue_status",
      Cell: ({ value, row }) => {
        // Check if ticket should be auto-escalated
        const ticketCreated = new Date(row.original.ticket_created_at);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const shouldBeEscalated = ticketCreated < oneHourAgo && 
          ['Pending', 'In Progress'].includes(row.original.resolution_status);
        
        const currentStatus = shouldBeEscalated ? "Escalated" : (value || "Pending");
        const statusOptions = ["Pending", "In Progress", "Done", "Escalated"];
        
        const handleStatusChange = (e) => {
          let newStatus = e.target.value;
          if (newStatus === "Resolved") newStatus = "Done";
          handleUpdateReview(row.original.review_id, {
            ...row.original,
            issue_status: newStatus,
            resolved: newStatus === "Done"
          });
        };

        return (
          <div className="space-y-1">
            <select
              value={currentStatus}
              onChange={handleStatusChange}
              className={`w-full px-3 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                shouldBeEscalated 
                  ? 'border-red-300 bg-red-50 text-red-700' 
                  : 'border-gray-300'
              }`}
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {shouldBeEscalated && (
              <span className="text-xs text-red-600 font-medium">
                Auto-escalated after 1 hour
              </span>
            )}
          </div>
        );
      }
    },
    {
      Header: "Notes",
      accessor: "notes",
      Cell: ({ value, row }) => (
        <div className="flex items-center space-x-2">
          <span className="text-sm max-w-32 truncate text-gray-600" title={value || ""}>
            {value || "No notes"}
          </span>
          <button
            onClick={() => openNotesModal(row.original)}
            className="inline-flex items-center p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit Notes"
          >
            <Icon icon="ph:pencil-simple" className="w-4 h-4" />
          </button>
        </div>
      )
    },
    {
      Header: "Actions",
      Cell: ({ row }) => (
        <div className="flex space-x-2">
          <button 
            className="inline-flex items-center p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors" 
            title="View Ticket" 
            onClick={() => navigate(`/tickets/${row.original.ticket_id}`)}
          >
            <Icon icon="ph:eye" className="w-4 h-4" />
          </button>
          <button 
            className="inline-flex items-center p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-md transition-colors" 
            title="Edit Ticket" 
            onClick={() => navigate(`/tickets/edit/${row.original.ticket_id}`)}
          >
            <Icon icon="ph:pencil-simple" className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const columns = useMemo(() => COLUMNS, [navigate]);
  const data = useMemo(() => reviews || [], [reviews]);
  
  const tableInstance = useTable(
    { 
      columns, 
      data, 
      initialState: { pageSize: 10 } 
    }, 
    useSortBy, 
    usePagination
  );

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

  if (loading) return (
    <Card>
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span className="ml-2 text-gray-600">Loading supervisor reviews...</span>
      </div>
    </Card>
  );

  return (
    <Card title="Supervisor Reviews" subtitle="Auto-updating view of unresolved tickets from the last 3 days">




      {/* Escalation Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                Escalated: {reviews.filter(review => {
                  const ticketCreated = new Date(review.ticket_created_at);
                  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
                  return ticketCreated < oneHourAgo && 
                    ['Pending', 'In Progress'].includes(review.resolution_status);
                }).length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                Pending: {reviews.filter(review => review.resolution_status === 'Pending').length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                In Progress: {reviews.filter(review => review.resolution_status === 'In Progress').length}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            ⚠️ Tickets auto-escalate after 1 hour of no response
          </div>
        </div>
      </div>

      {/* Notes Modal */}
      <Modal
        title="Edit Review Notes"
        activeModal={modalOpen}
        onClose={closeNotesModal}
        className="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={modalNotes}
              onChange={(e) => setModalNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
              placeholder="Enter review notes..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={closeNotesModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNotesModal}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
              Save Notes
            </button>
          </div>
        </div>
      </Modal>

      {reviews && reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Icon icon="ph:check-circle" className="text-5xl mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Reviews Required</h3>
          <p className="text-gray-500">No unresolved tickets from the last 3 days require review.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {column.render('Header')}
                        <span className="text-gray-400">
                          {column.isSorted ? (
                            column.isSortedDesc ? (
                              <Icon icon="ph:caret-down" className="w-3 h-3" />
                            ) : (
                              <Icon icon="ph:caret-up" className="w-3 h-3" />
                            )
                          ) : (
                            <Icon icon="ph:caret-up-down" className="w-3 h-3" />
                          )}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
              {page.map(row => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} className="hover:bg-gray-50 transition-colors">
                    {row.cells.map(cell => (
                      <td {...cell.getCellProps()} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Enhanced Pagination */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Icon icon="ph:caret-double-left" className="w-4 h-4" />
              </button>
              <button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Icon icon="ph:caret-left" className="w-4 h-4" />
              </button>
              <button
                onClick={() => nextPage()}
                disabled={!canNextPage}
                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Icon icon="ph:caret-right" className="w-4 h-4" />
              </button>
              <button
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Icon icon="ph:caret-double-right" className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Page</span>
                <span className="text-sm font-medium text-gray-900">
                  {state.pageIndex + 1} of {pageOptions.length}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Show</span>
                <select
                  value={state.pageSize}
                  onChange={e => setPageSize(Number(e.target.value))}
                  className="px-2 py-1 text-sm border border-gray-300 rounded text-gray-700 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                >
                  {[10, 25, 50, 100].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-700">entries</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default SupervisorReviewsPage; 