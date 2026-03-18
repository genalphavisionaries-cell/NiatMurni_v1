import { cmsString } from "@/lib/public-cms";

export function safeHref(url: string | null | undefined): string | null {
  const u = cmsString(url);
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/") || u.startsWith("#")) return u;
  return `/${u.replace(/^\//, "")}`;
}

export function parseJsonSafe<T>(raw: unknown): T | null {
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

export function extraString(
  extra: Record<string, string> | null | undefined,
  key: string
): string | null {
  return cmsString(extra?.[key]);
}


