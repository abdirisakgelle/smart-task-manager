import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { toast } from "react-toastify";
import { getApiUrl } from "@/utils/apiUtils";

const UserCreationForm = ({ onUserCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "agent",
    employee_id: ""
  });
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAvailableEmployees();
  }, []);

  const fetchAvailableEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/users/available-employees'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch available employees');
      }

      const data = await response.json();
      setAvailableEmployees(data);
    } catch (err) {
      console.error('Error fetching available employees:', err);
      toast.error('Failed to load available employees');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/users/create'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password,
          role: formData.role,
          employee_id: formData.employee_id || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      toast.success('User created successfully');
      onUserCreated();
      
      // Reset form
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        role: "agent",
        employee_id: ""
      });
      setErrors({});
    } catch (err) {
      console.error('Error creating user:', err);
      toast.error(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const getRoleDescription = (role) => {
    const descriptions = {
      admin: 'Full access to all system features and configurations',
      manager: 'Can access dashboards, assign tasks, and review output',
      agent: 'Limited to viewing and resolving tickets only',
      supervisor: 'Responsible for reviewing tickets and assigning follow-ups',
      media: 'Can view and manage content modules: Ideas, Content, Production, Social Media',
      follow_up: 'Limited access to follow-up reporting and resolution tracking'
    };
    return descriptions[role] || 'No description available';
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white ${
                errors.username 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Enter username"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white ${
                errors.role 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <option value="agent">Agent</option>
              <option value="supervisor">Supervisor</option>
              <option value="manager">Manager</option>
              <option value="media">Media</option>
              <option value="follow_up">Follow-up</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.role}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {getRoleDescription(formData.role)}
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white ${
                errors.password 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Enter password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white ${
                errors.confirmPassword 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Confirm password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Employee Assignment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Link to Employee (Optional)
          </label>
          <select
            name="employee_id"
            value={formData.employee_id}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="">No employee linked</option>
            {availableEmployees.map(employee => (
              <option key={employee.employee_id} value={employee.employee_id}>
                {employee.name} - {employee.job_title || 'No job title'} ({employee.shift || 'No shift'})
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {availableEmployees.length === 0 
              ? "No employees available for linking. All employees already have user accounts."
              : `Available employees: ${availableEmployees.length}`
            }
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Icon icon="heroicons:plus" className="w-4 h-4 mr-2" />
                Create User
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default UserCreationForm; 