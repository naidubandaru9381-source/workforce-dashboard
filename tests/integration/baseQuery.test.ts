import type { BaseQueryApi } from "@reduxjs/toolkit/query";

const mockRawBaseQuery = jest.fn();

jest.mock("@reduxjs/toolkit/query/react", () => {
    const actual = jest.requireActual(
        "@reduxjs/toolkit/query/react",
    );

    return {
        ...actual,
        fetchBaseQuery: jest.fn(
            () => mockRawBaseQuery,
        ),
    };
});

jest.mock("@/lib/auth/authStorage", () => ({
    saveAuthSession: jest.fn(),
}));

import { baseQueryWithReauth } from "@/store/api/baseQuery";

describe("baseQueryWithReauth", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        sessionStorage.clear();
    });

    it("uses one refresh request when multiple requests receive 401", async () => {
        let refreshCallCount = 0;

        mockRawBaseQuery.mockImplementation(
            async (args: unknown) => {
                const requestUrl =
                    typeof args === "string"
                        ? args
                        : (
                              args as {
                                  url?: string;
                              }
                          ).url;

                if (requestUrl === "/auth/refresh") {
                    refreshCallCount += 1;

                    await new Promise((resolve) =>
                        setTimeout(resolve, 50),
                    );

                    return {
                        data: {
                            accessToken:
                                "new-access-token",
                            accessTokenExpiresAt:
                                Date.now() + 60000,
                        },
                    };
                }

                return {
                    error: {
                        status: 401,
                        data: {
                            message:
                                "Access token expired",
                        },
                    },
                };
            },
        );

        const dispatch = jest.fn();

        const getState = jest.fn(() => ({
            auth: {
                accessToken:
                    "expired-access-token",
                refreshToken:
                    "valid-refresh-token",
                user: {
                    id: "user-1",
                    role: "manager",
                },
            },
        }));

        const createApi = (): BaseQueryApi => ({
            signal: new AbortController().signal,
            abort: jest.fn(),
            dispatch,
            getState,
            extra: undefined,
            endpoint: "test",
            type: "query",
            forced: false,
        });

        await Promise.all([
            baseQueryWithReauth(
                "/employees",
                createApi(),
                {},
            ),
            baseQueryWithReauth(
                "/employees",
                createApi(),
                {},
            ),
            baseQueryWithReauth(
                "/employees",
                createApi(),
                {},
            ),
        ]);

        expect(refreshCallCount).toBe(1);
    });
});
