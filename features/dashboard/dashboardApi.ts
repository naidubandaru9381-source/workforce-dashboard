import { baseApi } from "@/store/api/baseApi";
import type { DashboardSummary } from "@/types/dashboard";

interface DashboardSummaryResponse {
  data: DashboardSummary;
}

interface DashboardDateRange {
  from: string;
  to: string;
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<
      DashboardSummary,
      DashboardDateRange
    >({
      query: ({ from, to }) => {
        const params = new URLSearchParams({
          from,
          to,
        });

        return `/dashboard/summary?${params.toString()}`;
      },

      transformResponse: (
        response: DashboardSummaryResponse,
      ) => response.data,

      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  usePrefetch,
} = dashboardApi;