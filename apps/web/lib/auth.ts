/**
 * Admin session cookie name (Next.js dashboard).
 * Used by middleware and login/logout.
 */
export const ADMIN_SESSION_COOKIE = "niatmurni_admin_session";

export function getAdminSessionCookieName(): string {
  return ADMIN_SESSION_COOKIE;
}
