"use client";

import Link from "next/link";
import type { HomepageSettings, NavLink } from "@/lib/homepage-settings";
import type { PublicCmsContactBlock, PublicCmsFooterBlock, PublicCmsSocialBlock } from "@/lib/public-cms";
import { cmsString } from "@/lib/public-cms";

type FooterProps = {
  settings: Pick<
    HomepageSettings,
    "footerColumns" | "footerBottom" | "siteName" | "paymentMethodIcons" | "footerLogoUrl" | "footerDescription" | "footerSslBadgeUrl"
  >;
  /** When set (from CMS footer navigation), replaces the hardcoded Quick Links column content */
  cmsFooterColumns?: { heading: string; links: NavLink[] }[] | null;
  /** Optional footer background from CMS theme */
  footerBackgroundColor?: string | null;
  /** CMS footer text + contact + social + legal/login nav + trust (Steps 5–6) */
  cmsGlobal?: {
    footer: PublicCmsFooterBlock;
    contact: PublicCmsContactBlock;
    social: PublicCmsSocialBlock;
    legalLinks: NavLink[];
    loginLinks: NavLink[];
  } | null;
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

const DEFAULT_PAYMENT_HEADLINE = "Guaranteed Safe & Secured Online Payment";
const DEFAULT_SSL_CAPTION = "Website secured with SSL encryption.";

const PAYMENT_METHODS: { id: string; label: string }[] = [
  { id: "visa", label: "VISA" },
  { id: "mastercard", label: "Mastercard" },
  { id: "amex", label: "AMEX" },
  { id: "jcb", label: "JCB" },
  { id: "discover", label: "Discover" },
  { id: "diners", label: "Diners Club" },
  { id: "unionpay", label: "UnionPay" },
  { id: "qr", label: "QR" },
  { id: "duitnow", label: "DuitNow" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Refund Policy", href: "/refund" },
] as const;

export default function Footer({
  settings,
  cmsFooterColumns = null,
  footerBackgroundColor = null,
  cmsGlobal = null,
}: FooterProps) {
  const { siteName, footerLogoUrl, footerDescription } = settings;
  const footerBg = footerBackgroundColor?.trim() || "#0F172A";
  const year = new Date().getFullYear();

  const intro =
    cmsString(cmsGlobal?.footer.description) ?? footerDescription;
  const cmsIntro = !!cmsString(cmsGlobal?.footer.description);

  const email = cmsString(cmsGlobal?.contact.email);
  const phone = cmsString(cmsGlobal?.contact.phone);
  const address = cmsString(cmsGlobal?.contact.address);
  const hasContact = !!(email || phone || address);

  const socials = cmsGlobal
    ? [
        { label: "Facebook", url: cmsString(cmsGlobal.social.facebook_url) },
        { label: "Instagram", url: cmsString(cmsGlobal.social.instagram_url) },
        { label: "LinkedIn", url: cmsString(cmsGlobal.social.linkedin_url) },
      ].filter((x) => x.url)
    : [];

  const bottomLine =
    cmsString(cmsGlobal?.footer.bottom_text) ??
    (settings.footerBottom?.trim() || `© ${year} ${siteName}. All rights reserved.`);

  const legalLinks: NavLink[] = cmsGlobal?.legalLinks?.length
    ? cmsGlobal.legalLinks
    : LEGAL_LINKS.map((l) => ({ label: l.label, href: l.href, external: false }));
  const loginLinks: NavLink[] = cmsGlobal?.loginLinks?.length
    ? cmsGlobal.loginLinks
    : LOGIN_LINKS.map((l) => ({ label: l.label, href: l.href, external: false }));

  const showPaymentCard =
    cmsGlobal == null || cmsGlobal.footer.show_payment_card !== false;
  const paymentHeadline =
    cmsString(cmsGlobal?.footer.payment_headline) ?? DEFAULT_PAYMENT_HEADLINE;
  const sslBadgeUrl =
    cmsString(cmsGlobal?.footer.ssl_badge_url) ?? settings.footerSslBadgeUrl ?? null;
  const sslCaption =
    cmsString(cmsGlobal?.footer.ssl_caption) ?? DEFAULT_SSL_CAPTION;

  return (
    <footer
      className="text-[#E5E7EB]"
      style={{ background: footerBg }}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        {/* ——— Main: 4 columns ——— */}
        <div
          className={`grid grid-cols-1 gap-8 sm:grid-cols-2 ${showPaymentCard ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
        >
          {/* Column 1: Brand — logo (admin upload) or site name, then CMS-editable description */}
          <div>
            <div className="flex items-center">
              {footerLogoUrl ? (
                <>
                  <img
                    src={footerLogoUrl}
                    alt={siteName}
                    className="h-9 w-auto max-w-[200px] object-contain object-left"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const next = e.currentTarget.nextElementSibling;
                      if (next instanceof HTMLElement) next.style.display = "block";
                    }}
                  />
                  <p className="text-lg font-bold text-white" style={{ display: "none" }}>
                    {siteName}
                  </p>
                </>
              ) : (
                <p className="text-lg font-bold text-white">{siteName}</p>
              )}
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/90">{intro}</p>
            {!cmsIntro ? <p className="mt-2 text-xs text-white/70">Berdaftar di Malaysia</p> : null}
            {hasContact ? (
              <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4 text-sm text-white/85">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Contact</p>
                {email ? (
                  <a href={`mailto:${email}`} className="block hover:text-white">
                    {email}
                  </a>
                ) : null}
                {phone ? (
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="block hover:text-white">
                    {phone}
                  </a>
                ) : null}
                {address ? <p className="whitespace-pre-line text-white/80">{address}</p> : null}
              </div>
            ) : null}
            {socials.length ? (
              <div className="mt-3 flex flex-wrap gap-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-white/80 hover:text-white hover:underline"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {/* Column 2: CMS footer nav or Quick Links */}
          <div className="space-y-8">
            {cmsFooterColumns && cmsFooterColumns.length > 0 ? (
              cmsFooterColumns.map((col) => (
                <div key={col.heading}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                    {col.heading}
                  </h3>
                  <ul className="mt-4 space-y-2">
                    {col.links.map((link) => (
                      <li key={link.href + link.label}>
                        {link.external ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-white/90 transition hover:text-white"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            href={link.href.startsWith("http") ? link.href : link.href}
                            className="text-sm text-white/90 transition hover:text-white"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
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
            )}
          </div>

          {/* Column 3: Login buttons (CMS footer_login or defaults) */}
          <div>
            <div className="flex flex-col gap-2">
              {loginLinks.map((link) =>
                link.external ? (
                  <a
                    key={link.href + link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center rounded border border-white/30 bg-transparent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    className="flex items-center justify-center rounded border border-white/30 bg-transparent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Column 4: Payment & Security card */}
          {showPaymentCard ? (
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="rounded-xl bg-white p-4 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <PadlockIcon className="h-5 w-5 text-[#0F172A]" />
                    <span className="text-sm font-medium text-[#0F172A]">{paymentHeadline}</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded bg-[#32325D] px-2.5 py-1.5">
                    <span className="text-[10px] font-medium text-white">Powered by</span>
                    <span className="text-sm font-semibold text-white" style={{ fontFamily: "inherit" }}>
                      Stripe
                    </span>
                  </div>
                </div>
                <div className="my-3 h-px bg-[#E5E7EB]" />
                <div className="flex flex-wrap items-center gap-2">
                  {PAYMENT_METHODS.map(({ id, label }) => {
                    const iconUrl = settings.paymentMethodIcons?.[id] ?? `/images/payment/${id}.svg`;
                    return (
                      <span
                        key={id}
                        className="inline-flex h-7 w-10 items-center justify-center overflow-hidden rounded bg-[#F3F4F6] px-1 py-0.5"
                        title={label}
                      >
                        <img
                          src={iconUrl}
                          alt={label}
                          className="h-5 w-auto max-w-full object-contain"
                          onError={(e) => {
                            const el = e.currentTarget;
                            el.style.display = "none";
                            const fallback = el.nextElementSibling as HTMLElement | null;
                            if (fallback) fallback.style.display = "inline";
                          }}
                        />
                        <span
                          className="text-[10px] font-medium text-[#374151]"
                          style={{ display: "none" }}
                        >
                          {label}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* ——— Bottom strip: legal + copyright | SSL badge (space on right reserved for WhatsApp) ——— */}
        <div className="mt-10 border-t border-[#334155] pt-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:justify-start">
                {legalLinks.map((link) =>
                  link.external ? (
                    <a
                      key={link.href + link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/90 transition hover:text-white"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href + link.label}
                      href={link.href}
                      className="text-sm text-white/90 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
              <p className="mt-2 whitespace-pre-line text-xs text-white/70">{bottomLine}</p>
            </div>
            <div className="flex flex-col items-center sm:mr-14 sm:items-end">
              {sslBadgeUrl ? (
                <div className="relative">
                  <img
                    src={sslBadgeUrl}
                    alt="SSL / security badge"
                    className="h-12 w-auto max-w-[180px] object-contain object-right"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const next = e.currentTarget.nextElementSibling;
                      if (next instanceof HTMLElement) next.style.display = "flex";
                    }}
                  />
                  <div
                    className="flex items-center gap-2 rounded border-2 border-[#EAB308] bg-white px-3 py-2"
                    style={{ display: "none" }}
                  >
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
                </div>
              ) : (
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
              )}
              <p className="mt-1.5 max-w-[220px] text-center text-[11px] text-white/60 sm:text-right">
                {sslCaption}
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
