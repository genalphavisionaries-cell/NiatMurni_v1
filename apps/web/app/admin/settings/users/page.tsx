"use client";

import { useEffect } from "react";

/**
 * User management has moved to the Filament admin resource at /admin/users.
 * This page exists only to redirect any bookmarked or old links.
 */
export default function AdminSettingsUsersRedirect() {
  useEffect(() => {
    window.location.replace("/admin/users");
  }, []);

  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <p className="text-sm text-gray-500">
        Redirecting to User Management…{" "}
        <a href="/admin/users" className="text-blue-600 underline">
          Click here if not redirected.
        </a>
      </p>
    </div>
  );
}
