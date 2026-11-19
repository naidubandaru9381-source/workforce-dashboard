import { http, HttpResponse, delay } from "msw";
import { generateLeaveRequests } from "@/mocks/data/seed";
import { validateMockAccessToken } from "./auth.utils";
import type { LeaveRequest } from "@/types/leave";

const leaveRequests = generateLeaveRequests(500);

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

export const leaveHandlers = [
  http.get("/api/leave-requests", async ({ request }) => {
    const authError = validateMockAccessToken(
      request.headers.get("authorization"),
    );

    if (authError) {
      return authError;
    }

    await delay(400);

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

  http.post("/api/leave-requests", async ({ request }) => {
    const authError = validateMockAccessToken(
      request.headers.get("authorization"),
    );

    if (authError) {
      return authError;
    }

    await delay(500);

    const body = (await request.json()) as Partial<LeaveRequest>;

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
            startDate: "Start date must be before the end date.",
          },
        },
        { status: 422 },
      );
    }

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
  }),

    http.get("/api/leave-balance/:employeeId", async ({ params, request }) => {
    const authError = validateMockAccessToken(
      request.headers.get("authorization"),
    );

    if (authError) {
      return authError;
    }

    await delay(300);

    const employeeId = String(params.employeeId);

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
  
  http.patch("/api/leave-requests/:id", async ({ params, request }) => {
    const authError = validateMockAccessToken(
      request.headers.get("authorization"),
    );

    if (authError) {
      return authError;
    }

    await delay(500);

    const id = String(params.id);

    const leaveRequest = leaveRequests.find(
      (request) => request.id === id,
    );

    if (!leaveRequest) {
      return HttpResponse.json(
        {
          status: 404,
          message: "Leave request not found.",
        },
        { status: 404 },
      );
    }

    const body = (await request.json()) as {
      status?: "approved" | "rejected";
      reviewedBy?: string;
    };

    if (!body.status || !["approved", "rejected"].includes(body.status)) {
      return HttpResponse.json(
        {
          status: 422,
          message: "A valid approval status is required.",
        },
        { status: 422 },
      );
    }

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
    leaveRequest.reviewedBy = body.reviewedBy ?? null;

    return HttpResponse.json({
      data: leaveRequest,
    });
  }),

  http.get("/api/holidays", async ({ request }) => {
    const authError = validateMockAccessToken(
      request.headers.get("authorization"),
    );

    if (authError) {
      return authError;
    }

    await delay(300);

    return HttpResponse.json({
      data: holidays,
    });
  }),
];