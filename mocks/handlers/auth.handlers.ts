import { delay, http, HttpResponse } from "msw";

import type {
    LoginRequest,
    LoginResponse,
    RefreshResponse,
    User,
} from "@/types/auth";

import { createMockAccessToken } from "./auth.utils";

const users: Array<{
    user: User;
    password: string;
}> = [
    {
        user: {
            id: "user-001",
            employeeId: "EMP001",
            name: "Admin User",
            email: "admin@example.com",
            role: "admin",
            department: "Administration",
        },
        password: "Admin@123",
    },
    {
        user: {
            id: "user-002",
            employeeId: "EMP002",
            name: "Manager User",
            email: "manager@example.com",
            role: "manager",
            department: "Engineering",
        },
        password: "Manager@123",
    },
    {
        user: {
            id: "user-003",
            employeeId: "EMP003",
            name: "Employee User",
            email: "employee@example.com",
            role: "employee",
            department: "Engineering",
        },
        password: "Employee@123",
    },
];

function createRefreshToken(userId: string) {
    const randomPart = Math.random().toString(36).slice(2);

    return `refresh-${userId}-${Date.now()}-${randomPart}`;
}

function getUserIdFromRefreshToken(refreshToken: string) {
    if (!refreshToken.startsWith("refresh-")) {
        return null;
    }

    const parts = refreshToken.split("-");

    if (parts.length < 3) {
        return null;
    }

    const userId = `${parts[1]}-${parts[2]}`;

    const userExists = users.some((account) => account.user.id === userId);

    if (!userExists) {
        return null;
    }

    return userId;
}

function getExpiryTime() {
    return Date.now() + 60_000;
}

export const authHandlers = [
    http.post("/api/auth/login", async ({ request }) => {
        await delay(300);

        const body = (await request.json()) as LoginRequest;

        const account = users.find(
            (item) =>
                item.user.email === body.email &&
                item.password === body.password,
        );

        if (!account) {
            return HttpResponse.json(
                {
                    status: 401,
                    message: "Invalid email or password",
                    code: "INVALID_CREDENTIALS",
                },
                {
                    status: 401,
                },
            );
        }

        const accessTokenExpiresAt = getExpiryTime();

        const accessToken = createMockAccessToken(
            account.user.id,
            accessTokenExpiresAt,
        );

        const refreshToken = createRefreshToken(account.user.id);

        const response: LoginResponse = {
            user: account.user,
            accessToken,
            refreshToken,
            accessTokenExpiresAt,
        };

        return HttpResponse.json(response);
    }),

    http.post("/api/auth/refresh", async ({ request }) => {
        await delay(300);

        const body = (await request.json()) as {
            refreshToken?: string;
        };

        if (!body.refreshToken) {
            return HttpResponse.json(
                {
                    status: 401,
                    message: "Refresh token is required",
                    code: "REFRESH_TOKEN_MISSING",
                },
                {
                    status: 401,
                },
            );
        }

        const userId = getUserIdFromRefreshToken(body.refreshToken);

        if (!userId) {
            return HttpResponse.json(
                {
                    status: 401,
                    message: "Invalid refresh token",
                    code: "INVALID_REFRESH_TOKEN",
                },
                {
                    status: 401,
                },
            );
        }

        const accessTokenExpiresAt = getExpiryTime();

        const accessToken = createMockAccessToken(userId, accessTokenExpiresAt);

        const response: RefreshResponse = {
            accessToken,
            accessTokenExpiresAt,
        };

        return HttpResponse.json(response);
    }),
];
