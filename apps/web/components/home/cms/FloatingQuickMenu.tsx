import type { ReactNode } from "react";
import Link from "next/link";

type QuickItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

function IconBook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v0A2.5 2.5 0 0 1 6.5 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconWhy() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 17h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9.09 9a3 3 0 0 1 5.82 1c0 2-3 2-3 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function IconReviews() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPromo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 12V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 12a8 8 0 0 1-16 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 15v-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function FloatingQuickMenu({ promotionsHref }: { promotionsHref: string }) {
  const items: QuickItem[] = [
    { label: "Kursus", href: "/#classes", icon: <IconBook /> },
    { label: "Kenapa Kami", href: "/#why_choose_us", icon: <IconWhy /> },
    { label: "Ulasan", href: "/#testimonials", icon: <IconReviews /> },
    { label: "Promosi", href: promotionsHref, icon: <IconPromo /> },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 z-40 w-[92vw] max-w-[560px] -translate-x-1/2">
      <div className="rounded-2xl border border-white/15 bg-white/90 px-3 py-2.5 shadow-[0_25px_60px_rgba(2,6,23,0.18)] backdrop-blur">
        <nav className="flex items-center justify-between gap-2">
          {items.map((it) => (
            <Link
              key={it.label}
              href={it.href}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl px-2 py-2 text-[13px] font-semibold text-[#0F172A] transition hover:bg-white hover:shadow-sm"
            >
              <span className="text-[#2563EB]">{it.icon}</span>
              <span className="whitespace-nowrap">{it.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

