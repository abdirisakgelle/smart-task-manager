import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { toast } from "react-toastify";
import EmployeeRegistration from "./EmployeeRegistration";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔍 Starting to fetch employees...");
      
      // Simple direct fetch without any complex logic
      const response = await fetch("/api/employees");
      
      console.log("📡 Response status:", response.status);
      console.log("📡 Response ok:", response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("✅ Employees loaded:", data.length, "employees");
      
      setEmployees(data);
      setLoading(false);
      
    } catch (err) {
      console.error("❌ Error fetching employees:", err);
      setError(err.message);
      setLoading(false);
      toast.error("Failed to load employees");
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete employee");
      }

      toast.success("Employee deleted successfully");
      fetchEmployees(); // Refresh the list
    } catch (err) {
      console.error("Error deleting employee:", err);
      toast.error("Failed to delete employee");
    }
  };

  const getShiftBadgeColor = (shift) => {
    switch (shift) {
      case "Morning":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Afternoon":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Evening":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "Night":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Icon icon="warning" className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Error Loading Employees
        </h3>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
        <Button onClick={fetchEmployees} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Employee Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Register new employees and manage existing ones
          </p>
        </div>
        <Button
          onClick={() => setShowRegistration(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
        >
          <Icon icon="user-plus" className="w-4 h-4 mr-2" />
          Add New Employee
        </Button>
      </div>

      {showRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Employee</h2>
              <Button
                onClick={() => setShowRegistration(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Icon icon="x" className="w-4 h-4" />
              </Button>
            </div>
            <EmployeeRegistration
              onEmployeeCreated={() => {
                fetchEmployees();
                setShowRegistration(false);
              }}
            />
          </div>
        </div>
      )}

      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Employee List
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {employees.length} employee{employees.length !== 1 ? "s" : ""}
          </div>
        </div>

        {employees.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Icon icon="users" className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No employees found. Register a new employee to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Shift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {employees.map((employee) => (
                  <tr key={employee.employee_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        #NS{employee.employee_id.toString().padStart(3, '0')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {employee.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {employee.department}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {employee.section}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {employee.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getShiftBadgeColor(
                          employee.shift
                        )}`}
                      >
                        {employee.shift}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {employee.phone || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                              <Button
                          onClick={() => handleDeleteEmployee(employee.employee_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Icon icon="trash" className="w-4 h-4" />
                        </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EmployeeManagement; 