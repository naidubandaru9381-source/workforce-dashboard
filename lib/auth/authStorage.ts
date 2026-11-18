import type { LoginResponse } from "@/types/auth";

const AUTH_STORAGE_KEY = "workforce_auth";

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
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}