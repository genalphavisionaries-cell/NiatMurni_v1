"use client";

import { usePathname } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return <>{children}</>;
  return <DashboardLayout role="admin">{children}</DashboardLayout>;
}
