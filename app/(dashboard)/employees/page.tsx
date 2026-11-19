"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import EditEmployeePanel from "@/components/employees/EditEmployeePanel";
import RoleGuard from "@/features/auth/RoleGuard";
import {
    useBulkUpdateStatusMutation,
    useGetEmployeesQuery,
    useUpdateEmployeeMutation,
} from "@/features/employees/employeeApi";
import { useDebounce } from "@/features/employees/hooks/useDebounce";
import type { EmployeeFormValues } from "@/lib/validation/employee.schema";
import type { Employee } from "@/types/employee";

interface SortField {
    field: string;
    direction: "asc" | "desc";
}

interface SortableHeaderProps {
    label: string;
    field: string;
    sortFields: SortField[];
    onSort: (field: string) => void;
}

export default function EmployeesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // -----------------------------
    // Selection / Bulk Actions
    // -----------------------------

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkError, setBulkError] = useState<string | null>(null);

    const [bulkProgress, setBulkProgress] = useState<{
        completed: number;
        total: number;
    } | null>(null);

    // -----------------------------
    // Edit Employee
    // -----------------------------

    const [editingEmployee, setEditingEmployee] =
        useState<Employee | null>(null);

    const [serverErrors, setServerErrors] = useState<
        Record<string, string>
    >({});

    // -----------------------------
    // API mutations
    // -----------------------------

    const [bulkUpdateStatus, { isLoading: isBulkUpdating }] =
        useBulkUpdateStatusMutation();

    const [updateEmployee, { isLoading: isUpdatingEmployee }] =
        useUpdateEmployeeMutation();

    // -----------------------------
    // URL state
    // -----------------------------

    const page = Number(searchParams.get("page") ?? "1");

    const pageSize = Number(
        searchParams.get("pageSize") ?? "10",
    );

    // -----------------------------
    // Filters
    // -----------------------------

    const [searchInput, setSearchInput] = useState(
        searchParams.get("search") ?? "",
    );

    const [department, setDepartment] = useState(
        searchParams.get("department") ?? "",
    );

    const [status, setStatus] = useState(
        searchParams.get("status") ?? "",
    );

    const [joinDateFrom, setJoinDateFrom] = useState(
        searchParams.get("joinDateFrom") ?? "",
    );

    const [joinDateTo, setJoinDateTo] = useState(
        searchParams.get("joinDateTo") ?? "",
    );

    // -----------------------------
    // Multi-column sorting
    // -----------------------------

    const [sortFields, setSortFields] = useState<SortField[]>(
        () => {
            const sortParam = searchParams.get("sort");

            if (!sortParam) {
                return [
                    {
                        field: "firstName",
                        direction: "asc",
                    },
                ];
            }

            return sortParam
                .split(",")
                .map((item) => {
                    const [field, direction] = item.split(":");

                    return {
                        field,
                        direction:
                            direction === "desc"
                                ? "desc"
                                : "asc",
                    };
                })
                .filter((item) => item.field);
        },
    );

    const debouncedSearch = useDebounce(
        searchInput,
        400,
    );

    // -----------------------------
    // Employees API
    // -----------------------------

    const {
        data,
        isLoading,
        isError,
        error,
    } = useGetEmployeesQuery({
        page,
        pageSize,
        search: debouncedSearch || undefined,
        department: department || undefined,
        status: status || undefined,
        joinDateFrom: joinDateFrom || undefined,
        joinDateTo: joinDateTo || undefined,
        sort: sortFields,
    });

    // -----------------------------
    // Employee Selection
    // -----------------------------

    const toggleEmployeeSelection = (
        employeeId: string,
    ) => {
        setSelectedIds((current) =>
            current.includes(employeeId)
                ? current.filter(
                    (id) => id !== employeeId,
                )
                : [...current, employeeId],
        );
    };

    const toggleSelectAll = () => {
        const currentPageIds =
            data?.data.map(
                (employee) => employee.id,
            ) ?? [];

        const allSelected =
            currentPageIds.length > 0 &&
            currentPageIds.every((id) =>
                selectedIds.includes(id),
            );

        if (allSelected) {
            setSelectedIds((current) =>
                current.filter(
                    (id) =>
                        !currentPageIds.includes(id),
                ),
            );
        } else {
            setSelectedIds((current) => [
                ...new Set([
                    ...current,
                    ...currentPageIds,
                ]),
            ]);
        }
    };

    // -----------------------------
    // Bulk Deactivate
    // -----------------------------

    const handleBulkDeactivate = async () => {
        if (selectedIds.length === 0) {
            return;
        }

        setBulkError(null);

        setBulkProgress({
            completed: 0,
            total: selectedIds.length,
        });

        try {
            const response =
                await bulkUpdateStatus({
                    employeeIds: selectedIds,
                    status: "inactive",
                }).unwrap();

            const failed =
                response.results.filter(
                    (result) => !result.success,
                );

            if (failed.length > 0) {
                setBulkError(
                    `${failed.length} employee(s) could not be updated.`,
                );
            }

            const successfulIds =
                response.results
                    .filter(
                        (result) => result.success,
                    )
                    .map(
                        (result) =>
                            result.employeeId,
                    );

            setSelectedIds((current) =>
                current.filter(
                    (id) =>
                        !successfulIds.includes(id),
                ),
            );

            setBulkProgress({
                completed:
                    response.results.length,
                total: selectedIds.length,
            });

            setTimeout(() => {
                setBulkProgress(null);
            }, 1500);
        } catch {
            setBulkError(
                "Bulk update failed. Please try again.",
            );

            setBulkProgress(null);
        }
    };

    // -----------------------------
    // Edit Employee
    // -----------------------------

    const handleEditEmployee = (
        employee: Employee,
    ) => {
        setEditingEmployee(employee);
        setServerErrors({});
    };

    const handleCloseEdit = () => {
        setEditingEmployee(null);
        setServerErrors({});
    };

    const handleSaveEmployee = async (
        values: EmployeeFormValues,
    ) => {
        if (!editingEmployee) {
            return;
        }

        setServerErrors({});

        try {
            await updateEmployee({
                id: editingEmployee.id,
                data: values,
            }).unwrap();

            setEditingEmployee(null);
            setServerErrors({});
        } catch (error) {
            const apiError = error as {
                status?: number;
                data?: {
                    message?: string;
                    errors?: Record<string, string>;
                };
            };

            if (
                apiError.status === 422 &&
                apiError.data?.errors
            ) {
                setServerErrors(
                    apiError.data.errors,
                );

                return;
            }

            setServerErrors({
                form:
                    apiError.data?.message ??
                    "Unable to update employee. Please try again.",
            });
        }
    };

    // -----------------------------
    // Search
    // -----------------------------

    const updateSearch = (
        value: string,
    ) => {
        setSearchInput(value);

        const params =
            new URLSearchParams(
                searchParams.toString(),
            );

        params.set("page", "1");

        if (value) {
            params.set("search", value);
        } else {
            params.delete("search");
        }

        router.push(
            `/employees?${params.toString()}`,
        );
    };

    // -----------------------------
    // Department
    // -----------------------------

    const updateDepartment = (
        value: string,
    ) => {
        setDepartment(value);

        const params =
            new URLSearchParams(
                searchParams.toString(),
            );

        params.set("page", "1");

        if (value) {
            params.set(
                "department",
                value,
            );
        } else {
            params.delete("department");
        }

        router.push(
            `/employees?${params.toString()}`,
        );
    };

    // -----------------------------
    // Status
    // -----------------------------

    const updateStatus = (
        value: string,
    ) => {
        setStatus(value);

        const params =
            new URLSearchParams(
                searchParams.toString(),
            );

        params.set("page", "1");

        if (value) {
            params.set("status", value);
        } else {
            params.delete("status");
        }

        router.push(
            `/employees?${params.toString()}`,
        );
    };

    // -----------------------------
    // Join Date From
    // -----------------------------

    const updateJoinDateFrom = (
        value: string,
    ) => {
        setJoinDateFrom(value);

        const params =
            new URLSearchParams(
                searchParams.toString(),
            );

        params.set("page", "1");

        if (value) {
            params.set(
                "joinDateFrom",
                value,
            );
        } else {
            params.delete(
                "joinDateFrom",
            );
        }

        router.push(
            `/employees?${params.toString()}`,
        );
    };

    // -----------------------------
    // Join Date To
    // -----------------------------

    const updateJoinDateTo = (
        value: string,
    ) => {
        setJoinDateTo(value);

        const params =
            new URLSearchParams(
                searchParams.toString(),
            );

        params.set("page", "1");

        if (value) {
            params.set(
                "joinDateTo",
                value,
            );
        } else {
            params.delete(
                "joinDateTo",
            );
        }

        router.push(
            `/employees?${params.toString()}`,
        );
    };

    // -----------------------------
    // Multi-column Sorting
    // -----------------------------

    const updateSort = (
        field: string,
    ) => {
        const existingIndex =
            sortFields.findIndex(
                (item) =>
                    item.field === field,
            );

        let updatedSort = [
            ...sortFields,
        ];

        if (existingIndex === -1) {
            updatedSort.push({
                field,
                direction: "asc",
            });
        } else {
            const existing =
                updatedSort[
                existingIndex
                ];

            if (
                existing.direction ===
                "asc"
            ) {
                updatedSort[
                    existingIndex
                ] = {
                    ...existing,
                    direction: "desc",
                };
            } else {
                updatedSort.splice(
                    existingIndex,
                    1,
                );
            }
        }

        if (
            updatedSort.length === 0
        ) {
            updatedSort = [
                {
                    field: "firstName",
                    direction: "asc",
                },
            ];
        }

        setSortFields(updatedSort);

        const params =
            new URLSearchParams(
                searchParams.toString(),
            );

        params.set("page", "1");

        params.set(
            "sort",
            updatedSort
                .map(
                    (item) =>
                        `${item.field}:${item.direction}`,
                )
                .join(","),
        );

        router.push(
            `/employees?${params.toString()}`,
        );
    };

    // -----------------------------
    // Pagination
    // -----------------------------

    const goToPage = (
        nextPage: number,
    ) => {
        const params =
            new URLSearchParams(
                searchParams.toString(),
            );

        params.set(
            "page",
            String(nextPage),
        );

        params.set(
            "pageSize",
            String(pageSize),
        );

        setSelectedIds([]);

        router.push(
            `/employees?${params.toString()}`,
        );
    };

    // -----------------------------
    // Render
    // -----------------------------

    return (
        <RoleGuard
            allowedRoles={[
                "admin",
                "manager",
            ]}
        >
            <main className="min-h-screen p-4 md:p-8">

                {/* Page heading */}

                <div>
                    <h1 className="text-2xl font-bold md:text-3xl">
                        Employees
                    </h1>

                    <p className="mt-1 text-sm text-gray-600 md:text-base">
                        Manage and search employees
                    </p>
                </div>

                {/* Search */}

                <div className="mt-6">
                    <label
                        htmlFor="employee-search"
                        className="mb-2 block text-sm font-medium"
                    >
                        Search employees
                    </label>

                    <input
                        id="employee-search"
                        type="search"
                        value={searchInput}
                        onChange={(event) =>
                            updateSearch(
                                event.target.value,
                            )
                        }
                        placeholder="Search by name, email, employee ID..."
                        className="w-full rounded-lg border px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                </div>

                {/* Filters */}

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:flex lg:flex-wrap">

                    {/* Department */}

                    <div className="min-w-0">
                        <label
                            htmlFor="department"
                            className="mb-2 block text-sm font-medium"
                        >
                            Department
                        </label>

                        <select
                            id="department"
                            value={department}
                            onChange={(event) =>
                                updateDepartment(
                                    event.target.value,
                                )
                            }
                            className="w-full rounded-lg border px-4 py-2 lg:w-auto"
                        >
                            <option value="">
                                All Departments
                            </option>

                            <option value="Engineering">
                                Engineering
                            </option>

                            <option value="Product">
                                Product
                            </option>

                            <option value="Design">
                                Design
                            </option>

                            <option value="Marketing">
                                Marketing
                            </option>

                            <option value="Sales">
                                Sales
                            </option>

                            <option value="HR">
                                HR
                            </option>

                            <option value="Finance">
                                Finance
                            </option>
                        </select>
                    </div>

                    {/* Status */}

                    <div className="min-w-0">
                        <label
                            htmlFor="status"
                            className="mb-2 block text-sm font-medium"
                        >
                            Status
                        </label>

                        <select
                            id="status"
                            value={status}
                            onChange={(event) =>
                                updateStatus(
                                    event.target.value,
                                )
                            }
                            className="w-full rounded-lg border px-4 py-2 lg:w-auto"
                        >
                            <option value="">
                                All Statuses
                            </option>

                            <option value="active">
                                Active
                            </option>

                            <option value="inactive">
                                Inactive
                            </option>
                        </select>
                    </div>

                    {/* Join Date From */}

                    <div className="min-w-0">
                        <label
                            htmlFor="join-date-from"
                            className="mb-2 block text-sm font-medium"
                        >
                            Join Date From
                        </label>

                        <input
                            id="join-date-from"
                            type="date"
                            value={joinDateFrom}
                            onChange={(event) =>
                                updateJoinDateFrom(
                                    event.target.value,
                                )
                            }
                            className="w-full rounded-lg border px-4 py-2 lg:w-auto"
                        />
                    </div>

                    {/* Join Date To */}

                    <div className="min-w-0">
                        <label
                            htmlFor="join-date-to"
                            className="mb-2 block text-sm font-medium"
                        >
                            Join Date To
                        </label>

                        <input
                            id="join-date-to"
                            type="date"
                            value={joinDateTo}
                            onChange={(event) =>
                                updateJoinDateTo(
                                    event.target.value,
                                )
                            }
                            className="w-full rounded-lg border px-4 py-2 lg:w-auto"
                        />
                    </div>
                </div>

                {/* Sorting information */}

                {sortFields.length > 0 && (
                    <div className="mt-4 overflow-x-auto rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
                        <span className="font-medium">
                            Sorted by:
                        </span>{" "}

                        {sortFields.map(
                            (
                                sort,
                                index,
                            ) => (
                                <span
                                    key={sort.field}
                                >
                                    {index > 0 &&
                                        " → "}

                                    {sort.field}{" "}

                                    {sort.direction ===
                                        "asc"
                                        ? "↑"
                                        : "↓"}
                                </span>
                            ),
                        )}
                    </div>
                )}

                {/* Loading */}

                {isLoading && (
                    <p className="mt-6 text-gray-600">
                        Loading employees...
                    </p>
                )}

                {/* Error */}

                {isError && (
                    <pre className="mt-6 overflow-x-auto rounded-lg bg-red-50 p-4 text-sm text-red-600">
                        {JSON.stringify(
                            error,
                            null,
                            2,
                        )}
                    </pre>
                )}

                {/* Results */}

                {data && (
                    <div className="mt-6">

                        {/* Results header */}

                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <p>
                                Total employees:{" "}
                                <strong>
                                    {data.total}
                                </strong>
                            </p>

                            <p className="text-sm text-gray-500">
                                Page {data.page} of{" "}
                                {data.totalPages}
                            </p>
                        </div>

                        {/* Bulk action */}

                        {selectedIds.length > 0 && (
                            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-medium text-blue-900">
                                            {selectedIds.length} employee
                                            {selectedIds.length !== 1
                                                ? "s"
                                                : ""}{" "}
                                            selected
                                        </p>

                                        <p className="text-sm text-blue-700">
                                            Choose an action for the selected employees.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={
                                            handleBulkDeactivate
                                        }
                                        disabled={
                                            isBulkUpdating
                                        }
                                        className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                    >
                                        {isBulkUpdating
                                            ? "Updating..."
                                            : "Deactivate Selected"}
                                    </button>
                                </div>

                                {bulkProgress && (
                                    <div className="mt-4">
                                        <div className="mb-1 flex items-center justify-between text-sm">
                                            <span className="font-medium text-blue-900">
                                                Updating employees...
                                            </span>

                                            <span className="text-blue-700">
                                                {
                                                    bulkProgress.completed
                                                }{" "}
                                                /{" "}
                                                {
                                                    bulkProgress.total
                                                }
                                            </span>
                                        </div>

                                        <div
                                            className="h-2 w-full overflow-hidden rounded-full bg-blue-200"
                                            role="progressbar"
                                            aria-valuemin={0}
                                            aria-valuemax={
                                                bulkProgress.total
                                            }
                                            aria-valuenow={
                                                bulkProgress.completed
                                            }
                                            aria-label="Employee bulk update progress"
                                        >
                                            <div
                                                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                                                style={{
                                                    width: `${
                                                        bulkProgress.total >
                                                        0
                                                            ? (bulkProgress.completed /
                                                                  bulkProgress.total) *
                                                              100
                                                            : 0
                                                    }%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Bulk error */}

                        {bulkError && (
                            <div
                                role="alert"
                                className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                            >
                                {bulkError}
                            </div>
                        )}

                        {/* Employee results */}

                        {data.data.length === 0 ? (
                            <p className="rounded-lg border p-6 text-gray-600">
                                No employees found.
                            </p>
                        ) : (
                            <div className="rounded-lg border bg-white md:overflow-x-auto">

                                {/* Desktop table */}

                                <table className="hidden w-full min-w-[950px] text-left text-sm md:table">

                                    <thead className="border-b bg-gray-50">
                                        <tr>

                                            <th className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    aria-label="Select all employees on this page"
                                                    checked={
                                                        data.data.length >
                                                            0 &&
                                                        data.data.every(
                                                            (
                                                                employee,
                                                            ) =>
                                                                selectedIds.includes(
                                                                    employee.id,
                                                                ),
                                                        )
                                                    }
                                                    onChange={
                                                        toggleSelectAll
                                                    }
                                                />
                                            </th>

                                            <SortableHeader
                                                label="Name"
                                                field="firstName"
                                                sortFields={
                                                    sortFields
                                                }
                                                onSort={
                                                    updateSort
                                                }
                                            />

                                            <SortableHeader
                                                label="Department"
                                                field="department"
                                                sortFields={
                                                    sortFields
                                                }
                                                onSort={
                                                    updateSort
                                                }
                                            />

                                            <SortableHeader
                                                label="Designation"
                                                field="designation"
                                                sortFields={
                                                    sortFields
                                                }
                                                onSort={
                                                    updateSort
                                                }
                                            />

                                            <SortableHeader
                                                label="Status"
                                                field="status"
                                                sortFields={
                                                    sortFields
                                                }
                                                onSort={
                                                    updateSort
                                                }
                                            />

                                            <SortableHeader
                                                label="Join Date"
                                                field="joinDate"
                                                sortFields={
                                                    sortFields
                                                }
                                                onSort={
                                                    updateSort
                                                }
                                            />

                                            <th className="px-4 py-3">
                                                Actions
                                            </th>

                                        </tr>
                                    </thead>

                                    <tbody>
                                        {data.data.map(
                                            (
                                                employee,
                                            ) => (
                                                <tr
                                                    key={
                                                        employee.id
                                                    }
                                                    className="border-b last:border-b-0 hover:bg-gray-50"
                                                >
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="checkbox"
                                                            aria-label={`Select ${employee.firstName} ${employee.lastName}`}
                                                            checked={selectedIds.includes(
                                                                employee.id,
                                                            )}
                                                            onChange={() =>
                                                                toggleEmployeeSelection(
                                                                    employee.id,
                                                                )
                                                            }
                                                        />
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <p className="font-medium">
                                                            {
                                                                employee.firstName
                                                            }{" "}
                                                            {
                                                                employee.lastName
                                                            }
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            {
                                                                employee.email
                                                            }
                                                        </p>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {
                                                            employee.department
                                                        }
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {
                                                            employee.designation
                                                        }
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                                employee.status ===
                                                                "active"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-gray-100 text-gray-600"
                                                            }`}
                                                        >
                                                            {
                                                                employee.status
                                                            }
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {
                                                            employee.joinDate
                                                        }
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleEditEmployee(
                                                                    employee,
                                                                )
                                                            }
                                                            className="rounded-lg border border-blue-600 px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                                                        >
                                                            Edit
                                                        </button>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>

                                {/* Mobile cards */}

                                <div className="space-y-3 p-3 md:hidden">
                                    {data.data.map(
                                        (employee) => (
                                            <div
                                                key={
                                                    employee.id
                                                }
                                                className="w-full rounded-lg border bg-white p-3 shadow-sm"
                                            >
                                                <div className="flex items-start justify-between gap-3">

                                                    <div className="flex min-w-0 items-start gap-3">
                                                        <input
                                                            type="checkbox"
                                                            aria-label={`Select ${employee.firstName} ${employee.lastName}`}
                                                            checked={selectedIds.includes(
                                                                employee.id,
                                                            )}
                                                            onChange={() =>
                                                                toggleEmployeeSelection(
                                                                    employee.id,
                                                                )
                                                            }
                                                            className="mt-1 shrink-0"
                                                        />

                                                        <div className="min-w-0">
                                                            <p className="break-words font-medium text-gray-900">
                                                                {
                                                                    employee.firstName
                                                                }{" "}
                                                                {
                                                                    employee.lastName
                                                                }
                                                            </p>

                                                            <p className="break-all text-xs text-gray-500">
                                                                {
                                                                    employee.email
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {
                                                                    employee.employeeId
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEditEmployee(
                                                                employee,
                                                            )
                                                        }
                                                        className="shrink-0 rounded-lg border border-blue-600 px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>

                                                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">

                                                    <div className="min-w-0">
                                                        <p className="text-xs text-gray-500">
                                                            Department
                                                        </p>

                                                        <p className="break-words font-medium">
                                                            {
                                                                employee.department
                                                            }
                                                        </p>
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="text-xs text-gray-500">
                                                            Designation
                                                        </p>

                                                        <p className="break-words font-medium">
                                                            {
                                                                employee.designation
                                                            }
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Status
                                                        </p>

                                                        <span
                                                            className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                                                                employee.status ===
                                                                "active"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-gray-100 text-gray-600"
                                                            }`}
                                                        >
                                                            {
                                                                employee.status
                                                            }
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Join Date
                                                        </p>

                                                        <p className="font-medium">
                                                            {
                                                                employee.joinDate
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Pagination */}

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() =>
                                    goToPage(
                                        page - 1,
                                    )
                                }
                                className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Previous
                            </button>

                            <span className="text-sm">
                                Page{" "}
                                {data.page} of{" "}
                                {data.totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={
                                    page >=
                                    data.totalPages
                                }
                                onClick={() =>
                                    goToPage(
                                        page + 1,
                                    )
                                }
                                className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Edit Employee Panel */}

                <EditEmployeePanel
                    employee={
                        editingEmployee
                    }
                    isOpen={
                        editingEmployee !== null
                    }
                    onClose={
                        handleCloseEdit
                    }
                    onSave={
                        handleSaveEmployee
                    }
                    isSaving={
                        isUpdatingEmployee
                    }
                    serverErrors={
                        serverErrors
                    }
                />
            </main>
        </RoleGuard>
    );
}

function SortableHeader({
    label,
    field,
    sortFields,
    onSort,
}: SortableHeaderProps) {
    const index =
        sortFields.findIndex(
            (item) =>
                item.field === field,
        );

    const sort =
        sortFields[index];

    return (
        <th className="px-4 py-3">
            <button
                type="button"
                onClick={() =>
                    onSort(field)
                }
                className="flex items-center gap-2 font-semibold hover:text-blue-600"
                aria-label={`Sort by ${label}`}
            >
                <span>{label}</span>

                {sort && (
                    <span>
                        {sort.direction ===
                            "asc"
                            ? "↑"
                            : "↓"}
                    </span>
                )}

                {index !== -1 && (
                    <span className="text-xs text-gray-400">
                        {index + 1}
                    </span>
                )}
            </button>
        </th>
    );
}