import type {
    LoginRequest,
    LoginResponse,
    RefreshResponse,
    User,
} from "@/types/auth";

export type { LoginRequest, LoginResponse, RefreshResponse, User };

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    accessTokenExpiresAt: number | null;
    isAuthenticated: boolean;
    isHydrated: boolean;
}
