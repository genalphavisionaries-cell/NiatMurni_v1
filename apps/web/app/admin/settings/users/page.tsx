"use client";

import { useEffect } from "react";
import { getFilamentUsersUrl } from "@/lib/filament-admin-url";

/** Legacy path: forward to Filament UserResource (same bridge logic as /admin/users). */
export default function AdminSettingsUsersRedirect() {
  useEffect(() => {
    window.location.replace(getFilamentUsersUrl());
  }, []);

  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <p className="text-sm text-gray-500">
        Redirecting…{" "}
        <a href={getFilamentUsersUrl()} className="text-blue-600 underline">
          Open User Management
        </a>
      </p>
    </div>
  );
}
