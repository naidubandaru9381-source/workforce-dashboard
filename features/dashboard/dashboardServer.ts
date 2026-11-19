import {
  generateEmployees,
  generateTasks,
  generateLeaveRequests,
} from "@/mocks/data/seed";

import type { DashboardSummary } from "@/types/dashboard";

export async function getDashboardSummaryServer(
  from: string,
  to: string,
): Promise<DashboardSummary> {
  const employees = generateEmployees(5000);
  const tasks = generateTasks(20000);
  const leaveRequests = generateLeaveRequests(500);

  const headcountMap = new Map<string, number>();

  employees
    .filter((employee) => employee.status === "active")
    .forEach((employee) => {
      const count =
        headcountMap.get(employee.department) ?? 0;

      headcountMap.set(
        employee.department,
        count + 1,
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

  const now = new Date();

  const overdueTasks = tasks.filter((task) => {
    const dueDate = new Date(task.dueDate);

    return (
      dueDate < now &&
      task.status !== "done"
    );
  }).length;

  // Upcoming leave means leave starting
  // today through the next 30 days.
  const today = new Date()
    .toISOString()
    .split("T")[0];

  const upcomingTo = new Date();

  upcomingTo.setDate(
    upcomingTo.getDate() + 30,
  );

  const upcomingToDate = upcomingTo
    .toISOString()
    .split("T")[0];

  const upcomingLeave = leaveRequests
    .filter((leave) => {
      return (
        leave.startDate >= today &&
        leave.startDate <= upcomingToDate &&
        leave.status !== "rejected"
      );
    })
    .sort((a, b) =>
      a.startDate.localeCompare(b.startDate),
    )
    .slice(0, 10)
    .map((leave) => {
      const employee = employees.find(
        (employee) =>
          employee.id === leave.employeeId,
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
      count: overdueTasks,
    },

    upcomingLeave,
  };
}