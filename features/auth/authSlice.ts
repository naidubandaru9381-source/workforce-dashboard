import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { LoginResponse, RefreshResponse } from "@/types/auth";

import type { AuthState } from "./authTypes";

const initialState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    accessTokenExpiresAt: null,
    isAuthenticated: false,
    isHydrated: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,

    reducers: {
        setCredentials: (state, action: PayloadAction<LoginResponse>) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.accessTokenExpiresAt = action.payload.accessTokenExpiresAt;
            state.isAuthenticated = true;
            state.isHydrated = true;
        },

        hydrateCredentials: (state, action: PayloadAction<LoginResponse>) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.accessTokenExpiresAt = action.payload.accessTokenExpiresAt;
            state.isAuthenticated = true;
            state.isHydrated = true;
        },

        updateAccessToken: (state, action: PayloadAction<RefreshResponse>) => {
            state.accessToken = action.payload.accessToken;
            state.accessTokenExpiresAt = action.payload.accessTokenExpiresAt;
            state.isAuthenticated = true;
        },

        markAuthHydrated: (state) => {
            state.isHydrated = true;
        },

        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.accessTokenExpiresAt = null;
            state.isAuthenticated = false;
        },
    },
});

export const {
    setCredentials,
    hydrateCredentials,
    updateAccessToken,
    markAuthHydrated,
    logout,
} = authSlice.actions;

export default authSlice.reducer;
