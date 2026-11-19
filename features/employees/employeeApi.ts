import { baseApi } from "@/store/api/baseApi";
import type { Employee } from "@/types/employee";
import type { PaginatedResponse } from "@/types/api";

export interface EmployeeSort {
    field: string;
    direction: "asc" | "desc";
}

export interface EmployeeQueryParams {
    page: number;
    pageSize: number;
    search?: string;
    department?: string;
    status?: string;
    joinDateFrom?: string;
    joinDateTo?: string;
    sort?: EmployeeSort[];
}

export interface BulkStatusRequest {
    employeeIds: string[];
    status: "active" | "inactive";
}

export interface BulkStatusResult {
    employeeId: string;
    success: boolean;
    error?: string;
}

export interface BulkStatusResponse {
    results: BulkStatusResult[];
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
                sort,
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
                    ...(sort?.length && {
                        sort: sort
                            .map(
                                (item) =>
                                    `${item.field}:${item.direction}`,
                            )
                            .join(","),
                    }),
                },
            }),
            providesTags: ["Employee"],
        }),

        bulkUpdateStatus: builder.mutation<
            BulkStatusResponse,
            BulkStatusRequest
        >({
            query: (body) => ({
                url: "/employees/bulk-status",
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["Employee"],
        }),
        
        updateEmployee: builder.mutation<
            Employee,
            {
                id: string;
                data: Partial<Employee>;
            }
        >({
            query: ({ id, data }) => ({
                url: `/employees/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Employee"],
        }),
    }),
});

export const {
    useGetEmployeesQuery,
    useBulkUpdateStatusMutation,
    useUpdateEmployeeMutation,
} = employeeApi;