/**
 * Thin fetch client for the GuardNG API.
 * - JWT stored in localStorage, attached as a Bearer header
 * - 401 responses clear the session and notify AuthContext via an event
 * - Server error messages are surfaced as Error.message for the UI
 */

const BASE = (import.meta.env.VITE_API_URL as string) || "/api";
const TOKEN_KEY = "guardng_token";

export const UNAUTHORIZED_EVENT = "guardng:unauthorized";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${path}`, { method, headers, body: payload });

  if (res.status === 401) {
    setToken(null);
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      (data as { error?: string })?.error || `Request failed (${res.status})`
    );
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  del: <T>(path: string) => request<T>("DELETE", path),
};
