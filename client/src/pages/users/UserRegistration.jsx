import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import InputGroup from "@/components/ui/InputGroup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { getApiUrl } from "@/utils/apiUtils";

const schema = yup
  .object({
    username: yup.string().required("Username is Required").min(3, "Username must be at least 3 characters"),
    password: yup.string().required("Password is Required").min(6, "Password must be at least 6 characters"),
    confirmPassword: yup.string().oneOf([yup.ref("password"), null], "Passwords must match"),
    role: yup.string().required("Role is Required"),
    employee_id: yup.number().nullable(),
  })
  .required();

const UserRegistration = ({ onUserCreated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "all",
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${getApiUrl()}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
          role: data.role,
          employee_id: data.employee_id || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const result = await response.json();
      toast.success(`User ${data.username} created successfully!`);
      reset();
      setShowForm(false);
      
      // Callback to refresh user list
      if (onUserCreated) {
        onUserCreated();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          User Registration
        </h3>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant="outline"
          size="sm"
        >
          {showForm ? 'Cancel' : 'Add New User'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              name="username"
              type="text"
              label="Username"
              placeholder="Enter username"
              register={register}
              error={errors.username}
              merged
              disabled={isLoading}
            />
            
            <div>
              <label className="form-label">Role</label>
              <select
                {...register("role")}
                className="form-control py-2"
                disabled={isLoading}
              >
                <option value="">Select Role</option>
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && (
                <span className="text-red-500 text-sm">{errors.role.message}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              name="password"
              type="password"
              label="Password"
              placeholder="Enter password"
              register={register}
              error={errors.password}
              merged
              disabled={isLoading}
            />
            
            <InputGroup
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Confirm password"
              register={register}
              error={errors.confirmPassword}
              merged
              disabled={isLoading}
            />
          </div>

          <InputGroup
            name="employee_id"
            type="number"
            label="Employee ID (Optional)"
            placeholder="Enter employee ID"
            register={register}
            error={errors.employee_id}
            merged
            disabled={isLoading}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={() => {
                setShowForm(false);
                reset();
              }}
              variant="outline"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              text="Create User"
              className="btn-primary"
              isLoading={isLoading}
            />
          </div>
        </form>
      )}

      {!showForm && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Click "Add New User" to create a new user account</p>
        </div>
      )}
    </Card>
  );
};

export default UserRegistration; 