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
        /*
         * ---------------------------------------------------------
         * NORMAL SERVER-SIDE PAGINATION
         * ---------------------------------------------------------
         */
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
                            .map((item) => `${item.field}:${item.direction}`)
                            .join(","),
                    }),
                },
            }),
            providesTags: ["Employee"],
        }),

        getEmployeesInfinite: builder.query<
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
                            .map((item) => `${item.field}:${item.direction}`)
                            .join(","),
                    }),
                },
            }),

            serializeQueryArgs: ({ endpointName, queryArgs }) => {
                const filters = {
                    ...queryArgs,
                    page: undefined,
                };

                return `${endpointName}-${JSON.stringify(filters)}`;
            },

            merge: (currentCache, newItems, { arg }) => {
                if (arg.page === 1) {
                    return newItems;
                }

                /*
                 * Prevent duplicate employees if a page is
                 * requested again.
                 */
                const existingIds = new Set(
                    currentCache.data.map((employee) => employee.id),
                );

                const newEmployees = newItems.data.filter(
                    (employee) => !existingIds.has(employee.id),
                );

                /*
                 * Append the next page.
                 */
                currentCache.data.push(...newEmployees);

                /*
                 * Keep pagination metadata up to date.
                 */
                currentCache.page = newItems.page;
                currentCache.pageSize = newItems.pageSize;
                currentCache.total = newItems.total;
                currentCache.totalPages = newItems.totalPages;
            },

            /*
             * Tell RTK Query when another request should be made.
             */
            forceRefetch({ currentArg, previousArg }) {
                if (!currentArg || !previousArg) {
                    return true;
                }

                return (
                    currentArg.page !== previousArg.page ||
                    currentArg.pageSize !== previousArg.pageSize ||
                    currentArg.search !== previousArg.search ||
                    currentArg.department !== previousArg.department ||
                    currentArg.status !== previousArg.status ||
                    currentArg.joinDateFrom !== previousArg.joinDateFrom ||
                    currentArg.joinDateTo !== previousArg.joinDateTo ||
                    JSON.stringify(currentArg.sort) !==
                        JSON.stringify(previousArg.sort)
                );
            },

            providesTags: ["Employee"],
        }),

        /*
         * ---------------------------------------------------------
         * BULK EMPLOYEE STATUS UPDATE
         * ---------------------------------------------------------
         */
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

        /*
         * ---------------------------------------------------------
         * UPDATE SINGLE EMPLOYEE
         * ---------------------------------------------------------
         */
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

/*
 * ---------------------------------------------------------
 * EXPORTED HOOKS
 * ---------------------------------------------------------
 */

export const {
    useGetEmployeesQuery,
    useGetEmployeesInfiniteQuery,
    useBulkUpdateStatusMutation,
    useUpdateEmployeeMutation,
} = employeeApi;
