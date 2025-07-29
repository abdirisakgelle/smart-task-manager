import React, { useState, useEffect, useMemo } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { useSelector } from "react-redux";
import { useTable, useSortBy, usePagination } from "react-table";

const TasksPage = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [stats, setStats] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  const [form, setForm] = useState({
    title: "",
    description: "",
    assigned_to: "",
    priority: "Medium",
    due_date: "",
    send_sms: false,
  });

  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
    fetchStats();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tasks", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/tasks/stats/overview", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.title || !form.assigned_to || !form.due_date) {
      setFormError("Please fill all required fields.");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("Failed to create task. " + errorText);
      }

      setShowModal(false);
      setForm({
        title: "",
        description: "",
        assigned_to: "",
        priority: "Medium",
        due_date: "",
        send_sms: false,
      });
      await fetchTasks();
      await fetchStats();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (task_id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const response = await fetch(`/api/tasks/${task_id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete task");
      setTasks((prev) => prev.filter((t) => t.task_id !== task_id));
      await fetchStats();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStatusUpdate = async (task_id, newStatus) => {
    try {
      const task = tasks.find(t => t.task_id === task_id);
      if (!task) return;

      const response = await fetch(`/api/tasks/${task_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...task,
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error("Failed to update task");
      await fetchTasks();
      await fetchStats();
    } catch (err) {
      alert(err.message);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "In Progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Not Started":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'Completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    return due < today;
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const statusMatch = statusFilter === "all" || task.status === statusFilter;
      const priorityMatch = priorityFilter === "all" || task.priority === priorityFilter;
      const assigneeMatch = assigneeFilter === "all" || task.assigned_to === parseInt(assigneeFilter);
      return statusMatch && priorityMatch && assigneeMatch;
    });
  }, [tasks, statusFilter, priorityFilter, assigneeFilter]);

  const canCreateTasks = currentUser?.role === "admin" || currentUser?.role === "manager" || currentUser?.role === "supervisor";
  const canDeleteTasks = currentUser?.role === "admin" || currentUser?.role === "manager";

  const COLUMNS = [
    {
      Header: "Task ID",
      accessor: "task_id",
      Cell: ({ value }) => `#${String(value).padStart(4, "0")}`,
    },
    {
      Header: "Title",
      accessor: "title",
      Cell: ({ value, row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{value}</span>
          {isOverdue(row.original.due_date, row.original.status) && (
            <Icon icon="ph:warning" className="w-4 h-4 text-red-500" title="Overdue" />
          )}
        </div>
      ),
    },
    {
      Header: "Assigned To",
      accessor: "assigned_to_name",
    },
    {
      Header: "Priority",
      accessor: "priority",
      Cell: ({ value }) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(value)}`}>
          {value}
        </span>
      ),
    },
    {
      Header: "Status",
      accessor: "status",
      Cell: ({ value, row }) => (
        <select
          value={value}
          onChange={(e) => handleStatusUpdate(row.original.task_id, e.target.value)}
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(value)} cursor-pointer`}
        >
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      ),
    },
    {
      Header: "Due Date",
      accessor: "due_date",
      Cell: ({ value, row }) => (
        <span className={isOverdue(value, row.original.status) ? "text-red-600 font-medium" : ""}>
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      Header: "Created By",
      accessor: "created_by_name",
    },
    {
      Header: "Actions",
      Cell: ({ row }) => (
        <div className="flex space-x-2">
          <button
            className="btn btn-xs btn-outline"
            title="View"
            onClick={() => {
              // View task details (could open a modal)
              console.log("View task:", row.original);
            }}
          >
            <Icon icon="ph:eye" className="text-blue-500 text-lg" />
          </button>
          {canDeleteTasks && (
            <button
              className="btn btn-xs btn-outline"
              title="Delete"
              onClick={() => handleDelete(row.original.task_id)}
            >
              <Icon icon="ph:trash" className="text-red-500 text-lg" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const columns = useMemo(() => COLUMNS, [canDeleteTasks]);
  const data = useMemo(() => filteredTasks, [filteredTasks]);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Task Assignment</h1>
          <p className="text-gray-600">Manage and track task assignments across your team</p>
        </div>
        {canCreateTasks && (
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <Icon icon="ph:plus" className="w-4 h-4 mr-2" />
            Assign Task
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total_tasks || 0}</p>
              </div>
              <Icon icon="ph:list" className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.in_progress || 0}</p>
              </div>
              <Icon icon="ph:clock" className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">{stats.completed || 0}</p>
              </div>
              <Icon icon="ph:check-circle" className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Overdue</p>
                <p className="text-2xl font-bold text-red-900">{stats.overdue || 0}</p>
              </div>
              <Icon icon="ph:warning" className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignee
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
              >
                <option value="all">All Assignees</option>
                {employees.map((employee) => (
                  <option key={employee.employee_id} value={employee.employee_id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                className="btn btn-secondary w-full"
                onClick={() => {
                  setStatusFilter("all");
                  setPriorityFilter("all");
                  setAssigneeFilter("all");
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Tasks Table */}
      <Card>
        <div className="overflow-x-auto">
          <table {...getTableProps()} className="min-w-full table-auto border">
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className="px-3 py-2 border-b bg-gray-50 text-left"
                    >
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
          <div className="flex justify-between items-center mt-2 p-4">
            <button
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
              className="btn btn-sm"
            >
              Previous
            </button>
            <span>
              Page {state.pageIndex + 1} of {pageOptions.length}
            </span>
            <button
              onClick={() => nextPage()}
              disabled={!canNextPage}
              className="btn btn-sm"
            >
              Next
            </button>
          </div>
        </div>
      </Card>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto py-8 px-4">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <Icon icon="ph:task" className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="text-xl font-medium text-slate-900">Assign New Task</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Create and assign a task to a team member</p>
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
            <form onSubmit={handleCreateTask} className="px-6 pb-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="Enter task title"
                    value={form.title}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                    placeholder="Describe the task in detail..."
                    value={form.description}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Assign To *
                    </label>
                    <select
                      name="assigned_to"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      value={form.assigned_to}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Select employee</option>
                      {employees.map((employee) => (
                        <option key={employee.employee_id} value={employee.employee_id}>
                          {employee.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Priority
                    </label>
                    <select
                      name="priority"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      value={form.priority}
                      onChange={handleFormChange}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    value={form.due_date}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="send_sms"
                    name="send_sms"
                    checked={form.send_sms}
                    onChange={handleFormChange}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="send_sms" className="text-sm text-slate-600">
                    Send SMS notification to assigned employee
                  </label>
                </div>

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
                    "Assign Task"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage; 