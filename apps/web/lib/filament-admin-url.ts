/**
 * Resolve the public URL for Laravel Filament (same app as API unless overridden).
 *
 * The Next.js admin shell is served by the Node runtime (`next start`); Filament lives on the Laravel app.
 * Set NEXT_PUBLIC_FILAMENT_BASE_URL to the Laravel origin (no trailing slash), e.g.
 *   https://niatmurniacademy.com
 *
 * If unset, falls back to `getApiBase()` (Laravel API origin, no /api suffix).
 */
import { getApiBase } from "./config";

export function getFilamentBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_FILAMENT_BASE_URL;
  if (!explicit) return "";
  const trimmed = explicit.trim();
  if (trimmed) {
    return trimmed.replace(/\/$/, "");
  }

  return getApiBase();
}

/** Full URL to the Filament UserResource list (Settings → Users in Laravel). */
export function getFilamentUsersUrl(): string {
  const base = getFilamentBaseUrl();
  if (!base) {
    return "/admin/users";
  }
  return `${base}/admin/users`;
}
