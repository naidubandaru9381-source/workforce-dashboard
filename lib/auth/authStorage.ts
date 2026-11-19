import type { LoginResponse } from "@/types/auth";

const AUTH_STORAGE_KEY = "workforce_auth";
const AUTH_COOKIE_KEY = "workforce-auth";

export function saveAuthSession(
  session: LoginResponse,
) {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify(session),
  );

  document.cookie = `${AUTH_COOKIE_KEY}=authenticated; path=/; max-age=3600; SameSite=Lax`;
}

export function getAuthSession(): LoginResponse | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedSession =
    sessionStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as LoginResponse;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(AUTH_STORAGE_KEY);

  document.cookie = `${AUTH_COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`;
}