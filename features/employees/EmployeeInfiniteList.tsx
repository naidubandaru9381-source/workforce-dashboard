"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { useGetEmployeesInfiniteQuery } from "@/features/employees/employeeApi";
import type { Employee } from "@/types/employee";

interface EmployeeInfiniteListProps {
    search?: string;
    department?: string;
    status?: string;
    joinDateFrom?: string;
    joinDateTo?: string;
    sort?: {
        field: string;
        direction: "asc" | "desc";
    }[];
    onEdit: (employee: Employee) => void;
}

const PAGE_SIZE = 50;

export default function EmployeeInfiniteList({
    search,
    department,
    status,
    joinDateFrom,
    joinDateTo,
    sort,
    onEdit,
}: EmployeeInfiniteListProps) {
    const parentRef = useRef<HTMLDivElement>(null);

    const [page, setPage] = useState(1);

    /*
     * Create a stable key from all server-side filters and sorting.
     * When any of these values changes, the infinite list must
     * start again from page 1.
     */
    const filterKey = useMemo(
        () =>
            JSON.stringify({
                search,
                department,
                status,
                joinDateFrom,
                joinDateTo,
                sort,
            }),
        [search, department, status, joinDateFrom, joinDateTo, sort],
    );

    /*
     * Remember which filter set the current page belongs to.
     */
    const previousFilterKeyRef = useRef(filterKey);

    /*
     * If filters changed, immediately use page 1 for the API request.
     * This prevents requesting page 4 of a completely new filter set.
     */
    const queryPage = previousFilterKeyRef.current === filterKey ? page : 1;

    useEffect(() => {
        if (previousFilterKeyRef.current !== filterKey) {
            previousFilterKeyRef.current = filterKey;
            setPage(1);
        }
    }, [filterKey]);

    const { data, isLoading, isFetching, isError, refetch } =
        useGetEmployeesInfiniteQuery({
            page: queryPage,
            pageSize: PAGE_SIZE,
            search: search || undefined,
            department: department || undefined,
            status: status || undefined,
            joinDateFrom: joinDateFrom || undefined,
            joinDateTo: joinDateTo || undefined,
            sort,
        });

    const employees = data?.data ?? [];

    const hasMore = Boolean(data && data.page < data.totalPages);

    /*
     * Prevent multiple requests for the same next page.
     */
    const requestedPageRef = useRef(1);

    useEffect(() => {
        if (previousFilterKeyRef.current !== filterKey) {
            requestedPageRef.current = 1;
        }
    }, [filterKey]);

    /*
     * Add one extra virtual row when more data exists.
     *
     * Example:
     *
     * 50 employees + 1 loader row = 51 virtual rows
     */
    const itemCount = employees.length + (hasMore ? 1 : 0);

    const rowVirtualizer = useVirtualizer({
        count: itemCount,

        getScrollElement: () => parentRef.current,

        estimateSize: () => 104,

        overscan: 8,

        getItemKey: (index) => employees[index]?.id ?? `loader-${index}`,
    });

    /*
     * Store the virtual rows in a variable so that
     * React's dependency checker can track it properly.
     */
    const virtualItems = rowVirtualizer.getVirtualItems();

    useEffect(() => {
        const lastVirtualItem = virtualItems[virtualItems.length - 1];

        if (!lastVirtualItem) {
            return;
        }

        /*
         * The loader row comes immediately after
         * the last employee.
         */
        const isLoaderRow = lastVirtualItem.index >= employees.length;

        if (!isLoaderRow || !hasMore || isFetching) {
            return;
        }

        const nextPage = page + 1;

        /*
         * Prevent duplicate page requests.
         */
        if (requestedPageRef.current >= nextPage) {
            return;
        }

        requestedPageRef.current = nextPage;

        setPage(nextPage);
    }, [virtualItems, employees.length, hasMore, isFetching, page]);

    /*
     * Initial loading.
     */
    if (isLoading) {
        return (
            <div
                className="flex min-h-[300px] items-center justify-center"
                aria-busy="true"
                aria-live="polite"
            >
                <div className="flex flex-col items-center gap-3">
                    <div
                        className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
                        aria-hidden="true"
                    />

                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Loading employees...
                    </p>
                </div>
            </div>
        );
    }

    /*
     * Initial API error.
     */
    if (isError && employees.length === 0) {
        return (
            <div
                className="flex min-h-[300px] flex-col items-center justify-center gap-3"
                role="alert"
            >
                <p className="text-sm text-red-600">
                    Failed to load employees.
                </p>

                <button
                    type="button"
                    onClick={() => refetch()}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Try again
                </button>
            </div>
        );
    }

    /*
     * Empty result.
     */
    if (employees.length === 0) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    No employees found.
                </p>
            </div>
        );
    }

    return (
        <section aria-label="Employee infinite list">
            {/* Result information */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Showing{" "}
                    <span className="font-medium">{employees.length}</span> of{" "}
                    <span className="font-medium">
                        {data?.total ?? employees.length}
                    </span>{" "}
                    employees
                </p>

                {isFetching && (
                    <p className="text-xs text-gray-500" aria-live="polite">
                        Loading more employees...
                    </p>
                )}
            </div>

            {/* Virtualized scroll container */}
            <div
                ref={parentRef}
                className="h-[600px] overflow-auto rounded-lg border bg-white dark:bg-gray-900"
                role="list"
                aria-label="Employees"
            >
                {/* Total virtual height */}
                <div
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: "100%",
                        position: "relative",
                    }}
                >
                    {virtualItems.map((virtualRow) => {
                        const employee = employees[virtualRow.index];

                        /*
                         * Loader row
                         */
                        if (!employee) {
                            return (
                                <div
                                    key={virtualRow.key}
                                    ref={rowVirtualizer.measureElement}
                                    data-index={virtualRow.index}
                                    className="absolute left-0 top-0 flex w-full items-center justify-center px-4"
                                    style={{
                                        transform: `translateY(${virtualRow.start}px)`,
                                        minHeight: "96px",
                                    }}
                                >
                                    {isFetching ? (
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
                                                aria-hidden="true"
                                            />

                                            <p className="text-sm text-gray-500">
                                                Loading more employees...
                                            </p>
                                        </div>
                                    ) : isError ? (
                                        <div className="flex flex-wrap items-center justify-center gap-3">
                                            <p
                                                className="text-sm text-red-600"
                                                role="alert"
                                            >
                                                Failed to load more employees.
                                            </p>

                                            <button
                                                type="button"
                                                onClick={() => refetch()}
                                                className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:hover:bg-gray-800"
                                            >
                                                Retry
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            Loading more...
                                        </p>
                                    )}
                                </div>
                            );
                        }

                        /*
                         * Employee row
                         */
                        return (
                            <article
                                key={virtualRow.key}
                                ref={rowVirtualizer.measureElement}
                                data-index={virtualRow.index}
                                className="absolute left-0 top-0 w-full px-3 py-2"
                                style={{
                                    transform: `translateY(${virtualRow.start}px)`,
                                }}
                                role="listitem"
                            >
                                <div className="flex flex-col gap-3 rounded-lg border p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
                                    {/* Employee information */}
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="truncate font-medium">
                                                {employee.firstName}{" "}
                                                {employee.lastName}
                                            </h3>

                                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                {employee.status}
                                            </span>
                                        </div>

                                        <p className="mt-1 truncate text-sm text-gray-500">
                                            {employee.email}
                                        </p>

                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                                            <span>
                                                Department:{" "}
                                                {employee.department}
                                            </span>

                                            <span>
                                                Designation:{" "}
                                                {employee.designation}
                                            </span>

                                            <span>
                                                Joined: {employee.joinDate}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Edit action */}
                                    <button
                                        type="button"
                                        onClick={() => onEdit(employee)}
                                        className="shrink-0 rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:hover:bg-gray-800"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
