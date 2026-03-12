/**
 * Admin API client for Laravel backend.
 * Base URL: NEXT_PUBLIC_API_URL (fallback: NEXT_PUBLIC_LARAVEL_API_URL).
 * Uses credentials (cookies) for auth.
 */

function getBaseURL(): string {
  if (typeof window === "undefined") return "";
  const env = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_LARAVEL_API_URL;
  if (env && (env.startsWith("http://") || env.startsWith("https://"))) return env.replace(/\/$/, "");
  const origin = window.location?.origin;
  if (origin && origin !== "null" && (origin.startsWith("http://") || origin.startsWith("https://")))
    return origin;
  return "http://localhost:8000";
}

export const adminApiBaseURL = getBaseURL();

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type LoginResponse = { user: AdminUser };
export type MeResponse = { user: AdminUser };

async function request<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<T> {
  const { params, ...init } = options;
  const base = getBaseURL();
  if (!base) throw new Error("Admin API base URL is not configured. Set NEXT_PUBLIC_API_URL or NEXT_PUBLIC_LARAVEL_API_URL.");
  const url = new URL(path, base);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { message?: string }).message || `Request failed: ${res.status}`);
  }
  return data as T;
}

export const adminApi = {
  login(email: string, password: string): Promise<LoginResponse> {
    return request<LoginResponse>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  logout(): Promise<{ message: string }> {
    return request<{ message: string }>("/api/admin/logout", { method: "POST" });
  },

  me(): Promise<MeResponse> {
    return request<MeResponse>("/api/admin/me");
  },
};
