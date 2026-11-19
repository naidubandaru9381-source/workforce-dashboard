import { http, HttpResponse, delay } from "msw";

import {
  generateEmployees,
  generateTasks,
  generateLeaveRequests,
} from "@/mocks/data/seed";

import { validateMockAccessToken } from "./auth.utils";
import type { DashboardSummary } from "@/types/dashboard";

const employees = generateEmployees(5000);
const tasks = generateTasks(20000);
const leaveRequests = generateLeaveRequests(500);

export const dashboardHandlers = [
  http.get("/api/dashboard/summary", async ({ request }) => {
    await delay(400);

    validateMockAccessToken(
      request.headers.get("authorization"),
    );

    const url = new URL(request.url);

    const today = new Date();

    const defaultFrom = new Date(today);
    defaultFrom.setDate(today.getDate() - 30);

    const defaultTo = new Date(today);
    defaultTo.setDate(today.getDate() + 30);

    const from =
      url.searchParams.get("from") ??
      defaultFrom.toISOString().split("T")[0];

    const to =
      url.searchParams.get("to") ??
      defaultTo.toISOString().split("T")[0];

    /*
     * Headcount by department
     */
    const headcountMap = new Map<string, number>();

    employees
      .filter((employee) => employee.status === "active")
      .forEach((employee) => {
        const currentCount =
          headcountMap.get(employee.department) ?? 0;

        headcountMap.set(
          employee.department,
          currentCount + 1,
        );
      });

    const headcountByDepartment = Array.from(
      headcountMap.entries(),
    )
      .map(([department, count]) => ({
        department,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    /*
     * Tasks inside selected date range
     */
    const rangeTasks = tasks.filter((task) => {
      const taskDate = task.dueDate.split("T")[0];

      return taskDate >= from && taskDate <= to;
    });

    const completedTasks = rangeTasks.filter(
      (task) => task.status === "done",
    ).length;

    const totalTasks = rangeTasks.length;

    const taskCompletionRate =
      totalTasks === 0
        ? 0
        : Math.round(
            (completedTasks / totalTasks) * 100,
          );

    /*
     * Overdue tasks
     */
    const now = new Date();

    const overdueTasks = tasks.filter((task) => {
      const dueDate = new Date(task.dueDate);

      return (
        dueDate < now &&
        task.status !== "done"
      );
    }).length;

    /*
     * Upcoming leave
     */
    const upcomingLeave = leaveRequests
      .filter((leave) => {
        return (
          leave.startDate >= from &&
          leave.startDate <= to &&
          leave.status !== "rejected"
        );
      })
      .sort((a, b) =>
        a.startDate.localeCompare(b.startDate),
      )
      .slice(0, 10)
      .map((leave) => {
        const employee = employees.find(
          (item) => item.id === leave.employeeId,
        );

        return {
          id: leave.id,
          employeeId: leave.employeeId,
          employeeName: employee
            ? `${employee.firstName} ${employee.lastName}`
            : leave.employeeId,
          startDate: leave.startDate,
          endDate: leave.endDate,
          days: leave.days,
          status: leave.status,
        };
      });

    const summary: DashboardSummary = {
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
        count: overdueTasks,
      },

      upcomingLeave,
    };

    return HttpResponse.json({
      data: summary,
    });
  }),
];