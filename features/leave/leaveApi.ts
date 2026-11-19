import { baseApi } from "@/store/api/baseApi";
import type { LeaveRequest } from "@/types/leave";

interface LeaveResponse {
  data: LeaveRequest[];
  total: number;
}

interface SingleLeaveResponse {
  data: LeaveRequest;
}

interface Holiday {
  id: string;
  name: string;
  date: string;
}

interface HolidayResponse {
  data: Holiday[];
}

interface LeaveBalance {
  employeeId: string;
  totalBalance: number;
  approvedDays: number;
  remainingBalance: number;
}

interface LeaveBalanceResponse {
  data: LeaveBalance;
}

interface LeaveFilters {
  employeeId?: string;
  status?: "pending" | "approved" | "rejected";
}

interface CreateLeaveRequest {
  employeeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  days: number;
}

export const leaveApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeaveRequests: builder.query<
      LeaveResponse,
      LeaveFilters | void
    >({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters?.employeeId) {
          params.set("employeeId", filters.employeeId);
        }

        if (filters?.status) {
          params.set("status", filters.status);
        }

        const queryString = params.toString();

        return `/leave-requests${
          queryString ? `?${queryString}` : ""
        }`;
      },

      providesTags: ["LeaveRequest"],
    }),

    createLeaveRequest: builder.mutation<
      SingleLeaveResponse,
      CreateLeaveRequest
    >({
      query: (body) => ({
        url: "/leave-requests",
        method: "POST",
        body,
      }),

      invalidatesTags: ["LeaveRequest", "LeaveBalance"],
    }),

    reviewLeaveRequest: builder.mutation<
      SingleLeaveResponse,
      {
        id: string;
        status: "approved" | "rejected";
      }
    >({
      query: ({ id, status }) => ({
        url: `/leave-requests/${id}`,
        method: "PATCH",
        body: {
          status,
          reviewedBy: "manager-1",
        },
      }),

      invalidatesTags: ["LeaveRequest", "LeaveBalance"],
    }),

    getHolidays: builder.query<Holiday[], void>({
      query: () => "/holidays",

      transformResponse: (
        response: Holiday[] | HolidayResponse,
      ): Holiday[] => {
        if (Array.isArray(response)) {
          return response;
        }

        return response.data;
      },

      providesTags: ["Holiday"],
    }),

    getLeaveBalance: builder.query<LeaveBalance, string>({
      query: (employeeId) => `/leave-balance/${employeeId}`,

      transformResponse: (
        response: LeaveBalance | LeaveBalanceResponse,
      ): LeaveBalance => {
        if ("employeeId" in response) {
          return response;
        }

        return response.data;
      },

      providesTags: ["LeaveBalance"],
    }),
  }),
});

export const {
  useGetLeaveRequestsQuery,
  useCreateLeaveRequestMutation,
  useReviewLeaveRequestMutation,
  useGetHolidaysQuery,
  useGetLeaveBalanceQuery,
} = leaveApi;