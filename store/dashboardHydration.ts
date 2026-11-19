import type { DashboardSummary } from "@/types/dashboard";
import { makeStore } from "@/store";
import { dashboardApi } from "@/features/dashboard/dashboardApi";

interface DashboardDateRange {
  from: string;
  to: string;
}

export function createDashboardStore(
  summary: DashboardSummary,
  dateRange: DashboardDateRange,
) {
  const store = makeStore();

  store.dispatch(
    dashboardApi.util.upsertQueryData(
      "getDashboardSummary",
      dateRange,
      summary,
    ),
  );

  return store;
}