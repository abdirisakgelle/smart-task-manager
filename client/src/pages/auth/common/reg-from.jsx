import React, { useState } from "react";
import InputGroup from "@/components/ui/InputGroup";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import Checkbox from "@/components/ui/Checkbox";
import { useRegisterUserMutation } from "@/store/api/auth/authApiSlice";
import { toast } from "react-toastify";

const schema = yup
  .object({
    username: yup.string().required("Username is Required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(20, "Password shouldn't be more than 20 characters")
      .required("Please enter password"),
    confirmpassword: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match"),
    role: yup.string().required("Role is Required"),
  })
  .required();

const RegForm = () => {
  const [registerUser, { isLoading, isError, error, isSuccess }] =
    useRegisterUserMutation();

  const [checked, setChecked] = useState(false);
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "all",
  });

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await registerUser({
        username: data.username,
        password: data.password,
        role: data.role
      });
      
      if (response.error) {
        throw new Error(response.error.data?.error || response.error.message || 'Registration failed');
      }
      
      reset();
      navigate("/");
      toast.success("Registration Successful! Please login.");
    } catch (error) {
      console.log(error);
      const errorMessage = error.message || "An error occurred. Please try again later.";
      toast.error(errorMessage);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 ">
      <InputGroup
        name="username"
        type="text"
        prepend={<Icon icon="ph:user" />}
        placeholder="Enter your username"
        register={register}
        error={errors.username}
        disabled={isLoading}
        merged
      />
      <InputGroup
        name="password"
        type="password"
        prepend={<Icon icon="ph:lock-simple" />}
        placeholder="Enter your password"
        register={register}
        error={errors.password}
        merged
        disabled={isLoading}
      />
      <InputGroup
        name="confirmpassword"
        type="password"
        prepend={<Icon icon="ph:lock-simple" />}
        placeholder="Confirm your password"
        register={register}
        error={errors.confirmpassword}
        merged
        disabled={isLoading}
      />
      <InputGroup
        name="role"
        type="text"
        prepend={<Icon icon="ph:user-circle" />}
        placeholder="Enter your role (e.g., admin, user)"
        register={register}
        error={errors.role}
        merged
        disabled={isLoading}
      />
      <Checkbox
        label="I agree with privacy policy"
        value={checked}
        onChange={() => setChecked(!checked)}
      />

      <Button
        type="submit"
        text="Create an account"
        className="btn btn-primary block w-full text-center "
        isLoading={isLoading}
      />
    </form>
  );
};

export default RegForm;
