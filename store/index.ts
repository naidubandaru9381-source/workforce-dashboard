import {
  configureStore,
} from "@reduxjs/toolkit";

import {
  setupListeners,
} from "@reduxjs/toolkit/query";

import authReducer from "@/features/auth/authSlice";

import {
  baseApi,
} from "@/store/api/baseApi";

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,

      [baseApi.reducerPath]:
        baseApi.reducer,
    },

    middleware: (
      getDefaultMiddleware,
    ) =>
      getDefaultMiddleware().concat(
        baseApi.middleware,
      ),
  });

  setupListeners(store.dispatch);

  return store;
};

export const store = makeStore();

export type AppStore =
  ReturnType<typeof makeStore>;

export type RootState =
  ReturnType<AppStore["getState"]>;

export type AppDispatch =
  AppStore["dispatch"];