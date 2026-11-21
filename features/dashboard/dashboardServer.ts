import { getEmployees, getLeaveRequests, getTasks } from "@/mocks/data/store";

import type { DashboardSummary } from "@/types/dashboard";

export async function getDashboardSummaryServer(
    from: string,
    to: string,
): Promise<DashboardSummary> {
    /*
     * Use the shared lazy data store instead of regenerating
     * 5,000 employees, 20,000 tasks, and 500 leave requests
     * on every dashboard render.
     */
    const employees = getEmployees();
    const tasks = getTasks();
    const leaveRequests = getLeaveRequests();

    // ------------------------------------------------------------
    // Headcount by department
    // ------------------------------------------------------------

    const headcountMap = new Map<string, number>();

    for (const employee of employees) {
        if (employee.status !== "active") {
            continue;
        }

        const currentCount = headcountMap.get(employee.department) ?? 0;

        headcountMap.set(employee.department, currentCount + 1);
    }

    const headcountByDepartment = Array.from(headcountMap.entries())
        .map(([department, count]) => ({
            department,
            count,
        }))
        .sort((a, b) => b.count - a.count);

    // ------------------------------------------------------------
    // Task metrics
    // ------------------------------------------------------------

    const now = new Date();

    let totalTasks = 0;
    let completedTasks = 0;
    let overdueTaskCount = 0;

    /*
     * Process all 20,000 tasks in a single loop instead of
     * creating multiple filtered arrays.
     */
    for (const task of tasks) {
        const taskDate = task.dueDate.split("T")[0];
        const dueDate = new Date(task.dueDate);

        const isInRange = taskDate >= from && taskDate <= to;

        if (isInRange) {
            totalTasks += 1;

            if (task.status === "done") {
                completedTasks += 1;
            }
        }

        if (dueDate < now && task.status !== "done") {
            overdueTaskCount += 1;
        }
    }

    const taskCompletionRate =
        totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // ------------------------------------------------------------
    // Employee lookup
    // ------------------------------------------------------------

    /*
     * Avoid employees.find() for every leave request.
     *
     * Map lookup is O(1), instead of repeatedly scanning
     * the 5,000 employee array.
     */
    const employeeMap = new Map(
        employees.map((employee) => [
            employee.id,
            `${employee.firstName} ${employee.lastName}`,
        ]),
    );

    // ------------------------------------------------------------
    // Upcoming leave
    // ------------------------------------------------------------

    const today = new Date().toISOString().split("T")[0];

    const upcomingTo = new Date();
    upcomingTo.setDate(upcomingTo.getDate() + 30);

    const upcomingToDate = upcomingTo.toISOString().split("T")[0];

    const upcomingLeave = leaveRequests
        .filter((leave) => {
            return (
                leave.startDate >= today &&
                leave.startDate <= upcomingToDate &&
                leave.status !== "rejected"
            );
        })
        .sort((a, b) => a.startDate.localeCompare(b.startDate))
        .slice(0, 10)
        .map((leave) => ({
            id: leave.id,
            employeeId: leave.employeeId,
            employeeName: employeeMap.get(leave.employeeId) ?? leave.employeeId,
            startDate: leave.startDate,
            endDate: leave.endDate,
            days: leave.days,
            status: leave.status,
        }));

    // ------------------------------------------------------------
    // Dashboard summary
    // ------------------------------------------------------------

    return {
        dateRange: {
            from,
            to,
        },

        headcountByDepartment,

        taskCompletionRate: {
            completed: completedTasks,
            total: totalTasks,
            percentage: taskCompletionRate,
        },

        overdueTasks: {
            count: overdueTaskCount,
        },

        upcomingLeave,
    };
}
