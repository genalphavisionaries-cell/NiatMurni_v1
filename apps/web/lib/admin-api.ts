/**
 * Admin API client for Laravel backend.
 * Base URL: NEXT_PUBLIC_API_URL (fallback: NEXT_PUBLIC_LARAVEL_API_URL).
 * Uses credentials (cookies) for auth.
 */

const baseURL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_LARAVEL_API_URL || "")
    : "";

export const adminApiBaseURL = baseURL;

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
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = new URL(path, baseURL || origin);
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
