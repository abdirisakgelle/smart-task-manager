import React, { useEffect, useState } from "react";
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
import { initializePermissions } from "@/utils/permissionUtils";

const schema = yup
  .object({
    username: yup.string().required("Username is Required"),
    password: yup.string().required("Password is Required"),
  })
  .required();

const LoginForm = () => {
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
    try {
      const response = await login({ username: data.username, password: data.password });
      
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
      
      // Initialize user permissions after successful login
      try {
        await initializePermissions(response.data.user.user_id);
        console.log('Permissions initialized successfully');
      } catch (permError) {
        console.error('Error initializing permissions:', permError);
        // Don't block login if permission initialization fails
        toast.warning('Login successful, but permission loading failed. Some features may be limited.');
      }
      
      // Show success message
      toast.success(`Welcome back, ${response.data.user.username}!`);
      
      // Navigate to correct dashboard based on system_role
      const role = response.data.user.system_role || response.data.user.role;
      if (role === 'admin') {
        navigate('/dashboard/admin');
      } else if (role === 'ceo') {
        navigate('/dashboard/admin');
      } else if (role === 'media') {
        navigate('/dashboard/content');
      } else {
        navigate('/dashboard'); // Fallback for any other roles
      }
      
    } catch (error) {
      toast.error(error.message || 'Login failed. Please try again.');
    }
  };
  
  const [checked, setChecked] = useState(false);
  const [demo, setDemo] = useState({ admin: [], media: [], agent: [] });

  useEffect(() => {
    const loadDemo = async () => {
      try {
        const res = await fetch('/api/users/demo-credentials');
        if (!res.ok) return;
        const data = await res.json();
        setDemo({
          admin: data.roles?.admin || [],
          media: data.roles?.media || [],
          agent: data.roles?.agent || []
        });
      } catch (e) {
        // ignore; keep static fallback
      }
    };
    loadDemo();
  }, []);
  
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
      
      {/* Test Dashboard Credentials */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
          Test Different Dashboards:
        </p>
        <div className="text-xs text-blue-500 dark:text-blue-300 space-y-1">
          {demo.admin.map((u, i) => (
            <p key={`admin-${i}`}><strong>Admin Dashboard:</strong> {u.username} {u.demoPassword ? `/ ${u.demoPassword}` : ''}</p>
          ))}
          {demo.agent.map((u, i) => (
            <p key={`agent-${i}`}><strong>Support Dashboard:</strong> {u.username} {u.demoPassword ? `/ ${u.demoPassword}` : ''}</p>
          ))}
          {demo.media.map((u, i) => (
            <p key={`media-${i}`}><strong>Content Dashboard:</strong> {u.username} {u.demoPassword ? `/ ${u.demoPassword}` : ''}</p>
          ))}
        </div>
      </div>
      
      {/* Additional Test Users */}
      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">
          Additional Test Users:
        </p>
        <div className="text-xs text-green-500 dark:text-green-300 space-y-1">
          <p><strong>Regular User:</strong> user1 / user123</p>
          <p><strong>Regular User:</strong> user2 / user123</p>
          <p><strong>Test Agent:</strong> testagent / test123</p>
          <p><strong>Test Media:</strong> testmedia / test123</p>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
