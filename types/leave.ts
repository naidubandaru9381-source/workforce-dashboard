export type LeaveStatus = "pending" | "approved" | "rejected";

export interface LeaveRequest {
    id: string;
    employeeId: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: LeaveStatus;
    days: number;
    createdAt: string;
    reviewedBy: string | null;
}
