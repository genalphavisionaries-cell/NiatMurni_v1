"use client";

import Link from "next/link";
import type { HomepageSettings } from "@/lib/homepage-settings";

type FooterProps = {
  settings: Pick<HomepageSettings, "footerColumns" | "footerBottom" | "siteName">;
};

const QUICK_LINKS = [
  { label: "Kursus", href: "/#programs" },
  { label: "Jadual Kelas", href: "/#classes" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/#contact" },
] as const;

const LOGIN_LINKS = [
  { label: "Log Masuk Peserta", href: "/login" },
  { label: "Log Masuk Korporat", href: "/login/corporate" },
  { label: "Log Masuk Tutor", href: "/login/tutor" },
] as const;

const PAYMENT_METHODS = [
  "VISA",
  "Mastercard",
  "AMEX",
  "JCB",
  "Discover",
  "Diners Club",
  "UnionPay",
] as const;

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Refund Policy", href: "/refund" },
] as const;

export default function Footer({ settings }: FooterProps) {
  const { siteName } = settings;

  return (
    <footer
      className="text-[#E5E7EB]"
      style={{ background: "#0F172A" }}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        {/* ——— Main: 4 columns ——— */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand */}
          <div>
            <p className="text-lg font-bold text-white">{siteName}</p>
            <p className="mt-3 text-sm leading-relaxed text-white/90">
              Penyedia latihan kursus pengendalian makanan untuk pengusaha makanan di seluruh Malaysia.
            </p>
            <p className="mt-2 text-xs text-white/70">Berdaftar di Malaysia</p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/90 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Login buttons */}
          <div>
            <div className="flex flex-col gap-2">
              {LOGIN_LINKS.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="flex items-center justify-center rounded border border-white/30 bg-transparent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 4: Payment & Security card (white card) */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="rounded-xl bg-white p-4 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <PadlockIcon className="h-5 w-5 text-[#0F172A]" />
                  <span className="text-sm font-medium text-[#0F172A]">
                    Guaranteed safe & secure checkout
                  </span>
                </div>
                <div className="flex items-center gap-1.5 rounded bg-[#32325D] px-2.5 py-1.5">
                  <span className="text-[10px] font-medium text-white">Powered by</span>
                  <span className="text-xs font-semibold text-white">stripe</span>
                </div>
              </div>
              <div className="my-3 h-px bg-[#E5E7EB]" />
              <div className="flex flex-wrap items-center gap-2">
                {PAYMENT_METHODS.map((name) => (
                  <span
                    key={name}
                    className="rounded bg-[#F3F4F6] px-2 py-1 text-[10px] font-medium text-[#374151]"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ——— Bottom strip: legal + copyright | SSL badge ——— */}
        <div className="mt-10 border-t border-[#334155] pt-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:justify-start">
                {LEGAL_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-white/90 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <p className="mt-2 text-xs text-white/70">
                © 2026 {siteName}. All Rights Reserved
              </p>
            </div>
            <div className="flex flex-col items-center sm:items-end">
              <div className="flex items-center gap-2 rounded border-2 border-[#EAB308] bg-white px-3 py-2">
                <PadlockIcon className="h-5 w-5 shrink-0 text-[#0F172A]" />
                <div className="text-center">
                  <p className="text-[10px] font-semibold uppercase leading-tight text-[#0F172A]">
                    Secured by
                  </p>
                  <p className="text-xs font-bold text-[#0F172A]">
                    positive<span className="text-[#16A34A]">SSL</span>
                  </p>
                </div>
              </div>
              <p className="mt-1.5 text-[11px] text-white/60">
                Website secured with SSL encryption.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function PadlockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}
