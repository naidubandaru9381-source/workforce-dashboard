import type { DashboardSummary } from "@/types/dashboard";

interface DashboardMetricsProps {
  data: DashboardSummary;
}

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
}

export default function DashboardMetrics({
  data,
}: DashboardMetricsProps) {
  return (
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
  );
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