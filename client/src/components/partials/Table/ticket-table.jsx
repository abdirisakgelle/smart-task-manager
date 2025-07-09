import React, { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import { useTable, useSortBy, usePagination } from "react-table";

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
    { Header: "Ticket ID", accessor: "ticket_id" },
    { Header: "Created At", accessor: "created_at" },
    { Header: "Customer Phone", accessor: "customer_phone" },
    { Header: "Communication Channel", accessor: "communication_channel" },
    { Header: "Device Type", accessor: "device_type" },
    { Header: "Issue Type", accessor: "issue_type" },
    { Header: "Issue Description", accessor: "issue_description" },
    { Header: "Agent ID", accessor: "agent_id" },
    { Header: "Resolution Status", accessor: "resolution_status" },
    { Header: "End Time", accessor: "end_time" },
  ];

  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => tickets, [tickets]);

  const tableInstance = useTable(
    { columns, data },
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 table-fixed dark:divide-gray-700" {...getTableProps()}>
          <thead className="bg-gray-100 dark:bg-gray-700">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())} className="table-th">
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
                    <td {...cell.getCellProps()} className="table-td">
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
    </Card>
  );
};

export default RecentTicketsTable; 