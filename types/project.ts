export interface Project {
    id: string;
    name: string;
    description: string;
    status: "active" | "completed" | "archived";
    managerId: string;
    createdAt: string;
}
