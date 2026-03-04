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

const SUPPORT_LINKS = [
  { label: "WhatsApp", href: "https://wa.me/60123456789", external: true },
  { label: "Email", href: "mailto:support@niatmurniacademy.com" },
] as const;

const PAYMENT_METHODS = [
  { name: "Visa", id: "visa" },
  { name: "Mastercard", id: "mastercard" },
  { name: "FPX", id: "fpx" },
  { name: "Apple Pay", id: "applepay" },
  { name: "Google Pay", id: "googlepay" },
] as const;

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Refund Policy", href: "/refund" },
] as const;

const CONTACT = {
  whatsApp: "+60 12-345 6789",
  whatsAppHref: "https://wa.me/60123456789",
  email: "support@niatmurniacademy.com",
};

export default function Footer({ settings }: FooterProps) {
  const { siteName } = settings;

  return (
    <footer
      className="text-[#E5E7EB]"
      style={{ background: "#0F172A", paddingTop: 40, paddingBottom: 40 }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ——— Trust: one row ——— */}
        <section className="flex flex-wrap items-center justify-between gap-4 border-b border-[#334155] pb-6">
          <div className="flex flex-shrink-0 items-center gap-3 rounded-xl bg-[#F9FAFB] px-3 py-2.5 text-[#374151]" style={{ borderRadius: 12 }}>
            <span className="text-xs font-semibold text-[#635BFF]">Stripe</span>
            <div>
              <p className="text-xs font-semibold text-[#111827]">Secured by Stripe</p>
              <p className="text-[10px] text-[#6B7280]">PCI-DSS & SSL</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {PAYMENT_METHODS.map(({ name, id }) => (
              <span
                key={id}
                className="rounded bg-[#1E293B] px-2 py-1 text-[10px] font-medium text-[#94A3B8] grayscale"
              >
                {name}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[#E5E7EB]/90">
            <span className="font-medium text-white">Diiktiraf KKM</span>
            <span>·</span>
            <span>Sijil sah Malaysia</span>
          </div>
        </section>

        {/* ——— 3 columns ——— */}
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 30 }}>
          <div>
            <p className="text-base font-semibold text-white">{siteName}</p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-[#E5E7EB]/90">
              Penyedia latihan kursus pengendalian makanan untuk pengusaha makanan di seluruh Malaysia.
            </p>
            <p className="mt-1 text-[12px] text-[#94A3B8]">Berdaftar di Malaysia</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Quick Links</h3>
            <ul className="mt-3 space-y-1.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-[#E5E7EB] transition hover:text-[#2563EB]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Support</h3>
            <ul className="mt-3 space-y-1.5">
              <li>
                <a
                  href="https://wa.me/60123456789"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded bg-[#25D366] px-2.5 py-1.5 text-[13px] font-medium text-white hover:opacity-90"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="text-[14px] text-[#E5E7EB] transition hover:text-[#2563EB]"
                >
                  Email
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ——— Legal ——— */}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[#334155] pt-6">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[14px] text-[#E5E7EB] transition hover:text-[#2563EB]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ——— Bottom ——— */}
        <div className="mt-4 flex flex-col items-center justify-between gap-2 text-center sm:flex-row">
          <p className="text-[13px] text-[#94A3B8]">
            © 2026 {siteName} · All Rights Reserved
          </p>
          <p className="text-[11px] text-[#64748B]">Website secured with SSL encryption.</p>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
