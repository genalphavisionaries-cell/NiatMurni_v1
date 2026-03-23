"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Legacy path: forward to native /admin/users page. */
export default function AdminSettingsUsersRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/users");
  }, [router]);

  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <p className="text-sm text-gray-500">
        Redirecting…{" "}
        <a href="/admin/users" className="text-blue-600 underline">
          Open User Management
        </a>
      </p>
    </div>
  );
}
