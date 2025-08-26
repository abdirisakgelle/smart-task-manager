import React, { useState, useEffect } from "react";
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
    name: yup.string().required("Employee name is required").min(2, "Name must be at least 2 characters"),
    shift: yup.string().required("Shift is required"),
    phone: yup.string().required("Phone number is required"),
    department_id: yup.number().nullable().transform((value) => (isNaN(value) || value === "" ? null : value)).required("Department is required"),
    section_id: yup.number().nullable().transform((value) => (isNaN(value) || value === "" ? null : value)).required("Section is required"),
    unit_title: yup.string().required("Unit title is required").min(2, "Unit title must be at least 2 characters"),
  })
  .required();

const EmployeeRegistration = ({ onEmployeeCreated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(true); // Always show form by default
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [generatedJobTitle, setGeneratedJobTitle] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "all",
    defaultValues: {
      name: "",
      shift: "",
      phone: "",
      department_id: null,
      section_id: null,
      unit_title: "",
    },
  });

  // Watch form values for cascading updates
  const watchedDepartment = watch("department_id");
  const watchedSection = watch("section_id");
  const watchedUnitTitle = watch("unit_title");

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Fetch sections when department changes
  useEffect(() => {
    if (watchedDepartment) {
      fetchSections(watchedDepartment);
      setValue("section_id", null);
      setValue("unit_title", "");
      setSections([]);
      setGeneratedJobTitle("");
    }
  }, [watchedDepartment, setValue]);

  // Generate job title when unit title and section change
  useEffect(() => {
    if (watchedUnitTitle && watchedSection && sections.length > 0) {
      const selectedSection = sections.find(section => section.section_id === parseInt(watchedSection));
      
      if (selectedSection) {
        const jobTitle = `${watchedUnitTitle} – ${selectedSection.name}`;
        setGeneratedJobTitle(jobTitle);
      }
    } else {
      setGeneratedJobTitle("");
    }
  }, [watchedUnitTitle, watchedSection, sections]);

  const fetchDepartments = async () => {
    try {
      console.log('🔍 Fetching departments...');
      const response = await fetch('/api/departments');

      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }

      const data = await response.json();
      console.log('✅ Departments loaded:', data);
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    }
  };

  const fetchSections = async (departmentId) => {
    try {
      console.log('🔍 Fetching sections for department:', departmentId);
      const response = await fetch(`/api/sections/department/${departmentId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch sections');
      }

      const data = await response.json();
      console.log('✅ Sections loaded:', data);
      setSections(data);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast.error('Failed to load sections');
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      console.log('🔍 Submitting employee registration:', data);
      
      // First, create the unit in the units table
      const unitResponse = await fetch('/api/units', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.unit_title,
          section_id: data.section_id
        })
      });

      if (!unitResponse.ok) {
        const errorData = await unitResponse.json();
        throw new Error(errorData.error || 'Failed to create unit');
      }

      const unitResult = await unitResponse.json();
      console.log('✅ Unit created:', unitResult);

      // Then register the employee with the new unit_id
      const employeeResponse = await fetch('/api/employees/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          shift: data.shift,
          phone: data.phone,
          unit_id: unitResult.unit_id
        })
      });

      if (!employeeResponse.ok) {
        const errorData = await employeeResponse.json();
        throw new Error(errorData.error || 'Failed to register employee');
      }

      const result = await employeeResponse.json();
      toast.success(`Employee ${data.name} registered successfully with job title: ${result.job_title}!`);
      reset({
        name: "",
        shift: "",
        phone: "",
        department_id: null,
        section_id: null,
        unit_title: "",
      });
      setGeneratedJobTitle("");
      
      // Callback to refresh employee list
      if (onEmployeeCreated) {
        onEmployeeCreated();
      }
    } catch (error) {
      console.error('Error registering employee:', error);
      toast.error(error.message || 'Failed to register employee');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Employee Registration
        </h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              name="name"
              type="text"
              label="Employee Name"
              placeholder="Enter employee name"
              register={register}
              error={errors.name}
              merged
              disabled={isLoading}
            />
            
            <div>
              <label className="form-label">Shift</label>
              <select
                {...register("shift")}
                className="form-control py-2"
                disabled={isLoading}
              >
                <option value="">Select Shift</option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
              {errors.shift && (
                <span className="text-red-500 text-sm">{errors.shift.message}</span>
              )}
            </div>
          </div>

          <InputGroup
            name="phone"
            type="text"
            label="Phone Number"
            placeholder="Enter phone number"
            register={register}
            error={errors.phone}
            merged
            disabled={isLoading}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Department</label>
              <select
                {...register("department_id")}
                className="form-control py-2"
                disabled={isLoading}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.department_id} value={dept.department_id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.department_id && (
                <span className="text-red-500 text-sm">{errors.department_id.message}</span>
              )}
            </div>

            <div>
              <label className="form-label">Section</label>
              <select
                {...register("section_id")}
                className="form-control py-2"
                disabled={isLoading || !watchedDepartment}
              >
                <option value="">Select Section</option>
                {sections.map((section) => (
                  <option key={section.section_id} value={section.section_id}>
                    {section.name}
                  </option>
                ))}
              </select>
              {errors.section_id && (
                <span className="text-red-500 text-sm">{errors.section_id.message}</span>
              )}
            </div>

            <div>
              <label className="form-label">Unit Title</label>
              <input
                {...register("unit_title")}
                type="text"
                className="form-control py-2"
                placeholder="Enter unit title"
                disabled={isLoading || !watchedSection}
              />
              {errors.unit_title && (
                <span className="text-red-500 text-sm">{errors.unit_title.message}</span>
              )}
            </div>
          </div>

          {generatedJobTitle && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <label className="form-label text-blue-800 dark:text-blue-200">Generated Job Title</label>
              <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {generatedJobTitle}
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                This job title will be automatically assigned to the employee
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="submit"
              text="Register Employee"
              className="btn-primary"
              isLoading={isLoading}
            />
          </div>
        </form>
      </Card>
    );
  };

  export default EmployeeRegistration; 