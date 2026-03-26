"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminApi } from "@/lib/admin-api";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string; role?: string; modules?: string[]; module_access?: string[] } | null>(null);
  const [checking, setChecking] = useState(pathname !== "/admin/login");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
            if (res.user) {
              setUser(res.user);
              return;
            }
            window.location.href = "/admin/login?redirect=" + encodeURIComponent(pathname || "/admin");
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
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="text-sm font-semibold text-slate-900">Admin Panel</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{user?.name ?? "Admin"}</p>
              <p className="text-xs text-slate-500">{user?.email ?? "-"}</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  await adminApi.logout();
                } catch {
                  // ignore logout errors
                }
                router.push("/admin/login");
                router.refresh();
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <AdminSidebar mobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />
        <main className="min-w-0 flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
