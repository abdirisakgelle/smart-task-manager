import React, { useState } from "react";
import InputGroup from "@/components/ui/InputGroup";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import Checkbox from "@/components/ui/Checkbox";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useLoginMutation } from "@/store/api/auth/authApiSlice";
import { setUser } from "@/store/api/auth/authSlice";

const schema = yup
  .object({
    username: yup.string().required("Username is Required"),
    password: yup.string().required("Password is Required"),
  })
  .required();

const LoginForm = () => {
  console.log("LoginForm rendered"); // Debug: confirm component renders
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const {
    register,
    reset,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "all",
  });
  const navigate = useNavigate();
  
  const onSubmit = async (data) => {
    console.log("onSubmit called", data); // Debug: confirm form submission
    try {
      console.log("Calling login mutation");
      const response = await login({ username: data.username, password: data.password });
      console.log("Login mutation response", response); // Debug: confirm mutation result
      
      if (response.error) {
        const errorMessage = response.error.data?.error || 
                           response.error.message || 
                           'Login failed. Please check your credentials.';
        throw new Error(errorMessage);
      }
      
      if (!response.data || !response.data.token) {
        throw new Error("Invalid response from server");
      }
      
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      dispatch(setUser(response.data.user));
      
      // Show success message
      toast.success(`Welcome back, ${response.data.user.username}!`);
      
      // Navigate to dashboard
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || 'Login failed. Please try again.');
    }
  };
  
  const [checked, setChecked] = useState(false);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
      <InputGroup
        name="username"
        type="text"
        label="Username"
        placeholder="Enter your username"
        register={register}
        error={errors.username}
        merged
        disabled={isLoading}
      />
      <InputGroup
        name="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        prepend={<Icon icon="ph:lock-simple" />}
        register={register}
        error={errors.password}
        merged
        disabled={isLoading}
      />
      <div className="flex justify-between">
        <Checkbox
          value={checked}
          onChange={() => setChecked(!checked)}
          label="Remember me"
        />
        <Link
          to="/forgot-password"
          className="text-sm text-gray-400 dark:text-gray-400 hover:text-indigo-500 hover:underline  "
        >
          Forgot Password?
        </Link>
      </div>
      <Button
        type="submit"
        text="Sign in"
        className="btn btn-primary block w-full text-center "
        isLoading={isLoading}
      />
      
      {/* Demo credentials info */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
          Demo Credentials:
        </p>
        <div className="text-xs text-blue-500 dark:text-blue-300 space-y-1">
          <p>Admin: admin / admin123</p>
          <p>User: user / user123</p>
          <p>Manager: manager / manager123</p>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
