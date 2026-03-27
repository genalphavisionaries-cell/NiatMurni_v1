/**
 * Laravel API origin. Use ONLY `NEXT_PUBLIC_API_URL` (e.g. `https://api.example.com` or `https://example.com/api`).
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export function getApiBase(): string {
  return API_BASE.replace(/\/$/, "");
}
