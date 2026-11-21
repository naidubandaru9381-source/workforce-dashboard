import { http, HttpResponse, delay } from "msw";
import { validateMockAccessToken } from "./auth.utils";
import { saveEmployeeOverride } from "../data/seed";
import { getEmployees } from "@/mocks/data/store";

export const employeeHandlers = [
    http.get("/api/employees", async ({ request }) => {
        const authorization = request.headers.get("authorization");

        const userId = validateMockAccessToken(authorization);

        if (!userId) {
            return HttpResponse.json(
                {
                    status: 401,
                    message: "Access token is missing or expired",
                    code: "ACCESS_TOKEN_EXPIRED",
                },
                {
                    status: 401,
                },
            );
        }

        await delay(200 + Math.floor(Math.random() * 601));

        const url = new URL(request.url);

        const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);

        const pageSize = Math.min(
            Math.max(Number(url.searchParams.get("pageSize")) || 10, 1),
            100,
        );

        const search = (url.searchParams.get("search") || "")
            .trim()
            .toLowerCase();

        const department = url.searchParams.get("department") || "";

        const status = url.searchParams.get("status") || "";

        const joinDateFrom = url.searchParams.get("joinDateFrom") || "";

        const joinDateTo = url.searchParams.get("joinDateTo") || "";

        const sortParam = url.searchParams.get("sort") || "firstName:asc";

        const sortFields = sortParam
            .split(",")
            .map((item) => {
                const [field, direction] = item.split(":");

                return {
                    field,
                    direction: direction === "desc" ? "desc" : "asc",
                };
            })
            .filter((item) => item.field);

        const employees = getEmployees();

        let filteredEmployees = [...employees];

        // Search
        if (search) {
            filteredEmployees = filteredEmployees.filter(
                (employee) =>
                    employee.firstName.toLowerCase().includes(search) ||
                    employee.lastName.toLowerCase().includes(search) ||
                    employee.email.toLowerCase().includes(search) ||
                    employee.employeeId.toLowerCase().includes(search),
            );
        }

        // Department filter
        if (department) {
            filteredEmployees = filteredEmployees.filter(
                (employee) => employee.department === department,
            );
        }

        // Status filter
        if (status) {
            filteredEmployees = filteredEmployees.filter(
                (employee) => employee.status === status,
            );
        }

        // Join date range
        if (joinDateFrom) {
            filteredEmployees = filteredEmployees.filter(
                (employee) => employee.joinDate >= joinDateFrom,
            );
        }

        if (joinDateTo) {
            filteredEmployees = filteredEmployees.filter(
                (employee) => employee.joinDate <= joinDateTo,
            );
        }

        // Multi-column sorting
        filteredEmployees.sort((a, b) => {
            for (const { field, direction } of sortFields) {
                const first = String(
                    a[field as keyof typeof a] ?? "",
                ).toLowerCase();

                const second = String(
                    b[field as keyof typeof b] ?? "",
                ).toLowerCase();

                const comparison = first.localeCompare(second, undefined, {
                    numeric: true,
                });

                if (comparison !== 0) {
                    return direction === "desc" ? -comparison : comparison;
                }
            }

            return 0;
        });

        const total = filteredEmployees.length;

        const totalPages = Math.max(Math.ceil(total / pageSize), 1);

        const safePage = Math.min(page, totalPages);

        const startIndex = (safePage - 1) * pageSize;

        const data = filteredEmployees.slice(startIndex, startIndex + pageSize);

        return HttpResponse.json({
            data,
            page: safePage,
            pageSize,
            total,
            totalPages,
        });
    }),

    http.patch("/api/employees/bulk-status", async ({ request }) => {
        const authorization = request.headers.get("authorization");

        const userId = validateMockAccessToken(authorization);

        if (!userId) {
            return HttpResponse.json(
                {
                    status: 401,
                    message: "Access token is missing or expired",
                    code: "ACCESS_TOKEN_EXPIRED",
                },
                { status: 401 },
            );
        }

        await delay(500);

        const body = (await request.json()) as {
            employeeIds: string[];
            status: "active" | "inactive";
        };

        const employees = getEmployees();

        const results = body.employeeIds.map((employeeId) => {
            const employee = employees.find((item) => item.id === employeeId);

            if (!employee) {
                return {
                    employeeId,
                    success: false,
                    error: "Employee not found",
                };
            }

            // Simulate occasional per-item failure
            if (Math.random() < 0.1) {
                return {
                    employeeId,
                    success: false,
                    error: "Unable to update employee",
                };
            }

            employee.status = body.status;

            return {
                employeeId,
                success: true,
            };
        });

        return HttpResponse.json({
            results,
        });
    }),

    http.patch("/api/employees/:id", async ({ request, params }) => {
        const authorization = request.headers.get("authorization");

        const userId = validateMockAccessToken(authorization);

        if (!userId) {
            return HttpResponse.json(
                {
                    status: 401,
                    message: "Access token is missing or expired",
                    code: "ACCESS_TOKEN_EXPIRED",
                },
                { status: 401 },
            );
        }

        await delay(500);

        const employeeId = String(params.id);

        const employees = getEmployees();

        const employee = employees.find((item) => item.id === employeeId);

        if (!employee) {
            return HttpResponse.json(
                {
                    status: 404,
                    message: "Employee not found",
                    code: "EMPLOYEE_NOT_FOUND",
                },
                { status: 404 },
            );
        }

        const body = (await request.json()) as {
            firstName?: string;
            lastName?: string;
            email?: string;
            phone?: string;
            department?: string;
            designation?: string;
            status?: "active" | "inactive";
            joinDate?: string;
            salary?: number;
        };

        const errors: Record<string, string> = {};

        if (!body.firstName?.trim()) {
            errors.firstName = "First name is required";
        }

        if (!body.lastName?.trim()) {
            errors.lastName = "Last name is required";
        }

        if (!body.email?.trim()) {
            errors.email = "Email is required";
        }

        if (body.email && !body.email.includes("@")) {
            errors.email = "Enter a valid email address";
        }

        if (!body.department?.trim()) {
            errors.department = "Department is required";
        }

        if (!body.designation?.trim()) {
            errors.designation = "Designation is required";
        }

        if (Object.keys(errors).length > 0) {
            return HttpResponse.json(
                {
                    status: 422,
                    message: "Validation failed",
                    code: "VALIDATION_ERROR",
                    errors,
                },
                { status: 422 },
            );
        }

        Object.assign(employee, {
            ...body,
            firstName: body.firstName?.trim(),
            lastName: body.lastName?.trim(),
            email: body.email?.trim(),
            phone: body.phone?.trim(),
            department: body.department?.trim(),
            designation: body.designation?.trim(),
        });

        saveEmployeeOverride(employee.id, {
            ...body,
            firstName: body.firstName?.trim(),
            lastName: body.lastName?.trim(),
            email: body.email?.trim(),
            phone: body.phone?.trim(),
            department: body.department?.trim(),
            designation: body.designation?.trim(),
        });

        return HttpResponse.json(employee);
    }),
];
