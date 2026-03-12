"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, Moon, Search, Sun, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getNavForRole, type NavItem } from "@/components/dashboard/dashboard-config";
import { adminApi } from "@/lib/admin-api";

const MAX_VISIBLE_NAV = 6;

type AdminTwoTierHeaderProps = {
  user: { name: string; email: string } | null;
};

export function AdminTwoTierHeader({ user }: AdminTwoTierHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = getNavForRole("admin");
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);

  const visible = navItems.slice(0, MAX_VISIBLE_NAV);
  const overflow = navItems.slice(MAX_VISIBLE_NAV);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) setOverflowOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    try {
      await adminApi.logout();
    } catch {
      // ignore
    }
    router.push("/admin/login");
    router.refresh();
  };

  const isActive = (item: NavItem) => {
    if (pathname === item.href) return true;
    if (item.children?.some((c) => pathname === c.href)) return true;
    return false;
  };

  return (
    <>
      {/* Tier 1: Primary bar */}
      <header
        className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 px-4 text-white"
        style={{ backgroundColor: "var(--primary)" }}
      >
        <Link href="/admin" className="flex shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-sm font-bold">
            N
          </div>
          <span className="hidden font-semibold sm:inline">Niat Murni Academy</span>
        </Link>

        <div
          className={cn(
            "flex flex-1 max-w-xl mx-auto items-center gap-2 rounded-lg bg-white/10 px-3 py-2 transition-colors",
            searchFocused && "bg-white/15 ring-1 ring-white/30"
          )}
        >
          <Search className="h-4 w-4 shrink-0 text-white/70" />
          <input
            type="search"
            placeholder="Search programs, bookings, participants..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full bg-transparent text-sm text-white placeholder:text-white/60 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="relative rounded-lg p-2 text-white/90 hover:bg-white/10 hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-400" aria-hidden />
          </button>

          <button
            type="button"
            onClick={() => setDarkMode((d) => !d)}
            className="rounded-lg p-2 text-white/90 hover:bg-white/10 hover:text-white"
            aria-label={darkMode ? "Light mode" : "Dark mode"}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-white/90 hover:bg-white/10 hover:text-white"
              aria-expanded={profileOpen}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
                <User className="h-4 w-4" />
              </div>
              <span className="hidden max-w-[120px] truncate text-sm font-medium md:inline">
                {user?.name ?? "Admin"}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] py-1 shadow-lg">
                <div className="border-b border-[var(--border)] px-4 py-2">
                  <p className="truncate text-sm font-medium text-[var(--text-primary)]">{user?.name}</p>
                  <p className="truncate text-xs text-[var(--text-secondary)]">{user?.email}</p>
                </div>
                <Link
                  href="/admin/settings/users"
                  className="block px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-gray-50"
                  onClick={() => setProfileOpen(false)}
                >
                  Settings
                </Link>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-gray-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((o) => !o)}
          className="rounded-lg p-2 text-white/90 hover:bg-white/10 md:hidden"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Tier 2: White nav bar */}
      <nav className="sticky top-14 z-20 flex h-12 shrink-0 items-center gap-0 border-b border-[var(--border)] bg-[var(--card-bg)] px-4">
        <div className="hidden md:flex md:items-center md:gap-0">
          {visible.map((item) => (
            <NavLink key={item.href + item.label} item={item} pathname={pathname} isActive={isActive(item)} />
          ))}
          {overflow.length > 0 && (
            <div className="relative" ref={overflowRef}>
              <button
                type="button"
                onClick={() => setOverflowOpen((o) => !o)}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  overflow.some(isActive)
                    ? "bg-gray-100 text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-gray-50 hover:text-[var(--text-primary)]"
                )}
              >
                More
                <ChevronDown className={cn("h-4 w-4 transition-transform", overflowOpen && "rotate-180")} />
              </button>
              {overflowOpen && (
                <div className="absolute left-0 top-full z-50 mt-0.5 min-w-[180px] rounded-xl border border-[var(--border)] bg-[var(--card-bg)] py-1 shadow-lg">
                  {overflow.map((item) => (
                    <NavLink
                      key={item.href + item.label}
                      item={item}
                      pathname={pathname}
                      isActive={isActive(item)}
                      vertical
                      onNavigate={() => setOverflowOpen(false)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile collapsible menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-10 bg-black/50 md:hidden"
            aria-hidden
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed left-0 right-0 top-14 z-20 max-h-[calc(100vh-3.5rem)] overflow-y-auto border-b border-[var(--border)] bg-[var(--card-bg)] p-4 md:hidden">
            <div className="space-y-0.5">
              {navItems.map((item) => (
                <div key={item.href + item.label}>
                  <NavLink
                    item={item}
                    pathname={pathname}
                    isActive={isActive(item)}
                    vertical
                    onNavigate={() => setMobileMenuOpen(false)}
                  />
                  {item.children?.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "block rounded-lg py-2 pl-8 pr-3 text-sm font-medium",
                        pathname === c.href
                          ? "bg-gray-100 text-[var(--text-primary)]"
                          : "text-[var(--text-secondary)] hover:bg-gray-50"
                      )}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function NavLink({
  item,
  pathname,
  isActive,
  vertical,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  isActive: boolean;
  vertical?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          vertical ? "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium" : "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium",
          isActive ? "bg-gray-100 text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:bg-gray-50 hover:text-[var(--text-primary)]"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {item.label}
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        vertical ? "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium" : "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium",
        isActive ? "bg-gray-100 text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:bg-gray-50 hover:text-[var(--text-primary)]"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  );
}
