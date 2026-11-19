import { authHandlers } from "./auth.handlers";
import { employeeHandlers } from "./employee.handlers";
import { projectHandlers } from "./project.handlers";
import { leaveHandlers } from "./leave.handlers";
export const handlers = [
  ...authHandlers,
  ...employeeHandlers,
  ...projectHandlers,   
  ...leaveHandlers,
];
