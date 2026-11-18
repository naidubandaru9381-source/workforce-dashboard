import { baseApi } from "@/store/api/baseApi";
import type { Employee } from "@/types/employee";
import type { PaginatedResponse } from "@/types/api";

export interface EmployeeQueryParams {
  page: number;
  pageSize: number;
  search?: string;
  department?: string;
  status?: string;
  joinDateFrom?: string;
  joinDateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const employeeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<
      PaginatedResponse<Employee>,
      EmployeeQueryParams
    >({
      query: ({
        page,
        pageSize,
        search,
        department,
        status,
        joinDateFrom,
        joinDateTo,
        sortBy,
        sortOrder,
      }) => ({
        url: "/employees",
        params: {
          page,
          pageSize,
          ...(search && { search }),
          ...(department && { department }),
          ...(status && { status }),
          ...(joinDateFrom && { joinDateFrom }),
          ...(joinDateTo && { joinDateTo }),
          ...(sortBy && { sortBy }),
          ...(sortOrder && { sortOrder }),
        },
      }),

      providesTags: ["Employee"],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
} = employeeApi;