"use client";

import { useState } from "react";
import LeaveRequestForm from "@/components/leave/LeaveRequestForm";
import {
    useGetLeaveRequestsQuery,
    useGetLeaveBalanceQuery,
    useReviewLeaveRequestMutation,
} from "@/features/leave/leaveApi";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function LeavePage() {
const employeeId = "employee-1";

    const {
        data: leaveBalance,
        isLoading: isBalanceLoading,
    } = useGetLeaveBalanceQuery(employeeId);

    const [statusFilter, setStatusFilter] =
        useState<StatusFilter>("all");

    const [reviewError, setReviewError] = useState<string | null>(
        null,
    );

    const {
        data,
        isLoading,
        isError,
        refetch,
    } = useGetLeaveRequestsQuery(
        statusFilter === "all"
            ? {}
            : { status: statusFilter },
    );

    const [reviewLeaveRequest, { isLoading: isReviewing }] =
        useReviewLeaveRequestMutation();

    const leaveRequests = data?.data ?? [];

    const totalRequests = data?.total ?? 0;

    const pendingRequests = leaveRequests.filter(
        (request) => request.status === "pending",
    ).length;

    const approvedRequests = leaveRequests.filter(
        (request) => request.status === "approved",
    ).length;

    const handleReview = async (
        id: string,
        status: "approved" | "rejected",
    ) => {
        setReviewError(null);

        try {
            await reviewLeaveRequest({
                id,
                status,
            }).unwrap();

            await refetch();
        } catch (error) {
            console.error(
                "Failed to review leave request:",
                error,
            );

            const errorStatus =
                typeof error === "object" &&
                    error !== null &&
                    "status" in error
                    ? error.status
                    : undefined;

            if (errorStatus === 409) {
                setReviewError(
                    "This leave request has already been processed by another manager. The latest status has been refreshed.",
                );

                await refetch();

                return;
            }

            setReviewError(
                "Unable to update the leave request. Please try again.",
            );
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Leave Management
                </h1>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Request leave and manage employee leave requests.
                </p>
            </div>

            {/* Conflict / Review Error */}
            {reviewError && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
                >
                    <div className="flex items-start justify-between gap-4">
                        <p>{reviewError}</p>

                        <button
                            type="button"
                            onClick={() => setReviewError(null)}
                            className="font-semibold text-red-700 hover:text-red-900 dark:text-red-300 dark:hover:text-red-100"
                            aria-label="Dismiss error"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Requests
                    </p>

                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                        {totalRequests}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Pending
                    </p>

                    <p className="mt-2 text-3xl font-bold text-yellow-600">
                        {pendingRequests}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Approved
                    </p>

                    <p className="mt-2 text-3xl font-bold text-green-600">
                        {approvedRequests}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Available Balance
                    </p>

                    <p>
                        {isBalanceLoading
                            ? "..."
                            : leaveBalance?.remainingBalance ?? 0}
                    </p>
                </div>
            </div>

            {/* Request Leave Form */}
            <LeaveRequestForm
                employeeId="employee-1"
                availableBalance={leaveBalance?.remainingBalance ?? 0}
                onSuccess={() => {
                    refetch();
                }}
            />

            {/* Leave Requests */}
            <div className="rounded-xl border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                {/* Table Header */}
                <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Leave Requests
                        </h2>

                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Review and manage submitted leave requests.
                        </p>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label
                            htmlFor="status-filter"
                            className="sr-only"
                        >
                            Filter by status
                        </label>

                        <select
                            id="status-filter"
                            value={statusFilter}
                            onChange={(event) => {
                                setReviewError(null);

                                setStatusFilter(
                                    event.target.value as StatusFilter,
                                );
                            }}
                            className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="p-10 text-center">
                        <p className="text-sm text-gray-500">
                            Loading leave requests...
                        </p>
                    </div>
                )}

                {/* Error */}
                {isError && !isLoading && (
                    <div className="p-10 text-center">
                        <p className="text-sm text-red-600">
                            Failed to load leave requests.
                        </p>

                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading &&
                    !isError &&
                    leaveRequests.length === 0 && (
                        <div className="p-10 text-center">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                No leave requests found.
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                Try changing the status filter or submit a new
                                leave request.
                            </p>
                        </div>
                    )}

                {/* Desktop Table */}
                {!isLoading &&
                    !isError &&
                    leaveRequests.length > 0 && (
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300">
                                            Employee
                                        </th>

                                        <th className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300">
                                            Start Date
                                        </th>

                                        <th className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300">
                                            End Date
                                        </th>

                                        <th className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300">
                                            Days
                                        </th>

                                        <th className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300">
                                            Reason
                                        </th>

                                        <th className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300">
                                            Status
                                        </th>

                                        <th className="px-5 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y dark:divide-gray-700">
                                    {leaveRequests.map((request) => (
                                        <tr
                                            key={request.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">
                                                {request.employeeId}
                                            </td>

                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                                                {request.startDate}
                                            </td>

                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                                                {request.endDate}
                                            </td>

                                            <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                                                {request.days}
                                            </td>

                                            <td className="max-w-xs truncate px-5 py-4 text-gray-600 dark:text-gray-300">
                                                {request.reason}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${request.status === "pending"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : request.status === "approved"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}
                                                >
                                                    {request.status}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                {request.status === "pending" ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            disabled={isReviewing}
                                                            onClick={() =>
                                                                handleReview(
                                                                    request.id,
                                                                    "approved",
                                                                )
                                                            }
                                                            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {isReviewing
                                                                ? "Updating..."
                                                                : "Approve"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            disabled={isReviewing}
                                                            onClick={() =>
                                                                handleReview(
                                                                    request.id,
                                                                    "rejected",
                                                                )
                                                            }
                                                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {isReviewing
                                                                ? "Updating..."
                                                                : "Reject"}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">
                                                        Reviewed
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                {/* Mobile Cards */}
                {!isLoading &&
                    !isError &&
                    leaveRequests.length > 0 && (
                        <div className="space-y-4 p-4 md:hidden">
                            {leaveRequests.map((request) => (
                                <div
                                    key={request.id}
                                    className="rounded-lg border p-4 dark:border-gray-700"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {request.employeeId}
                                            </p>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {request.startDate} →{" "}
                                                {request.endDate}
                                            </p>
                                        </div>

                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${request.status === "pending"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : request.status === "approved"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {request.status}
                                        </span>
                                    </div>

                                    <div className="mt-4 space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium">
                                                Days:
                                            </span>{" "}
                                            {request.days}
                                        </div>

                                        <div>
                                            <span className="font-medium">
                                                Reason:
                                            </span>{" "}
                                            {request.reason}
                                        </div>
                                    </div>

                                    {request.status === "pending" && (
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                type="button"
                                                disabled={isReviewing}
                                                onClick={() =>
                                                    handleReview(
                                                        request.id,
                                                        "approved",
                                                    )
                                                }
                                                className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {isReviewing
                                                    ? "Updating..."
                                                    : "Approve"}
                                            </button>

                                            <button
                                                type="button"
                                                disabled={isReviewing}
                                                onClick={() =>
                                                    handleReview(
                                                        request.id,
                                                        "rejected",
                                                    )
                                                }
                                                className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {isReviewing
                                                    ? "Updating..."
                                                    : "Reject"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
            </div>
        </div>
    );
}