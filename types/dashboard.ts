export interface DepartmentHeadcount {
    department: string;
    count: number;
}

export interface UpcomingLeave {
    id: string;
    employeeId: string;
    employeeName: string;
    startDate: string;
    endDate: string;
    days: number;
    status: "pending" | "approved" | "rejected";
}

export interface DashboardSummary {
    dateRange: {
        from: string;
        to: string;
    };

    headcountByDepartment: DepartmentHeadcount[];

    taskCompletionRate: {
        completed: number;
        total: number;
        percentage: number;
    };

    overdueTasks: {
        count: number;
    };

    upcomingLeave: UpcomingLeave[];
}
