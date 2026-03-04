"use client";

import { Bell, LogOut, Menu, Search, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SIDEBAR_WIDTH } from "./dashboard-config";

type TopbarProps = {
  role: "admin" | "tutor" | "participant";
  sidebarCollapsed: boolean;
  onMenuClick: () => void;
};

export function Topbar({ role, sidebarCollapsed, onMenuClick }: TopbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const basePath = role === "admin" ? "/admin" : role === "tutor" ? "/tutor" : "/participant";

  return (
    <header
      className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-4 border-b border-[var(--border)] bg-white px-4 transition-[margin-left] duration-200"
      style={{ marginLeft: sidebarCollapsed ? 72 : SIDEBAR_WIDTH }}
    >
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div
        className={cn(
          "flex flex-1 items-center gap-3 rounded-lg border bg-gray-50/80 px-3 py-2 transition-colors",
          searchFocused && "border-gray-300 bg-white ring-1 ring-gray-200"
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-gray-400" />
        <input
          type="search"
          placeholder="Search..."
          className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-500" aria-hidden />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setUserOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg p-1.5 pr-2 text-gray-700 hover:bg-gray-100"
            aria-expanded={userOpen}
            aria-haspopup="true"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden text-sm font-medium md:inline">
              {role === "admin" ? "Admin" : role === "tutor" ? "Tutor" : "Participant"}
            </span>
          </button>
          {userOpen && (
            <>
              <div className="fixed inset-0 z-40" aria-hidden onClick={() => setUserOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-[var(--border)] bg-white py-1 shadow-lg">
                <Link
                  href={`${basePath}/profile`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setUserOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/"
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setUserOpen(false)}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
