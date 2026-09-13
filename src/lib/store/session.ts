const TOKEN_KEY = "enroll.session";

export function getStoreToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.sessionStorage.getItem(TOKEN_KEY) ?? window.localStorage.getItem(TOKEN_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export function setStoreToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.sessionStorage.setItem(TOKEN_KEY, token);
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      window.sessionStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    /* storage blocked */
  }
}

export const sessionPayload = { token: getStoreToken() };
