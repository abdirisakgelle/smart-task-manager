import React, { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { useTable, useSortBy, usePagination } from "react-table";

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusBadge = (status) => {
  const statusConfig = {
    'done': { color: 'bg-green-100 text-green-800', icon: 'ph:check-circle' },
    'pending': { color: 'bg-yellow-100 text-yellow-800', icon: 'ph:clock' },
    'reopened': { color: 'bg-red-100 text-red-800', icon: 'ph:arrow-clockwise' },
    'in_progress': { color: 'bg-blue-100 text-blue-800', icon: 'ph:play-circle' },
    'closed': { color: 'bg-gray-100 text-gray-800', icon: 'ph:check-circle' },
    'open': { color: 'bg-blue-100 text-blue-800', icon: 'ph:play-circle' }
  };
  
  const config = statusConfig[status?.toLowerCase()] || statusConfig['pending'];
  return config;
};

const RecentTicketsTable = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/tickets");
        if (!response.ok) throw new Error("Failed to fetch tickets");
        const data = await response.json();
        setTickets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const COLUMNS = [
    { 
      Header: "Ticket ID", 
      accessor: "ticket_id",
      Cell: ({ value }) => (
        <span className="font-semibold text-gray-900">#{value}</span>
      )
    },
    { 
      Header: "Created At", 
      accessor: "created_at",
      Cell: ({ value }) => (
        <span className="text-sm text-gray-600">{formatDate(value)}</span>
      )
    },
    { 
      Header: "Customer Phone", 
      accessor: "customer_phone",
      Cell: ({ value }) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    { 
      Header: "Communication Channel", 
      accessor: "communication_channel",
      Cell: ({ value }) => (
        <span className="text-sm text-gray-600 capitalize">{value}</span>
      )
    },
    { 
      Header: "Device Type", 
      accessor: "device_type",
      Cell: ({ value }) => (
        <span className="text-sm text-gray-600 capitalize">{value}</span>
      )
    },
    { 
      Header: "Issue Type", 
      accessor: "issue_type",
      Cell: ({ value }) => (
        <span className="text-sm font-medium text-gray-900">{value}</span>
      )
    },
    { 
      Header: "Issue Description", 
      accessor: "issue_description",
      Cell: ({ value }) => (
        <span className="text-sm text-gray-600 max-w-xs truncate block" title={value}>
          {value}
        </span>
      )
    },
    { 
      Header: "Agent ID", 
      accessor: "agent_id",
      Cell: ({ value }) => (
        <span className="text-sm font-medium text-gray-900">#{value}</span>
      )
    },
    { 
      Header: "Resolution Status", 
      accessor: "resolution_status",
      Cell: ({ value }) => {
        const statusConfig = getStatusBadge(value);
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
            <Icon icon={statusConfig.icon} className="w-3 h-3 mr-1" />
            {value}
          </span>
        );
      }
    },
    { 
      Header: "End Time", 
      accessor: "end_time",
      Cell: ({ value }) => (
        <span className="text-sm text-gray-600">{formatDate(value)}</span>
      )
    },
  ];

  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => tickets, [tickets]);

  const tableInstance = useTable(
    { columns, data, initialState: { pageSize: 10 } },
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

  if (loading) {
    return (
      <Card>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="p-6 text-center text-red-500">
          <Icon icon="ph:warning" className="text-2xl mb-2 mx-auto" />
          <p className="font-medium">Error loading tickets</p>
          <p className="text-sm text-gray-600 mt-1">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200" {...getTableProps()}>
          <thead className="bg-gray-50">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th 
                    {...column.getHeaderProps(column.getSortByToggleProps())} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.render("Header")}</span>
                      {column.isSorted && (
                        <Icon 
                          icon={column.isSortedDesc ? "ph:caret-down" : "ph:caret-up"} 
                          className="w-3 h-3 text-gray-400" 
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200" {...getTableBodyProps()}>
            {page.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  <Icon icon="ph:inbox" className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No tickets found</p>
                </td>
              </tr>
            ) : (
              page.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} className="hover:bg-gray-50 transition-colors">
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()} className="px-6 py-4 whitespace-nowrap">
                        {cell.render("Cell")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        
        {/* Enhanced Pagination */}
        <div className="bg-white px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Page {state.pageIndex + 1} of {pageOptions.length}
              </span>
              <span className="text-sm text-gray-500">
                ({page.length} of {data.length} tickets)
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => previousPage()} 
                disabled={!canPreviousPage} 
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {pageOptions.slice(Math.max(0, state.pageIndex - 2), Math.min(pageOptions.length, state.pageIndex + 3)).map((pageIndex) => (
                  <button
                    key={pageIndex}
                    onClick={() => gotoPage(pageIndex)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      state.pageIndex === pageIndex
                        ? 'bg-red-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageIndex + 1}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => nextPage()} 
                disabled={!canNextPage} 
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RecentTicketsTable; 