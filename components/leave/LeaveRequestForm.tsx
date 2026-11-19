"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm ,useWatch} from "react-hook-form";
import { z } from "zod";

import {
  useCreateLeaveRequestMutation,
  useGetHolidaysQuery,
} from "@/features/leave/leaveApi";
import { calculateWorkingDays } from "@/lib/utils/workingDays";

const leaveSchema = z
  .object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    reason: z
      .string()
      .min(5, "Reason must be at least 5 characters")
      .max(500, "Reason cannot exceed 500 characters"),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

type LeaveFormValues = z.infer<typeof leaveSchema>;

interface LeaveRequestFormProps {
  employeeId: string;
  availableBalance?: number;
  onSuccess?: () => void;
}

export default function LeaveRequestForm({
  employeeId,
  availableBalance = 20,
  onSuccess,
}: LeaveRequestFormProps) {
  const {
    data: holidays = [],
    isLoading: holidaysLoading,
  } = useGetHolidaysQuery();

  const [createLeaveRequest, { isLoading: isSubmitting }] =
    useCreateLeaveRequestMutation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      reason: "",
    },
  });
const startDate = useWatch({
  control,
  name: "startDate",
});

const endDate = useWatch({
  control,
  name: "endDate",
});

  const requestedDays = calculateWorkingDays(
    startDate,
    endDate,
    holidays,
  );

  const remainingBalance = Math.max(
    availableBalance - requestedDays,
    0,
  );

  const onSubmit = async (values: LeaveFormValues) => {
    try {
      await createLeaveRequest({
        employeeId,
        startDate: values.startDate,
        endDate: values.endDate,
        reason: values.reason,
        days: requestedDays,
      }).unwrap();

      reset();
      onSuccess?.();
    } catch (error) {
      console.error("Leave request failed:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900"
    >
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Request Leave
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Select your leave dates and provide a reason.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="startDate"
            className="mb-2 block text-sm font-medium"
          >
            Start Date
          </label>

          <input
            id="startDate"
            type="date"
            {...register("startDate")}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.startDate.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="endDate"
            className="mb-2 block text-sm font-medium"
          >
            End Date
          </label>

          <input
            id="endDate"
            type="date"
            {...register("endDate")}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="reason"
          className="mb-2 block text-sm font-medium"
        >
          Reason
        </label>

        <textarea
          id="reason"
          rows={4}
          {...register("reason")}
          placeholder="Enter the reason for your leave..."
          className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />

        {errors.reason && (
          <p className="mt-1 text-sm text-red-600">
            {errors.reason.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <p className="text-sm text-gray-500">
            Working Days
          </p>

          <p className="mt-1 text-2xl font-bold">
            {requestedDays}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <p className="text-sm text-gray-500">
            Available Balance
          </p>

          <p className="mt-1 text-2xl font-bold">
            {availableBalance}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <p className="text-sm text-gray-500">
            Balance After Request
          </p>

          <p
            className={`mt-1 text-2xl font-bold ${
              remainingBalance < 0
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {remainingBalance}
          </p>
        </div>
      </div>

      {holidaysLoading && (
        <p className="text-sm text-gray-500">
          Loading holidays...
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || requestedDays === 0}
        className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit Leave Request"}
      </button>
    </form>
  );
}