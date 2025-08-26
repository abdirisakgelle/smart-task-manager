import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

const PasswordResetModal = ({ user, onUpdate, onClose }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
    setConfirmPassword(result);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
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
    await onUpdate(user.user_id, password);
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    if (field === 'password') {
      setPassword(value);
    } else if (field === 'confirmPassword') {
      setConfirmPassword(value);
    }

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="max-w-md w-full mx-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Reset User Password
            </h3>
            <Button
              icon="ph:x"
              onClick={onClose}
              disabled={loading}
              className="btn btn-sm btn-outline h-8 w-8 p-0"
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center mb-3">
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.username}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {user.employee_name ? `Employee: ${user.employee_name}` : 'No employee linked'}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
              <div className="flex items-start">
                <Icon icon="ph:info" className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Password Reset
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    The user will need to use this new password to log in. Make sure to communicate the new password securely.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password *
              </label>
              <Button
                type="button"
                text="Generate"
                icon="ph:sparkle"
                onClick={generatePassword}
                disabled={loading}
                className="btn btn-sm btn-outline-primary"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white ${
                  errors.password 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter new password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={loading}
              >
                <Icon 
                  icon={showPassword ? "ph:eye-slash" : "ph:eye"} 
                  className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" 
                />
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white ${
                  errors.confirmPassword 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Confirm new password"
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Password Requirements
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Minimum 6 characters</li>
                <li>• Can include letters, numbers, and symbols</li>
                <li>• Should be communicated securely to the user</li>
                <li>• User should change password on first login</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                text="Cancel"
                onClick={onClose}
                disabled={loading}
                className="btn btn-outline-secondary"
              />
              <Button
                type="submit"
                text={loading ? "Resetting..." : "Reset Password"}
                icon={loading ? "ph:arrow-path" : "ph:key"}
                disabled={loading || !password || !confirmPassword}
                isLoading={loading}
                className="btn btn-primary min-w-[120px]"
              />
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default PasswordResetModal; 