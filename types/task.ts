export type TaskStatus = "todo" | "in_progress" | "in_review" | "done";

export interface Task {
    id: string;
    projectId: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: "low" | "medium" | "high" | "critical";
    assigneeId: string;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
}
export interface TaskComment {
    id: string;
    taskId: string;
    userId: string;
    userName: string;
    content: string;
    createdAt: string;
}

export interface TaskActivity {
    id: string;
    taskId: string;
    userId: string;
    userName: string;
    action: string;
    description: string;
    createdAt: string;
}
