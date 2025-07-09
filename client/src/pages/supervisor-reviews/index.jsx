import React, { useMemo, useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { useTable, useSortBy, usePagination } from "react-table";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";

const SupervisorReviewsPage = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state for editing notes
  const [modalOpen, setModalOpen] = useState(false);
  const [modalNotes, setModalNotes] = useState("");
  const [modalReview, setModalReview] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/supervisor-reviews");
      if (!response.ok) throw new Error("Failed to fetch supervisor reviews");
      const data = await response.json();
      setReviews(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh data every 30 minutes
  useEffect(() => {
    fetchReviews();
    
    const interval = setInterval(fetchReviews, 30 * 60 * 1000); // 30 minutes
    
    return () => clearInterval(interval);
  }, []);

  const handleUpdateReview = async (reviewId, updates) => {
    try {
      const response = await fetch(`/api/supervisor-reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update review");
      // Refresh data after update
      fetchReviews();
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

  if (error) return (
    <Card>
      <div className="text-red-500 p-4">
        Error loading supervisor reviews: {error.message}
      </div>
    </Card>
  );

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Supervisor Reviews</h2>
          <p className="text-sm text-gray-600 mt-1">
            Auto-updating view of unresolved tickets from the last 3 days
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Icon icon="ph:clock" className="text-green-500" />
          <span>Auto-refresh every 30 minutes</span>
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
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th 
                      {...column.getHeaderProps(column.getSortByToggleProps())} 
                      className="px-3 py-2 border-b bg-gray-50 text-left cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        {column.render("Header")}
                        {column.isSorted && (
                          <Icon 
                            icon={column.isSortedDesc ? "ph:caret-down" : "ph:caret-up"} 
                            className="ml-1 text-gray-400" 
                          />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} className="hover:bg-gray-50">
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
          
          {pageOptions.length > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => previousPage()} 
                  disabled={!canPreviousPage} 
                  className="btn btn-sm btn-outline"
                >
                  Previous
                </button>
                <span className="text-sm">
                  Page {state.pageIndex + 1} of {pageOptions.length}
                </span>
                <button 
                  onClick={() => nextPage()} 
                  disabled={!canNextPage} 
                  className="btn btn-sm btn-outline"
                >
                  Next
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Show:</span>
                <select
                  value={state.pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="input input-sm w-20"
                >
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default SupervisorReviewsPage; 