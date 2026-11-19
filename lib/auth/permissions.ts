import type { UserRole } from "@/types/auth";

export const rolePermissions = {
  admin: {
    canViewEmployees: true,
    canEditEmployees: true,
    canManageProjects: true,
    canManageLeave: true,
    canApproveLeave: true,
  },

  manager: {
    canViewEmployees: true,
    canEditEmployees: true,
    canManageProjects: true,
    canManageLeave: true,
    canApproveLeave: true,
  },

  employee: {
    canViewEmployees: false,
    canEditEmployees: false,
    canManageProjects: false,
    canManageLeave: true,
    canApproveLeave: false,
  },
} satisfies Record<
  UserRole,
  Record<string, boolean>
>;

export function hasPermission(
  role: UserRole,
  permission: keyof (typeof rolePermissions)["admin"],
) {
  return rolePermissions[role][permission];
}