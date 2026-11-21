import { http, HttpResponse, delay } from "msw";

import { getLeaveRequests } from "@/mocks/data/store";
import { validateMockAccessToken } from "./auth.utils";

import type { LeaveRequest } from "@/types/leave";

const holidays = [
    {
        id: "holiday-1",
        name: "Republic Day",
        date: "2026-01-26",
    },
    {
        id: "holiday-2",
        name: "Independence Day",
        date: "2026-08-15",
    },
    {
        id: "holiday-3",
        name: "Gandhi Jayanti",
        date: "2026-10-02",
    },
    {
        id: "holiday-4",
        name: "Diwali",
        date: "2026-11-08",
    },
];

function unauthorizedResponse() {
    return HttpResponse.json(
        {
            status: 401,
            message: "Authentication required.",
            code: "UNAUTHORIZED",
        },
        { status: 401 },
    );
}

export const leaveHandlers = [
    // ============================================================
    // GET LEAVE REQUESTS
    // ============================================================

    http.get("/api/leave-requests", async ({ request }) => {
        const userId = validateMockAccessToken(
            request.headers.get("authorization"),
        );

        if (!userId) {
            return unauthorizedResponse();
        }

        await delay(400);

        const leaveRequests = getLeaveRequests();

        const url = new URL(request.url);

        const employeeId = url.searchParams.get("employeeId");
        const status = url.searchParams.get("status");

        let filteredRequests = [...leaveRequests];

        if (employeeId) {
            filteredRequests = filteredRequests.filter(
                (leaveRequest) => leaveRequest.employeeId === employeeId,
            );
        }

        if (status) {
            filteredRequests = filteredRequests.filter(
                (leaveRequest) => leaveRequest.status === status,
            );
        }

        return HttpResponse.json({
            data: filteredRequests,
            total: filteredRequests.length,
        });
    }),

    // ============================================================
    // CREATE LEAVE REQUEST
    // ============================================================

    http.post("/api/leave-requests", async ({ request }) => {
        const userId = validateMockAccessToken(
            request.headers.get("authorization"),
        );

        if (!userId) {
            return unauthorizedResponse();
        }

        await delay(500);

        try {
            const leaveRequests = getLeaveRequests();

            const body = (await request.json()) as Partial<LeaveRequest>;

            // --------------------------------------------------------
            // Validation
            // --------------------------------------------------------

            if (
                !body.employeeId ||
                !body.startDate ||
                !body.endDate ||
                body.days === undefined
            ) {
                return HttpResponse.json(
                    {
                        status: 422,
                        message: "Required leave fields are missing.",
                        fieldErrors: {
                            employeeId: "Employee is required.",
                            startDate: "Start date is required.",
                            endDate: "End date is required.",
                            days: "Leave duration is required.",
                        },
                    },
                    { status: 422 },
                );
            }

            if (body.startDate > body.endDate) {
                return HttpResponse.json(
                    {
                        status: 422,
                        message: "Start date cannot be after the end date.",
                        fieldErrors: {
                            startDate:
                                "Start date must be before the end date.",
                        },
                    },
                    { status: 422 },
                );
            }

            if (typeof body.days !== "number" || body.days <= 0) {
                return HttpResponse.json(
                    {
                        status: 422,
                        message: "Leave duration must be greater than zero.",
                        fieldErrors: {
                            days: "Leave duration must be greater than zero.",
                        },
                    },
                    { status: 422 },
                );
            }

            // --------------------------------------------------------
            // Create request
            // --------------------------------------------------------

            const newRequest: LeaveRequest = {
                id: `leave-${leaveRequests.length + 1}`,
                employeeId: body.employeeId,
                startDate: body.startDate,
                endDate: body.endDate,
                reason: body.reason ?? "",
                status: "pending",
                days: body.days,
                createdAt: new Date().toISOString(),
                reviewedBy: null,
            };

            leaveRequests.unshift(newRequest);

            return HttpResponse.json(
                {
                    data: newRequest,
                },
                { status: 201 },
            );
        } catch (error) {
            console.error("[LEAVE POST] Handler error:", error);

            return HttpResponse.json(
                {
                    status: 500,
                    message: "Internal mock server error.",
                },
                { status: 500 },
            );
        }
    }),

    // ============================================================
    // GET LEAVE BALANCE
    // ============================================================

    http.get("/api/leave-balance/:employeeId", async ({ params, request }) => {
        const userId = validateMockAccessToken(
            request.headers.get("authorization"),
        );

        if (!userId) {
            return unauthorizedResponse();
        }

        await delay(300);

        const employeeId = String(params.employeeId ?? "");

        if (!employeeId) {
            return HttpResponse.json(
                {
                    status: 400,
                    message: "Employee ID is required.",
                },
                { status: 400 },
            );
        }

        const leaveRequests = getLeaveRequests();

        const approvedDays = leaveRequests
            .filter(
                (leaveRequest) =>
                    leaveRequest.employeeId === employeeId &&
                    leaveRequest.status === "approved",
            )
            .reduce((total, leaveRequest) => total + leaveRequest.days, 0);

        const totalBalance = 20;

        const remainingBalance = Math.max(totalBalance - approvedDays, 0);

        return HttpResponse.json({
            data: {
                employeeId,
                totalBalance,
                approvedDays,
                remainingBalance,
            },
        });
    }),

    // ============================================================
    // APPROVE / REJECT LEAVE REQUEST
    // ============================================================

    http.patch("/api/leave-requests/:id", async ({ params, request }) => {
        const userId = validateMockAccessToken(
            request.headers.get("authorization"),
        );

        if (!userId) {
            return unauthorizedResponse();
        }

        await delay(500);

        const leaveRequests = getLeaveRequests();

        const id = String(params.id);

        const leaveRequest = leaveRequests.find((request) => request.id === id);

        if (!leaveRequest) {
            return HttpResponse.json(
                {
                    status: 404,
                    message: "Leave request not found.",
                },
                { status: 404 },
            );
        }

        let body: {
            status?: "approved" | "rejected";
            reviewedBy?: string;
        };

        try {
            body = (await request.json()) as {
                status?: "approved" | "rejected";
                reviewedBy?: string;
            };
        } catch {
            return HttpResponse.json(
                {
                    status: 422,
                    message: "Invalid request body.",
                },
                { status: 422 },
            );
        }

        if (!body.status || !["approved", "rejected"].includes(body.status)) {
            return HttpResponse.json(
                {
                    status: 422,
                    message: "A valid approval status is required.",
                },
                { status: 422 },
            );
        }

        // Prevent processing an already reviewed request.
        if (leaveRequest.status !== "pending") {
            return HttpResponse.json(
                {
                    status: 409,
                    message: "This leave request has already been processed.",
                },
                { status: 409 },
            );
        }

        leaveRequest.status = body.status;

        leaveRequest.reviewedBy = body.reviewedBy ?? userId;

        return HttpResponse.json({
            data: leaveRequest,
        });
    }),

    // ============================================================
    // GET HOLIDAYS
    // ============================================================

    http.get("/api/holidays", async ({ request }) => {
        const userId = validateMockAccessToken(
            request.headers.get("authorization"),
        );

        if (!userId) {
            return unauthorizedResponse();
        }

        await delay(300);

        return HttpResponse.json({
            data: holidays,
        });
    }),
];
