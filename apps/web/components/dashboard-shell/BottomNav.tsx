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

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white lg:hidden">
      <div className="mx-auto grid h-16 max-w-[1100px] grid-cols-6 px-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center rounded-lg text-sm font-medium ${
                active ? "text-blue-700" : "text-slate-600"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

