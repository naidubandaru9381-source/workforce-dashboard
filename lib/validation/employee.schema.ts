import { z } from "zod";

export const employeeSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required"),

  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required"),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address"),

  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 characters"),

  department: z
    .string()
    .trim()
    .min(1, "Department is required"),

  designation: z
    .string()
    .trim()
    .min(1, "Designation is required"),

  status: z.enum(["active", "inactive"]),

  joinDate: z
    .string()
    .min(1, "Join date is required"),

  salary: z
    .number()
    .min(0, "Salary cannot be negative"),
});

export type EmployeeFormValues = z.infer<
  typeof employeeSchema
>;