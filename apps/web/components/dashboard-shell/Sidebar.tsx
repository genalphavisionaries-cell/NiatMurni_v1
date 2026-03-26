"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/bookings", label: "Bookings" },
  { href: "/dashboard/payments", label: "Payments" },
  { href: "/dashboard/certificates", label: "Certificates" },
  { href: "/dashboard/support", label: "Support" },
  { href: "/dashboard/profile", label: "Profile" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
      <nav className="space-y-1 p-4">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-xl px-3 py-2 text-sm font-medium transition ${
                active ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

