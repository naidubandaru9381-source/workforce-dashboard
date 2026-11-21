import {
    generateEmployees,
    generateLeaveRequests,
    generateProjects,
    generateTasks,
} from "./seed";

import type { Employee } from "@/types/employee";
import type { LeaveRequest } from "@/types/leave";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";

let employees: Employee[] | null = null;
let projects: Project[] | null = null;
let tasks: Task[] | null = null;
let leaveRequests: LeaveRequest[] | null = null;

export function getEmployees(): Employee[] {
    if (!employees) {
        employees = generateEmployees(5000);
    }

    return employees;
}

export function getProjects(): Project[] {
    if (!projects) {
        projects = generateProjects(25);
    }

    return projects;
}

export function getTasks(): Task[] {
    if (!tasks) {
        tasks = generateTasks(20000);
    }

    return tasks;
}

export function getLeaveRequests(): LeaveRequest[] {
    if (!leaveRequests) {
        leaveRequests = generateLeaveRequests(500);
    }

    return leaveRequests;
}
