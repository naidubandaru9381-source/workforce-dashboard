import { authHandlers } from "./auth.handlers";
import { employeeHandlers } from "./employee.handlers";

export const handlers = [
  ...authHandlers,
  ...employeeHandlers,
];
