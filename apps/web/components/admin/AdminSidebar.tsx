"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, BookOpen, CreditCard, HelpCircle, Users, X } from "lucide-react";

type AdminSidebarProps = {
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

const navItems = [
  { href: "/admin/participants", label: "Participants", icon: Users },
  { href: "/admin/support", label: "Support", icon: HelpCircle },
  { href: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/certificates", label: "Certificates", icon: Award },
];

export function AdminSidebar({ mobileOpen, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
        <SidebarContent pathname={pathname} onNavigate={onCloseMobile} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close sidebar overlay"
            onClick={onCloseMobile}
          />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <p className="font-semibold text-slate-900">Admin Menu</p>
              <button type="button" onClick={onCloseMobile} className="rounded-lg p-1 text-slate-600 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent pathname={pathname} onNavigate={onCloseMobile} />
          </aside>
        </div>
      ) : null}
    </>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <nav className="space-y-1 p-3">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

