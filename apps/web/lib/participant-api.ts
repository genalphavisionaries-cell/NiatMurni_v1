/**
 * Participant portal API client (Laravel backend).
 * Uses same base URL as admin API; credentials (cookies) for participant_token.
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

export type ParticipantCertificate = {
  certificate_number: string;
  program_name: string;
  issued_at: string | null;
  issue_date: string | null;
  download_url: string;
};

export type ParticipantCertificatesResponse = {
  certificates: ParticipantCertificate[];
};

export type ParticipantLoginResponse = {
  participant: { id: number; full_name: string; email: string | null };
};

async function request<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {}
): Promise<T> {
  const { params, ...init } = options;
  const base = getBaseURL();
  if (!base)
    throw new Error(
      "Participant API base URL is not configured. Set NEXT_PUBLIC_API_URL or NEXT_PUBLIC_LARAVEL_API_URL."
    );
  const url = new URL(path.startsWith("/") ? path : `/${path}`, base);
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
    throw new Error(
      (data as { message?: string }).message || `Request failed: ${res.status}`
    );
  }
  return data as T;
}

export async function fetchParticipantCertificates(): Promise<ParticipantCertificatesResponse> {
  return request<ParticipantCertificatesResponse>("/api/participant/certificates");
}

export async function participantLogin(
  email: string,
  password: string
): Promise<ParticipantLoginResponse> {
  return request<ParticipantLoginResponse>("/api/participant/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function participantLogout(): Promise<void> {
  await request("/api/participant/logout", { method: "POST" });
}

export async function fetchParticipantMe(): Promise<{ participant: { id: number; full_name: string; email: string | null } }> {
  return request("/api/participant/me");
}
