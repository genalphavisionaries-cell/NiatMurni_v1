"use client";

import Link from "next/link";
import type { HomepageSettings } from "@/lib/homepage-settings";

type FooterProps = {
  settings: Pick<HomepageSettings, "footerColumns" | "footerBottom" | "siteName">;
};

const FOOTER_NAV = {
  kursus: [
    { label: "Kursus Pengendalian Makanan", href: "/#programs" },
    { label: "Jadual Kelas", href: "/#classes" },
    { label: "Daftar Kursus", href: "/#classes" },
  ],
  maklumat: [
    { label: "Tentang Kami", href: "/#about" },
    { label: "Cara Kursus Berjalan", href: "/#faq" },
    { label: "Soalan Lazim", href: "/#faq" },
    { label: "Hubungi Kami", href: "/#contact" },
  ],
  sokongan: [
    { label: "WhatsApp Support", href: "https://wa.me/60123456789", external: true },
    { label: "Email Support", href: "mailto:support@niatmurniacademy.com" },
    { label: "Login Peserta", href: "/login" },
  ],
} as const;

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
      style={{ background: "#0F172A", paddingTop: 60, paddingBottom: 40 }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ——— Trust Section ——— */}
        <section className="border-b border-[#334155] pb-10">
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            Pembayaran Selamat & Terjamin
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#E5E7EB]/90">
            Semua pembayaran diproses dengan selamat menggunakan Stripe dan dilindungi dengan
            standard keselamatan antarabangsa.
          </p>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-start lg:gap-8">
            {/* Stripe security badge */}
            <div
              className="flex flex-shrink-0 items-center gap-4 rounded-xl bg-[#F9FAFB] px-4 py-4 text-[#374151]"
              style={{ borderRadius: 12, padding: 16 }}
            >
              <div className="flex h-10 w-24 items-center justify-center rounded bg-white/80 px-2">
                {/* Placeholder for Stripe logo — admin can replace via img src or next/image */}
                <span className="text-xs font-semibold text-[#635BFF]">Stripe</span>
              </div>
              <div>
                <p className="font-semibold text-[#111827]">Secured by Stripe</p>
                <p className="mt-0.5 max-w-[220px] text-xs text-[#6B7280]">
                  Pembayaran diproses melalui Stripe dengan perlindungan PCI-DSS dan enkripsi SSL.
                </p>
              </div>
            </div>

            {/* Accepted payment methods */}
            <div className="flex-1 min-w-0">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                Accepted Payment Methods
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {PAYMENT_METHODS.map(({ name, id }) => (
                  <div
                    key={id}
                    className="flex h-9 min-w-[72px] items-center justify-center rounded-lg bg-[#1E293B] px-3 text-[11px] font-medium text-[#94A3B8] grayscale"
                    title={name}
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Certification / Compliance */}
          <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-[#334155] pt-8">
            <p className="text-sm font-medium text-white">
              Diiktiraf oleh Kementerian Kesihatan Malaysia
            </p>
            <p className="text-sm text-[#E5E7EB]/90">
              Sijil sah untuk semua pengendali makanan di Malaysia
            </p>
            <div className="flex items-center gap-4">
              {/* KKM logo placeholder — admin upload */}
              <div
                className="flex h-12 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-[#1E293B] text-[10px] text-[#64748B]"
                aria-hidden
              >
                KKM Logo
              </div>
              <div
                className="flex h-12 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-[#1E293B] text-[10px] text-[#64748B]"
                aria-hidden
              >
                Provider
              </div>
            </div>
          </div>
        </section>

        {/* ——— Footer Content: Credibility + Nav + Contact ——— */}
        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Business credibility */}
          <div className="lg:col-span-4">
            <p className="text-lg font-semibold text-white">{siteName}</p>
            <p className="mt-2 text-sm leading-relaxed text-[#E5E7EB]/90">
              Penyedia latihan kursus pengendalian makanan untuk pengusaha makanan di seluruh
              Malaysia.
            </p>
            <p className="mt-2 text-xs text-[#94A3B8]">Berdaftar di Malaysia</p>
          </div>

          {/* Nav columns */}
          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-5">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Kursus
              </h3>
              <ul className="mt-4 space-y-2">
                {FOOTER_NAV.kursus.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#E5E7EB] transition hover:text-[#2563EB]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Maklumat
              </h3>
              <ul className="mt-4 space-y-2">
                {FOOTER_NAV.maklumat.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#E5E7EB] transition hover:text-[#2563EB]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Sokongan
              </h3>
              <ul className="mt-4 space-y-2">
                {FOOTER_NAV.sokongan.map((link) => (
                  <li key={link.href + link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#E5E7EB] transition hover:text-[#2563EB]"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-[#E5E7EB] transition hover:text-[#2563EB]"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Hubungi Kami
            </h3>
            <div className="mt-4 space-y-2 text-sm">
              <a
                href={CONTACT.whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 font-medium text-white transition opacity-90 hover:opacity-100"
              >
                <WhatsAppIcon className="h-5 w-5" />
                WhatsApp: {CONTACT.whatsApp}
              </a>
              <p className="text-[#E5E7EB]/90">
                Email:{" "}
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="text-[#E5E7EB] transition hover:text-[#2563EB]"
                >
                  {CONTACT.email}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* ——— Legal & Policy ——— */}
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#334155] pt-8">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[#E5E7EB] transition hover:text-[#2563EB]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ——— Bottom Bar ——— */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[#334155] pt-8 text-center sm:flex-row">
          <p className="text-sm text-[#94A3B8]">
            © 2026 {siteName}
            <br className="sm:hidden" />
            <span className="sm:ml-1">All Rights Reserved.</span>
          </p>
          <p className="text-xs text-[#64748B]">
            Website secured with SSL encryption.
          </p>
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
