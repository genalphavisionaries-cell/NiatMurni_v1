"use client";

import type { ReactNode } from "react";
import { Navbar } from "@/components/dashboard-shell/Navbar";
import { Sidebar } from "@/components/dashboard-shell/Sidebar";
import { BottomNav } from "@/components/dashboard-shell/BottomNav";
import { DashboardAuthGate } from "@/components/dashboard-shell/DashboardAuthGate";

// WARNING: Do not mix admin components into dashboard layout.
// Participant dashboard is isolated under /dashboard/* routes only.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardAuthGate>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto flex w-full max-w-[1100px]">
          <Sidebar />
          <main className="w-full flex-1 p-4 pb-24 sm:p-6 lg:p-8">{children}</main>
        </div>
        <BottomNav />
      </div>
    </DashboardAuthGate>
  );
}

