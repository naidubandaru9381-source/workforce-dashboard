"use client";

import { useMemo, useState } from "react";

import { useGetDashboardSummaryQuery } from "@/features/dashboard/dashboardApi";

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export default function DashboardClient() {
  const [range, setRange] = useState<"30" | "60" | "90">("30");

  const dateRange = useMemo(() => {
    const to = new Date();
    const from = new Date();

    from.setDate(from.getDate() - Number(range));

    return {
      from: formatDate(from),
      to: formatDate(to),
    };
  }, [range]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetDashboardSummaryQuery(dateRange);

  if (isLoading) {
    return (
      <main className="p-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-xl bg-gray-200"
            />
          ))}
        </div>

        <div className="mt-6 h-80 animate-pulse rounded-xl bg-gray-200" />
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="p-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          Failed to load dashboard data.
          <div className="mt-1 text-sm">
            {JSON.stringify(error)}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Dashboard
          </h1>

          <p className="mt-1 text-gray-600">
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
              setRange(
                event.target.value as "30" | "60" | "90",
              )
            }
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="30">Last 30 days</option>
            <option value="60">Last 60 days</option>
            <option value="90">Last 90 days</option>
          </select>

          {isFetching && (
            <span className="text-xs text-gray-500">
              Updating...
            </span>
          )}
        </div>
      </div>

      <section
        aria-label="Dashboard metrics"
        className="mt-6 grid gap-4 md:grid-cols-3"
      >
        <MetricCard
          title="Task completion"
          value={`${data.taskCompletionRate.percentage}%`}
          description={`${data.taskCompletionRate.completed} of ${data.taskCompletionRate.total} tasks completed`}
        />

        <MetricCard
          title="Overdue tasks"
          value={String(data.overdueTasks.count)}
          description="Incomplete tasks past their due date"
        />

        <MetricCard
          title="Upcoming leave"
          value={String(data.upcomingLeave.length)}
          description="Upcoming leave requests"
        />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">
            Headcount by department
          </h2>

          <div className="mt-4 space-y-4">
            {data.headcountByDepartment.map((item) => {
              const maxCount = Math.max(
                ...data.headcountByDepartment.map(
                  (department) => department.count,
                ),
              );

              const width =
                maxCount === 0
                  ? 0
                  : (item.count / maxCount) * 100;

              return (
                <div key={item.department}>
                  <div className="flex justify-between text-sm">
                    <span>{item.department}</span>
                    <span className="font-medium">
                      {item.count}
                    </span>
                  </div>

                  <div className="mt-1 h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">
            Upcoming leave
          </h2>

          {data.upcomingLeave.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              No upcoming leave.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {data.upcomingLeave.map((leave) => (
                <div
                  key={leave.id}
                  className="rounded-lg border p-3"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="font-medium">
                        {leave.employeeName}
                      </p>

                      <p className="text-sm text-gray-500">
                        {leave.startDate} → {leave.endDate}
                      </p>
                    </div>

                    <span className="text-sm font-medium">
                      {leave.days} day
                      {leave.days !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
}

function MetricCard({
  title,
  value,
  description,
}: MetricCardProps) {
  return (
    <article className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-sm text-gray-500">
        {description}
      </p>
    </article>
  );
}