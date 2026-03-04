"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { DashboardRole } from "./dashboard-config";
import { SIDEBAR_WIDTH } from "./dashboard-config";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type DashboardLayoutProps = {
  children: React.ReactNode;
  role: DashboardRole;
};

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        role={role}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          aria-hidden
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className={cn(
          "flex flex-col transition-[margin-left] duration-200",
          sidebarCollapsed ? "md:ml-[72px]" : "md:ml-[260px]"
        )}
      >
        <Topbar
          role={role}
          sidebarCollapsed={sidebarCollapsed}
          onMenuClick={() => setMobileOpen((o) => !o)}
        />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
