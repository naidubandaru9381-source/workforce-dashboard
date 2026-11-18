export type UserRole = "admin" | "manager" | "employee";

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
}

export interface RefreshResponse {
  accessToken: string;
  accessTokenExpiresAt: number;
}