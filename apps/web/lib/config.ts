/**
 * Laravel API origin from `NEXT_PUBLIC_API_URL`.
 *
 * IMPORTANT:
 * NEXT_PUBLIC_API_URL must NOT include /api
 * Example: https://api.niatmurniacademy.com
 *
 * All API routes in code use paths like `/api/...`. A trailing `/api` in the
 * env value is stripped defensively so older deployments keep working.
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export function getApiBase(): string {
  let b = API_BASE.trim().replace(/\/$/, "");
  if (b.endsWith("/api")) {
    b = b.slice(0, -4).replace(/\/$/, "");
  }
  return b;
}
