"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";

import { store } from "@/store";

import {
  hydrateCredentials,
  markAuthHydrated,
} from "@/features/auth/authSlice";

import { getAuthSession } from "@/lib/auth/authStorage";

interface StoreProviderProps {
  children: React.ReactNode;
}

export default function StoreProvider({
  children,
}: StoreProviderProps) {
  useEffect(() => {
    const session = getAuthSession();

    if (session) {
      store.dispatch(
        hydrateCredentials(session),
      );
    } else {
      store.dispatch(markAuthHydrated());
    }
  }, []);

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}