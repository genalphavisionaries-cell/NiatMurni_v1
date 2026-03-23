"use client";

import { useEffect, useState } from "react";
import { getFilamentBaseUrl, getFilamentUsersUrl } from "@/lib/filament-admin-url";

/**
 * Bridge page: static Next admin has no Filament server. This route exists so
 * /admin/users is not a Next 404; we send the browser to the Laravel Filament URL.
 *
 * When NEXT_PUBLIC_FILAMENT_BASE_URL or NEXT_PUBLIC_LARAVEL_API_URL is set, we
 * redirect to that origin + /admin/users. If unset, we show a link to /admin/users
 * (works when hosting routes /admin/* to Laravel only).
 */
export default function AdminUsersBridgePage() {
  const [showManual, setShowManual] = useState(false);
  const target = getFilamentUsersUrl();
  const base = getFilamentBaseUrl();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Different origin → safe full redirect (no Next/Laravel path conflict).
    if (base) {
      try {
        const targetOrigin = new URL(target).origin;
        if (targetOrigin !== window.location.origin) {
          window.location.replace(target);
          return;
        }
      } catch {
        setShowManual(true);
        return;
      }
    }

    // Same origin as Filament base: one hard navigation may reach Laravel if the
    // edge routes /admin/* to Laravel. Guard against redirect loops.
    const key = "nm_filament_users_nav";
    const n = parseInt(sessionStorage.getItem(key) ?? "0", 10);
    if (n < 1) {
      sessionStorage.setItem(key, String(n + 1));
      window.location.replace(target);
      return;
    }

    sessionStorage.removeItem(key);
    setShowManual(true);
  }, [base, target]);

  return (
    <div className="mx-auto max-w-lg space-y-4 p-6">
      <h1 className="text-xl font-semibold text-gray-900">User management</h1>
      <p className="text-sm text-gray-600">
        User accounts are managed in the Laravel Filament admin. If you are not redirected automatically, use the link
        below.
      </p>
      <a
        href={target}
        className="inline-flex rounded-lg bg-[var(--primary,#2563eb)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Open Users (Filament)
      </a>
      {!base && (
        <p className="text-xs text-amber-800">
          Tip: set <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_FILAMENT_BASE_URL</code> (or{" "}
          <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_LARAVEL_API_URL</code>) to your Laravel site origin so
          this page can redirect reliably.
        </p>
      )}
      {showManual && (
        <p className="text-xs text-gray-500">
          If this link still opens the wrong app, configure your host so requests to <code>/admin/*</code> are served by
          the Laravel application, or set the env vars above to the Laravel base URL.
        </p>
      )}
    </div>
  );
}
