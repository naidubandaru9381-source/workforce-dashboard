"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Employee } from "@/types/employee";
import {
  employeeSchema,
  type EmployeeFormValues,
} from "@/lib/validation/employee.schema";

interface EditEmployeePanelProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: EmployeeFormValues) => Promise<void>;
  isSaving: boolean;
  serverErrors?: Record<string, string>;
}

export default function EditEmployeePanel({
  employee,
  isOpen,
  onClose,
  onSave,
  isSaving,
  serverErrors = {},
}: EditEmployeePanelProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      department: "",
      designation: "",
      status: "active",
      joinDate: "",
      salary: 0,
    },
  });

  useEffect(() => {
    if (!employee) {
      return;
    }

    reset({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      designation: employee.designation,
      status: employee.status,
      joinDate: employee.joinDate,
      salary: employee.salary,
    });
  }, [employee, reset]);

  useEffect(() => {
    Object.entries(serverErrors).forEach(
      ([field, message]) => {
        setError(field as keyof EmployeeFormValues, {
          type: "server",
          message,
        });
      },
    );
  }, [serverErrors, setError]);

  if (!isOpen || !employee) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-employee-title"
    >
      <button
        type="button"
        aria-label="Close edit employee panel"
        className="absolute inset-0 h-full w-full bg-black/40"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2
              id="edit-employee-title"
              className="text-xl font-semibold text-gray-900"
            >
              Edit Employee
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Update {employee.firstName} {employee.lastName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSave)}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              label="First Name"
              error={errors.firstName?.message}
            >
              <input
                {...register("firstName")}
                className="form-input"
                placeholder="First name"
              />
            </FormField>

            <FormField
              label="Last Name"
              error={errors.lastName?.message}
            >
              <input
                {...register("lastName")}
                className="form-input"
                placeholder="Last name"
              />
            </FormField>
          </div>

          <FormField
            label="Email"
            error={errors.email?.message}
          >
            <input
              type="email"
              {...register("email")}
              className="form-input"
              placeholder="Email"
            />
          </FormField>

          <FormField
            label="Phone"
            error={errors.phone?.message}
          >
            <input
              {...register("phone")}
              className="form-input"
              placeholder="Phone number"
            />
          </FormField>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              label="Department"
              error={errors.department?.message}
            >
              <input
                {...register("department")}
                className="form-input"
                placeholder="Department"
              />
            </FormField>

            <FormField
              label="Designation"
              error={errors.designation?.message}
            >
              <input
                {...register("designation")}
                className="form-input"
                placeholder="Designation"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              label="Status"
              error={errors.status?.message}
            >
              <select
                {...register("status")}
                className="form-input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </FormField>

            <FormField
              label="Join Date"
              error={errors.joinDate?.message}
            >
              <input
                type="date"
                {...register("joinDate")}
                className="form-input"
              />
            </FormField>
          </div>

          <FormField
            label="Salary"
            error={errors.salary?.message}
          >
            <input
              type="number"
              step="0.01"
              {...register("salary", {
                valueAsNumber: true,
              })}
              className="form-input"
              placeholder="Salary"
            />
          </FormField>

          <div className="flex justify-end gap-3 border-t pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function FormField({
  label,
  error,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>

      {children}

      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}