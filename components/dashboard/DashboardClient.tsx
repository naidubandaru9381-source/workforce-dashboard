"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

import {
    dashboardApi,
    useGetDashboardSummaryQuery,
} from "@/features/dashboard/dashboardApi";

import DashboardErrorBoundary from "./DashboardErrorBoundary";
import DashboardMetrics from "./DashboardMetrics";
import {
    ChartSkeleton,
    LeaveSkeleton,
    MetricSkeleton,
} from "./DashboardSkeleton";
import HeadcountWidget from "./HeadcountWidget";
import UpcomingLeaveWidget from "./UpcomingLeaveWidget";

import type { AppDispatch } from "@/store";

import type { DashboardSummary } from "@/types/dashboard";

interface DashboardDateRange {
    from: string;
    to: string;
}

interface DashboardClientProps {
    initialSummary: DashboardSummary;
    initialDateRange: DashboardDateRange;
}

type DashboardRange = "30" | "60" | "90";

function formatDate(date: Date) {
    return date.toISOString().split("T")[0];
}

function getDateRange(
    days: DashboardRange,
    initialDateRange: DashboardDateRange,
): DashboardDateRange {
    if (days === "30") {
        return initialDateRange;
    }

    const to = new Date();
    const from = new Date();

    from.setDate(from.getDate() - Number(days));

    return {
        from: formatDate(from),
        to: formatDate(to),
    };
}

export default function DashboardClient({
    initialSummary,
    initialDateRange,
}: DashboardClientProps) {
    const dispatch = useDispatch<AppDispatch>();

    const [range, setRange] = useState<DashboardRange>("30");

    const dateRange = useMemo(
        () => getDateRange(range, initialDateRange),
        [range, initialDateRange],
    );

    /*
     * Hydrate the RTK Query cache with the
     * server-rendered 30-day dashboard data.
     *
     * This prevents a duplicate request on
     * the initial dashboard load.
     */
    useEffect(() => {
        dispatch(
            dashboardApi.util.upsertQueryData(
                "getDashboardSummary",
                initialDateRange,
                initialSummary,
            ),
        );
    }, [dispatch, initialDateRange, initialSummary]);

    /*
     * RTK Query prefetch.
     *
     * When the user interacts with the date-range
     * control, we prepare the 60 and 90 day data.
     */
    const prefetchDashboard = dashboardApi.usePrefetch("getDashboardSummary");

    const handlePrefetch = (days: DashboardRange) => {
        if (days === "30") {
            return;
        }

        const nextDateRange = getDateRange(days, initialDateRange);

        prefetchDashboard(nextDateRange, {
            ifOlderThan: 30,
        });
    };

    const { data, isFetching, isError, error } = useGetDashboardSummaryQuery(
        dateRange,
        {
            /*
             * The initial 30-day data already comes
             * from the server.
             *
             * Therefore don't make another request
             * for the initial range.
             */
            skip: range === "30",
        },
    );

    /*
     * For 30 days:
     *   initialSummary comes from the server.
     *
     * For 60/90 days:
     *   data comes from RTK Query.
     */
    const dashboardData = range === "30" ? initialSummary : data;

    /*
     * Show skeletons while 60/90 day data is
     * being fetched for the first time.
     */
    if (range !== "30" && isFetching && !data) {
        return (
            <main className="bg-gray-50 p-6 text-gray-900 dark:bg-gray-950 dark:text-white">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>

                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            Workforce and project overview
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <label
                            htmlFor="dashboard-range"
                            className="text-sm font-medium"
                        >
                            Date range
                        </label>

                        <select
                            id="dashboard-range"
                            value={range}
                            onChange={(event) =>
                                setRange(event.target.value as DashboardRange)
                            }
                            onMouseEnter={() => {
                                handlePrefetch("60");
                                handlePrefetch("90");
                            }}
                            onFocus={() => {
                                handlePrefetch("60");
                                handlePrefetch("90");
                            }}
                            className="rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="30">Last 30 days</option>

                            <option value="60">Last 60 days</option>

                            <option value="90">Last 90 days</option>
                        </select>
                    </div>
                </div>

                <section aria-label="Dashboard loading" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <MetricSkeleton />
                        <MetricSkeleton />
                        <MetricSkeleton />
                    </div>

                    <div className="mt-6 grid gap-6 lg:grid-cols-2">
                        <ChartSkeleton />
                        <LeaveSkeleton />
                    </div>
                </section>
            </main>
        );
    }

    /*
     * If the API failed and there is no data to display,
     * show an error state.
     */
    if (range !== "30" && isError && !dashboardData) {
        return (
            <main className="bg-gray-50 p-6 text-gray-900 dark:bg-gray-950 dark:text-white">
                <h1 className="text-3xl font-bold">Dashboard</h1>

                <div
                    className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                    role="alert"
                >
                    <p className="font-medium">
                        Failed to load dashboard data.
                    </p>

                    <p className="mt-1 text-sm">
                        Please try changing the date range or refreshing the
                        page.
                    </p>

                    <p className="mt-2 text-xs">{JSON.stringify(error)}</p>
                </div>
            </main>
        );
    }

    /*
     * TypeScript knows that dashboardData exists
     * here because the 30-day range uses
     * initialSummary and 60/90 are handled above.
     */
    if (!dashboardData) {
        return null;
    }

    return (
        <main className="bg-gray-50 p-6 text-gray-900 dark:bg-gray-950 dark:text-white">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>

                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Workforce and project overview
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <label
                        htmlFor="dashboard-range"
                        className="text-sm font-medium"
                    >
                        Date range
                    </label>

                    <select
                        id="dashboard-range"
                        value={range}
                        onChange={(event) =>
                            setRange(event.target.value as DashboardRange)
                        }
                        onMouseEnter={() => {
                            handlePrefetch("60");
                            handlePrefetch("90");
                        }}
                        onFocus={() => {
                            handlePrefetch("60");
                            handlePrefetch("90");
                        }}
                        className="rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                        <option value="30">Last 30 days</option>

                        <option value="60">Last 60 days</option>

                        <option value="90">Last 90 days</option>
                    </select>

                    {isFetching && (
                        <span
                            className="text-xs text-gray-500 dark:text-gray-400"
                            aria-live="polite"
                        >
                            Updating...
                        </span>
                    )}
                </div>
            </div>

            {/* Dashboard metrics */}
            <DashboardErrorBoundary title="Dashboard metrics">
                <DashboardMetrics data={dashboardData} />
            </DashboardErrorBoundary>

            {/* Dashboard widgets */}
            <section className="mt-6 grid gap-6 lg:grid-cols-2">
                <DashboardErrorBoundary title="Headcount">
                    <HeadcountWidget
                        data={dashboardData.headcountByDepartment}
                    />
                </DashboardErrorBoundary>

                <DashboardErrorBoundary title="Upcoming leave">
                    <UpcomingLeaveWidget data={dashboardData.upcomingLeave} />
                </DashboardErrorBoundary>
            </section>
        </main>
    );
}
