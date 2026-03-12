"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminTwoTierHeader } from "@/components/admin/AdminTwoTierHeader";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [checking, setChecking] = useState(pathname !== "/admin/login");

  useEffect(() => {
    if (pathname === "/admin/login") {
      setChecking(false);
      return;
    }
    let cancelled = false;
    setChecking(true);
    import("@/lib/admin-api").then(({ adminApi }) => {
      adminApi
        .me()
        .then((res) => {
          if (!cancelled) {
            setUser(res.user);
          }
        })
        .catch(() => {
          if (!cancelled) {
            window.location.href = "/admin/login?redirect=" + encodeURIComponent(pathname || "/admin");
          }
        })
        .finally(() => {
          if (!cancelled) setChecking(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <AdminTwoTierHeader user={user} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
