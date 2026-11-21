export type EmployeeStatus = "active" | "inactive";

export interface Employee {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    department: string;
    designation: string;
    status: EmployeeStatus;
    joinDate: string;
    salary: number;
    managerId: string | null;
    avatar: string;
}
