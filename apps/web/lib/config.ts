/**
 * Laravel API origin for absolute URLs: `${getApiBase()}/api/...` or {@link apiUrl}.
 *
 * Prefer:
 *   NEXT_PUBLIC_API_BASE_URL=https://api.example.com
 * Fallback (existing deployments):
 *   NEXT_PUBLIC_API_URL (same shape — no `/api` suffix; a trailing `/api` is stripped)
 *
 * Never use relative `/api/...` fetch targets — always build with {@link apiUrl}.
 */

function rawFromEnv(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  ).trim();
}

function stripTrailingSlashAndApiSegment(value: string): string {
  let v = value.replace(/\/+$/, "");
  if (v.endsWith("/api")) {
    v = v.slice(0, -4).replace(/\/+$/, "");
  }
  return v;
}

function normalizeOrigin(origin: string): string {
  if (!origin) return "";
  const stripped = stripTrailingSlashAndApiSegment(origin);
  if (!stripped.startsWith("http://") && !stripped.startsWith("https://")) {
    return stripped;
  }
  try {
    const u = new URL(stripped);
    const isLoopback =
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1" ||
      u.hostname === "[::1]";
    if (process.env.NODE_ENV === "production" && !isLoopback && u.protocol === "http:") {
      u.protocol = "https:";
    }
    return `${u.protocol}//${u.host}`;
  } catch {
    return stripped;
  }
}

/** Normalized API origin (no path). Empty if unset. */
export function getApiBase(): string {
  return normalizeOrigin(rawFromEnv());
}

/**
 * Absolute URL for a Laravel route path (must start with `/api/`).
 * Example: apiUrl("/api/public/cms") → "https://api.example.com/api/public/cms"
 */
export function apiUrl(apiPath: string): string {
  const base = getApiBase();
  if (!base) return "";
  const path = apiPath.startsWith("/") ? apiPath : `/${apiPath}`;
  return `${base}${path}`;
}
