"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getMe, type AuthUser } from "@/lib/api";

export function DashboardAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const me = await getMe();
        if (cancelled) return;
        setUser(me.user);
      } catch {
        if (cancelled) return;
        const redirect = encodeURIComponent(pathname || "/dashboard");
        router.replace(`/login?redirect=${redirect}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}

