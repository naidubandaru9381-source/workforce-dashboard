import {
    fetchBaseQuery,
    type BaseQueryFn,
    type FetchArgs,
    type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { saveAuthSession } from "@/lib/auth/authStorage";

import type { RootState } from "@/store";
import {
    logout,
    updateAccessToken,
} from "@/features/auth/authSlice";

const rawBaseQuery = fetchBaseQuery({
    baseUrl: "/api",

    prepareHeaders: (headers, { getState }) => {
        const state = getState() as RootState;
        const accessToken = state.auth.accessToken;

        if (accessToken) {
            console.log("[RTK Query] Access token found:", accessToken);
            headers.set("Authorization", `Bearer ${accessToken}`);
        } else {
            console.log("[RTK Query] No access token found");
        }

        headers.set("Content-Type", "application/json");

        return headers;
    },
});

const mutex = new Mutex();

export const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    await mutex.waitForUnlock();

    let result = await rawBaseQuery(
        args,
        api,
        extraOptions,
    );

    const requestUrl =
        typeof args === "string" ? args : args.url;

    if (
        result.error?.status === 401 &&
        !requestUrl.includes("/auth/refresh")
    ) {
        if (!mutex.isLocked()) {
            const release = await mutex.acquire();

            try {
                const state = api.getState() as RootState;
                const refreshToken =
                    state.auth.refreshToken ||
                    sessionStorage.getItem(
                        "workforce-refresh-token",
                    );
                if (!refreshToken) {
                    api.dispatch(logout());

                    return result;
                }

                const refreshResult = await rawBaseQuery(
                    {
                        url: "/auth/refresh",
                        method: "POST",
                        body: {
                            refreshToken,
                        },
                    },
                    api,
                    extraOptions,
                );

                if (refreshResult.data) {
                    const refreshData =
                        refreshResult.data as {
                            accessToken: string;
                            accessTokenExpiresAt: number;
                        };

                    api.dispatch(
                        updateAccessToken(refreshData),
                    );

                    const latestState =
                        api.getState() as RootState;

                    if (
                        latestState.auth.user &&
                        latestState.auth.refreshToken
                    ) {
                        saveAuthSession({
                            user: latestState.auth.user,
                            accessToken:
                                refreshData.accessToken,
                            refreshToken:
                                latestState.auth.refreshToken,
                            accessTokenExpiresAt:
                                refreshData.accessTokenExpiresAt,
                        });
                    }

                    result = await rawBaseQuery(
                        args,
                        api,
                        extraOptions,
                    );
                } else {
                    api.dispatch(logout());
                }
            } finally {
                release();
            }
        } else {
            await mutex.waitForUnlock();

            result = await rawBaseQuery(
                args,
                api,
                extraOptions,
            );
        }
    }

    return result;
};