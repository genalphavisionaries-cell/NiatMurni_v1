/**
 * Admin session flag cookie (set by Laravel on login, non-HttpOnly so Next.js middleware can read it).
 * Laravel also sets admin_token (HttpOnly) for API auth.
 */
export const ADMIN_SESSION_COOKIE = "admin_session";
export const PARTICIPANT_SESSION_COOKIE = "participant_session";

export function getAdminSessionCookieName(): string {
  return ADMIN_SESSION_COOKIE;
}

export function getParticipantSessionCookieName(): string {
  return PARTICIPANT_SESSION_COOKIE;
}
