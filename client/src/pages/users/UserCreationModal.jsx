import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { toast } from "react-toastify";
import { getApiUrl } from "@/utils/apiUtils";

const UserCreationModal = ({ onUserCreated, onClose }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    system_role: "",
    employee_id: ""
  });
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

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

      if (response.ok) {
        const data = await response.json();
        setAvailableEmployees(data);
      }
    } catch (err) {
      console.error('Error fetching available employees:', err);
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
          username: formData.username,
          password: formData.password,
          system_role: formData.system_role || null,
          employee_id: formData.employee_id || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const data = await response.json();
      toast.success(`User "${formData.username}" created successfully!`);
      onUserCreated();
    } catch (err) {
      console.error('Error creating user:', err);
      toast.error(err.message);
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

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({
      ...prev,
      password: password,
      confirmPassword: password
    }));
    setShowPassword(true);
  };

  const getRoleDescription = (systemRole) => {
    const descriptions = {
      admin: 'Full system access and user management',
      ceo: 'Executive access and oversight',
      '': 'Regular user access (no system override)'
    };
    return descriptions[systemRole] || 'Regular user access (no system override)';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="relative">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New User</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Add a new user to the system with appropriate role and permissions
              </p>
            </div>
            <Button
              icon="ph:x"
              onClick={onClose}
              disabled={loading}
              className="btn btn-sm btn-outline h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                placeholder="Enter username"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors ${
                  errors.username 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                disabled={loading}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
              )}
            </div>

            {/* System Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                System Role (Optional)
              </label>
              <select
                name="system_role"
                value={formData.system_role}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                disabled={loading}
              >
                <option value="">No system role (regular user)</option>
                <option value="admin">Admin</option>
                <option value="ceo">CEO</option>
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {getRoleDescription(formData.system_role)}
              </p>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                System roles override organizational hierarchy. Leave empty for regular users.
              </p>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors ${
                      errors.password 
                        ? 'border-red-500 dark:border-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Icon icon={showPassword ? "ph:eye-slash" : "ph:eye"} className="w-5 h-5" />
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors ${
                    errors.confirmPassword 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Generate Password Button */}
            <div>
              <Button
                type="button"
                text="Generate Secure Password"
                icon="ph:key"
                onClick={generatePassword}
                disabled={loading}
                className="btn btn-outline-primary"
              />
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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                disabled={loading}
              >
                <option value="">No employee selected</option>
                {availableEmployees.map((employee) => (
                  <option key={employee.employee_id} value={employee.employee_id}>
                    {employee.name} {employee.job_title && `- ${employee.job_title}`} {employee.department_name && `(${employee.department_name})`}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Linking to an employee provides additional profile information
              </p>
            </div>
            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                text="Cancel"
                onClick={onClose}
                disabled={loading}
                className="btn btn-outline-secondary"
              />
              <Button
                type="submit"
                text={loading ? "Creating..." : "Create User"}
                icon={loading ? null : "ph:plus"}
                disabled={loading}
                isLoading={loading}
                className="btn btn-primary"
              />
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default UserCreationModal; 