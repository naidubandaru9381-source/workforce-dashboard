import type { Employee, EmployeeStatus } from "@/types/employee";
import type { Task, TaskStatus } from "@/types/task";
import type { Project } from "@/types/project";
import type { LeaveRequest, LeaveStatus } from "@/types/leave";

const FIRST_NAMES = [
  "Aarav",
  "Vivaan",
  "Aditya",
  "Arjun",
  "Rahul",
  "Rohan",
  "Kiran",
  "Vikram",
  "Ananya",
  "Priya",
  "Sneha",
  "Kavya",
];

const LAST_NAMES = [
  "Sharma",
  "Reddy",
  "Kumar",
  "Patel",
  "Rao",
  "Naidu",
  "Verma",
  "Singh",
  "Iyer",
  "Nair",
];

const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Finance",
  "Human Resources",
  "Sales",
  "Operations",
];

const DESIGNATIONS = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "QA Engineer",
  "Product Manager",
  "UI/UX Designer",
  "Data Analyst",
];

const TASK_STATUSES: TaskStatus[] = [
  "todo",
  "in_progress",
  "in_review",
  "done",
];

const PRIORITIES = ["low", "medium", "high", "critical"] as const;

const LEAVE_STATUSES: LeaveStatus[] = [
  "pending",
  "approved",
  "rejected",
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function randomItem<T>(items: readonly T[], seed: number): T {
  return items[Math.floor(seededRandom(seed) * items.length)];
}

function dateFromSeed(seed: number, daysBack: number): string {
  const date = new Date();
  date.setDate(
    date.getDate() - Math.floor(seededRandom(seed) * daysBack),
  );

  return date.toISOString().split("T")[0];
}

export function generateEmployees(count = 5000): Employee[] {
  return Array.from({ length: count }, (_, index) => {
    const id = index + 1;

    const firstName = randomItem(FIRST_NAMES, id);
    const lastName = randomItem(LAST_NAMES, id + 100);

    const status: EmployeeStatus =
      seededRandom(id + 200) > 0.08 ? "active" : "inactive";

    return {
      id: `emp-${id}`,
      employeeId: `EMP${String(id).padStart(5, "0")}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${id}@workforce.test`,
      phone: `+91 9${String(100000000 + id).slice(-9)}`,
      department: randomItem(DEPARTMENTS, id + 300),
      designation: randomItem(DESIGNATIONS, id + 400),
      status,
      joinDate: dateFromSeed(id + 500, 3650),
      salary: 30000 + Math.floor(seededRandom(id + 600) * 120000),
      managerId: id > 20 ? `emp-${Math.floor(seededRandom(id + 700) * 20) + 1}` : null,
      avatar: `https://i.pravatar.cc/150?img=${(id % 70) + 1}`,
    };
  });
}

export function generateProjects(count = 25): Project[] {
  return Array.from({ length: count }, (_, index) => {
    const id = index + 1;

    return {
      id: `project-${id}`,
      name: `Workforce Project ${id}`,
      description: `Project ${id} for workforce management operations.`,
      status:
        id % 10 === 0
          ? "archived"
          : id % 5 === 0
            ? "completed"
            : "active",
      managerId: `emp-${(id % 20) + 1}`,
      createdAt: dateFromSeed(id + 1000, 1000),
    };
  });
}

export function generateTasks(
  count = 20000,
  employeeCount = 5000,
  projectCount = 25,
): Task[] {
  return Array.from({ length: count }, (_, index) => {
    const id = index + 1;

    const status = randomItem(TASK_STATUSES, id + 1000);

    const createdAt = new Date();
    createdAt.setDate(
      createdAt.getDate() - Math.floor(seededRandom(id + 1100) * 365),
    );

    const dueDate = new Date(createdAt);
    dueDate.setDate(
      dueDate.getDate() + Math.floor(seededRandom(id + 1200) * 60) + 1,
    );

    return {
      id: `task-${id}`,
      projectId: `project-${(id % projectCount) + 1}`,
      title: `Workforce task ${id}`,
      description: `Description for workforce task ${id}.`,
      status,
      priority: randomItem(PRIORITIES, id + 1300),
      assigneeId: `emp-${(id % employeeCount) + 1}`,
      dueDate: dueDate.toISOString(),
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    };
  });
}

export function generateLeaveRequests(
  count = 500,
  employeeCount = 5000,
): LeaveRequest[] {
  return Array.from({ length: count }, (_, index) => {
    const id = index + 1;

    const startDate = new Date();
    startDate.setDate(
      startDate.getDate() + Math.floor(seededRandom(id + 2000) * 60) - 30,
    );

    const endDate = new Date(startDate);
    endDate.setDate(
      endDate.getDate() + Math.floor(seededRandom(id + 2100) * 5) + 1,
    );

    const days =
      Math.floor(
        (endDate.getTime() - startDate.getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1;

    return {
      id: `leave-${id}`,
      employeeId: `emp-${(id % employeeCount) + 1}`,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      reason: `Leave request ${id}`,
      status: randomItem(LEAVE_STATUSES, id + 2200),
      days,
      createdAt: new Date().toISOString(),
      reviewedBy: null,
    };
  });
}