/**
 * User portal API client (Laravel backend).
 * Backend participant endpoints remain unchanged during frontend migration.
 */

import { apiUrl } from "./config";

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
  const p = path.startsWith("/") ? path : `/${path}`;
  let fullUrl = apiUrl(p);
  if (!fullUrl) {
    throw new Error(
      "User API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL or NEXT_PUBLIC_API_URL."
    );
  }
  if (params) {
    const u = new URL(fullUrl);
    Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
    fullUrl = u.toString();
  }
  const res = await fetch(fullUrl, {
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

export const fetchUserCertificates = fetchParticipantCertificates;

export async function participantLogin(
  email: string,
  password: string
): Promise<ParticipantLoginResponse> {
  return request<ParticipantLoginResponse>("/api/participant/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export const userLogin = participantLogin;

export async function participantLogout(): Promise<void> {
  await request("/api/participant/logout", { method: "POST" });
}

export const userLogout = participantLogout;

export async function fetchParticipantMe(): Promise<{ participant: { id: number; full_name: string; email: string | null } }> {
  return request("/api/participant/me");
}

export const fetchUserMe = fetchParticipantMe;
