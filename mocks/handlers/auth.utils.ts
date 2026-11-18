interface MockAccessTokenPayload {
  userId: string;
  expiresAt: number;
}

export function createMockAccessToken(
  userId: string,
  expiresAt: number,
) {
  return `access-${userId}-${expiresAt}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

export function validateMockAccessToken(
  authorizationHeader: string | null,
) {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorizationHeader.replace(
    "Bearer ",
    "",
  );

  const parts = token.split("-");

  /*
    Expected format:

    access-user-003-1795001912329-randomvalue

    parts:
    0 → access
    1 → user
    2 → 003
    3 → expiresAt
    4 → random value
  */

  if (
    parts.length < 5 ||
    parts[0] !== "access"
  ) {
    return null;
  }

  const userId = `${parts[1]}-${parts[2]}`;

  const expiresAt = Number(parts[3]);

  if (
    !userId ||
    !Number.isFinite(expiresAt)
  ) {
    return null;
  }

  if (Date.now() >= expiresAt) {
    return null;
  }

  return userId;
}