import { baseApi } from "@/store/api/baseApi";
import { setCredentials } from "./authSlice";

import type {
  LoginRequest,
  LoginResponse,
} from "@/types/auth";

import { saveAuthSession } from "@/lib/auth/authStorage";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),

      async onQueryStarted(
        _credentials,
        { dispatch, queryFulfilled },
      ) {
        try {
          const { data } =
            await queryFulfilled;

          dispatch(setCredentials(data));

          saveAuthSession(data);
        } catch {
          // Login errors are handled by the component.
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
} = authApi;