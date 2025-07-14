import React, { useMemo, useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { useTable, useSortBy, usePagination } from "react-table";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import { useSmartPolling } from "@/hooks/useSmartPolling";
import { apiCall, POLLING_CONFIGS } from "@/utils/apiUtils";
import Alert from "@/components/ui/Alert";

const SupervisorReviewsPage = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorBanner, setErrorBanner] = useState(null);

  // Modal state for editing notes
  const [modalOpen, setModalOpen] = useState(false);
  const [modalNotes, setModalNotes] = useState("");
  const [modalReview, setModalReview] = useState(null);

  // Smart polling fetch function
  const fetchReviews = async (signal) => {
    try {
      const data = await apiCall("/supervisor-reviews", { signal });
      setReviews(data);
      setError(null);
      setErrorBanner(null); // Clear error banner on success
      return data;
    } catch (err) {
      setError(err.message);
      setErrorBanner(err.message); // Show error banner
      throw err;
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
  // Smart polling with error handling
  const { isPolling, retryCount, lastError } = useSmartPolling(
    fetchReviews,
    POLLING_INTERVAL_MS, // 30 seconds
    {
      ...POLLING_CONFIGS.INFREQUENT,
      onError: (error, retryCount) => {
        setErrorBanner(error.message || String(error));
      },
      onSuccess: (data) => {
        setReviews(data);
        setError(null);
        setErrorBanner(null);
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
      Cell: ({ value }) => value ? new Date(value).toLocaleDateString('en-CA') : '' 
    },
    { Header: "Customer Phone", accessor: "customer_phone" },
    { Header: "Channel", accessor: "communication_channel" },
    { Header: "Issue Type", accessor: "issue_type" },
    { 
      Header: "Status", 
      accessor: "resolution_status", 
      Cell: ({ value }) => (
        <span className={`badge ${
          value === 'Done' || value === 'done' 
            ? 'bg-green-100 text-green-700' 
            : value === 'In Progress' 
            ? 'bg-yellow-100 text-yellow-700'
            : value === 'Escalated'
            ? 'bg-red-100 text-red-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {value === 'Resolved' ? 'Done' : value}
        </span>
      )
    },
    { 
      Header: "FCR", 
      accessor: "first_call_resolution", 
      Cell: ({ value }) => value ? "Yes" : "No" 
    },
    { Header: "Agent Name", accessor: "agent_name", Cell: ({ value }) => value || "-" },
    {
      Header: "Review Status",
      accessor: "issue_status",
      Cell: ({ value, row }) => {
        const currentStatus = value || "Pending";
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
          <select
            value={currentStatus}
            onChange={handleStatusChange}
            className="input input-sm"
          >
            {statusOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      }
    },
    {
      Header: "Notes",
      accessor: "notes",
      Cell: ({ value, row }) => (
        <div className="flex items-center space-x-2">
          <span className="text-sm max-w-32 truncate" title={value || ""}>
            {value || "No notes"}
          </span>
          <button
            onClick={() => openNotesModal(row.original)}
            className="btn btn-xs btn-outline"
            title="Edit Notes"
          >
            <Icon icon="ph:pencil-simple" className="text-blue-500" />
          </button>
        </div>
      )
    },
    {
      Header: "Actions",
      Cell: ({ row }) => (
        <div className="flex space-x-2">
          <button 
            className="btn btn-xs btn-outline" 
            title="View Ticket" 
            onClick={() => navigate(`/tickets/${row.original.ticket_id}`)}
          >
            <Icon icon="ph:eye" className="text-blue-500 text-lg" />
          </button>
          <button 
            className="btn btn-xs btn-outline" 
            title="Edit Ticket" 
            onClick={() => navigate(`/tickets/edit/${row.original.ticket_id}`)}
          >
            <Icon icon="ph:pencil-simple" className="text-yellow-500 text-lg" />
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading supervisor reviews...</span>
      </div>
    </Card>
  );

  return (
    <Card>
      {/* Error banner (non-blocking) */}
      {errorBanner && (
        <Alert type="error" className="mb-4">
          {errorBanner}
        </Alert>
      )}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Supervisor Reviews</h2>
          <p className="text-sm text-gray-600 mt-1">
            Auto-updating view of unresolved tickets from the last 3 days
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
          <span>Auto-updating</span>
          {retryCount > 0 && (
            <span className="text-orange-500">(Retry {retryCount})</span>
          )}
        </div>
      </div>

      {/* Notes Edit Modal */}
      <Modal
        activeModal={modalOpen}
        onClose={closeNotesModal}
        title="Edit Notes"
        className="max-w-md"
        isBlur
        footerContent={
          <>
            <button
              className="btn btn-secondary"
              onClick={closeNotesModal}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSaveNotesModal}
              disabled={modalNotes.trim() === (modalReview?.notes || "")}
            >
              Save
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <label className="block font-medium mb-1">Notes</label>
          <textarea
            className="input w-full min-h-[100px]"
            value={modalNotes}
            onChange={e => setModalNotes(e.target.value)}
            placeholder="Enter notes for this review..."
            autoFocus
          />
        </div>
      </Modal>

      {reviews && reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Icon icon="ph:check-circle" className="text-4xl mx-auto mb-2 text-green-500" />
          <p>No unresolved tickets from the last 3 days require review.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table {...getTableProps()} className="min-w-full table-auto border">
            <thead>
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()} className="bg-gray-100">
                  {headerGroup.headers.map(column => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className="px-3 py-2 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-200"
                    >
                      {column.render('Header')}
                      <span className="ml-1">
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <Icon icon="ph:caret-down" className="text-xs" />
                          ) : (
                            <Icon icon="ph:caret-up" className="text-xs" />
                          )
                        ) : (
                          <Icon icon="ph:caret-up-down" className="text-xs text-gray-400" />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map(row => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} className="border-b hover:bg-gray-50">
                    {row.cells.map(cell => (
                      <td {...cell.getCellProps()} className="px-3 py-2">
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
                className="btn btn-sm btn-outline"
              >
                <Icon icon="ph:caret-double-left" />
              </button>
              <button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                className="btn btn-sm btn-outline"
              >
                <Icon icon="ph:caret-left" />
              </button>
              <button
                onClick={() => nextPage()}
                disabled={!canNextPage}
                className="btn btn-sm btn-outline"
              >
                <Icon icon="ph:caret-right" />
              </button>
              <button
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
                className="btn btn-sm btn-outline"
              >
                <Icon icon="ph:caret-double-right" />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Page {state.pageIndex + 1} of {pageOptions.length}
              </span>
              <select
                value={state.pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
                className="input input-sm"
              >
                {[10, 20, 30, 40, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default SupervisorReviewsPage; 