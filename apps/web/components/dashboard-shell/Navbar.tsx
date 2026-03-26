"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api";

export function Navbar() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } finally {
      router.replace("/login");
      router.refresh();
      setLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1100px] items-center justify-between px-4 sm:px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Dashboard</p>
          <h1 className="text-base font-semibold text-slate-900">Participant Portal</h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          {loading ? "Signing out..." : "Logout"}
        </button>
      </div>
    </header>
  );
}

