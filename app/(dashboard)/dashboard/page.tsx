import DashboardClient from "@/components/dashboard/DashboardClient";
import { getDashboardSummaryServer } from "@/features/dashboard/dashboardServer";

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export default async function DashboardPage() {
  const to = new Date();
  const from = new Date();

  from.setDate(from.getDate() - 30);

  const dateRange = {
    from: formatDate(from),
    to: formatDate(to),
  };

  const initialSummary =
    await getDashboardSummaryServer(
      dateRange.from,
      dateRange.to,
    );

  return (
    <DashboardClient
      initialSummary={initialSummary}
      initialDateRange={dateRange}
    />
  );
}