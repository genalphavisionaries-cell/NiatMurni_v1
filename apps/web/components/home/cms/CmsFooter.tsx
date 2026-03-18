import Link from "next/link";
import type { HomepageSettings, NavLink } from "@/lib/homepage-settings";
import type { PublicCmsContactBlock, PublicCmsFooterBlock, PublicCmsSocialBlock } from "@/lib/public-cms";
import { cmsString } from "@/lib/public-cms";

type CmsFooterProps = {
  siteName: string;
  logoUrl: string | null;
  footerNavColumns: { heading: string; links: NavLink[] }[] | null;
  footerBackgroundColor?: string | null;
  cmsFooter: PublicCmsFooterBlock;
  cmsContact: PublicCmsContactBlock;
  cmsSocial: PublicCmsSocialBlock;
  /** CMS footer_legal or empty → defaults */
  legalLinks: NavLink[];
  /** CMS footer_login or empty → defaults */
  loginLinks: NavLink[];
  /** Legacy payment icon URLs (CMS has no per-method URLs yet) */
  paymentMethodIcons?: HomepageSettings["paymentMethodIcons"];
  /** When CMS ssl_badge_url empty */
  legacyFooterSslBadgeUrl?: string | null;
  /** Only used when CMS footer description is empty */
  legacyFooterDescription?: string | null;
  /** Only used when CMS footer bottom_text is empty */
  legacyFooterBottom?: string | null;
};

const DEFAULT_LEGAL = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Refund Policy", href: "/refund" },
] as const;

const DEFAULT_LOGIN = [
  { label: "Log Masuk Peserta", href: "/login" },
  { label: "Log Masuk Korporat", href: "/login/corporate" },
  { label: "Log Masuk Tutor", href: "/login/tutor" },
] as const;

const DEFAULT_QUICK_LINKS = [
  { label: "Kursus", href: "/#classes" },
  { label: "Kenapa Kami", href: "/#why_choose_us" },
  { label: "Ulasan", href: "/#testimonials" },
  { label: "Promosi", href: "/#promotions" },
] as const;

const DEFAULT_INTRO =
  "Penyedia latihan kursus pengendalian makanan untuk pengusaha makanan di seluruh Malaysia.";

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

export default function CmsFooter({
  siteName,
  logoUrl,
  footerNavColumns,
  footerBackgroundColor,
  cmsFooter,
  cmsContact,
  cmsSocial,
  legalLinks: legalFromCms,
  loginLinks: loginFromCms,
  paymentMethodIcons,
  legacyFooterSslBadgeUrl,
  legacyFooterDescription,
  legacyFooterBottom,
}: CmsFooterProps) {
  const year = new Date().getFullYear();
  const bg = footerBackgroundColor?.trim() || "var(--cms-footer-bg, #0f172a)";

  // Contact + social are still available for legacy/custom layouts; homepage footer UI
  // intentionally focuses on conversion and legal/payment blocks for now.
  void cmsContact;
  void cmsSocial;

  const desc =
    cmsString(cmsFooter.description) ??
    cmsString(legacyFooterDescription) ??
    DEFAULT_INTRO;

  const bottomLine =
    cmsString(cmsFooter.bottom_text) ??
    cmsString(legacyFooterBottom) ??
    `© ${year} ${siteName}. All rights reserved.`;

  const legal: NavLink[] = legalFromCms.length
    ? legalFromCms
    : DEFAULT_LEGAL.map((l) => ({ label: l.label, href: l.href, external: false }));
  const logins: NavLink[] = loginFromCms.length
    ? loginFromCms
    : DEFAULT_LOGIN.map((l) => ({ label: l.label, href: l.href, external: false }));
  const showPayment = cmsFooter.show_payment_card !== false;
  const paymentHeadline = cmsString(cmsFooter.payment_headline) ?? DEFAULT_PAYMENT_HEADLINE;
  const sslBadgeUrl =
    cmsString(cmsFooter.ssl_badge_url) ?? cmsString(legacyFooterSslBadgeUrl) ?? null;
  const sslCaption = cmsString(cmsFooter.ssl_caption) ?? DEFAULT_SSL_CAPTION;

  return (
    <footer className="text-white/90" style={{ background: bg }}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <>
                  <img
                    src={logoUrl}
                    alt={siteName}
                    className="h-10 w-auto max-w-[220px] object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <p className="text-lg font-semibold text-white">{siteName}</p>
                </>
              ) : (
                <p className="text-lg font-semibold text-white">{siteName}</p>
              )}
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/75">{desc}</p>
            <p className="mt-2 text-xs text-white/60">Berdaftar di Malaysia</p>
          </div>

          <div className="lg:col-span-8">
            {footerNavColumns?.length ? (
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                {footerNavColumns.map((col) => (
                  <div key={col.heading}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                      {col.heading}
                    </h3>
                    <ul className="mt-4 space-y-2">
                      {col.links.map((l) => (
                        <li key={l.href + l.label}>
                          {l.external ? (
                            <a
                              href={l.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-white/80 hover:text-white"
                            >
                              {l.label}
                            </a>
                          ) : (
                            <Link
                              href={l.href}
                              className="text-sm text-white/80 hover:text-white"
                            >
                              {l.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                    Quick Links
                  </h3>
                  <ul className="mt-4 space-y-2">
                    {DEFAULT_QUICK_LINKS.map((l) => (
                      <li key={l.href + l.label}>
                        <Link href={l.href} className="text-sm text-white/80 hover:text-white">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div
              className={`mt-10 grid gap-6 ${showPayment ? "lg:grid-cols-2" : ""}`}
            >
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/80">
                  Log masuk
                </h3>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:flex-col">
                  {logins.map((link) =>
                    link.external ? (
                      <a
                        key={link.href + link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded border border-white/30 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        key={link.href + link.label}
                        href={link.href}
                        className="inline-flex items-center justify-center rounded border border-white/30 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                      >
                        {link.label}
                      </Link>
                    )
                  )}
                </div>
              </div>
              {showPayment ? (
                <div className="rounded-xl bg-white p-4 text-[#0F172A] shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <PadlockIcon className="h-5 w-5 shrink-0" />
                      <span className="text-sm font-medium">{paymentHeadline}</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded bg-[#32325D] px-2.5 py-1.5">
                      <span className="text-[10px] font-medium text-white">Powered by</span>
                      <span className="text-sm font-semibold text-white">Stripe</span>
                    </div>
                  </div>
                  <div className="my-3 h-px bg-[#E5E7EB]" />
                  <div className="flex flex-wrap items-center gap-2">
                    {PAYMENT_METHODS.map(({ id, label }) => {
                      const iconUrl =
                        paymentMethodIcons?.[id] ?? `/images/payment/${id}.svg`;
                      return (
                        <span
                          key={id}
                          className="inline-flex h-7 w-10 items-center justify-center overflow-hidden rounded bg-[#F3F4F6] px-1 py-0.5"
                          title={label}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={iconUrl}
                            alt={label}
                            className="h-5 w-auto max-w-full object-contain"
                          />
                        </span>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:justify-start">
                {legal.map((l) =>
                  l.external ? (
                    <a
                      key={l.href + l.label}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/80 hover:text-white"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      key={l.href + l.label}
                      href={l.href}
                      className="text-sm text-white/80 hover:text-white"
                    >
                      {l.label}
                    </Link>
                  )
                )}
              </div>
              <p className="mt-2 max-w-xl whitespace-pre-line text-center text-xs text-white/60 sm:text-left">
                {bottomLine}
              </p>
            </div>
            <div className="flex flex-col items-center sm:items-end">
              {sslBadgeUrl ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
                    className="flex items-center gap-2 rounded border-2 border-[#EAB308] bg-white px-3 py-2 text-[#0F172A]"
                    style={{ display: "none" }}
                  >
                    <PadlockIcon className="h-5 w-5 shrink-0" />
                    <div className="text-center">
                      <p className="text-[10px] font-semibold uppercase leading-tight">
                        Secured by
                      </p>
                      <p className="text-xs font-bold">
                        positive<span className="text-[#16A34A]">SSL</span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded border-2 border-[#EAB308] bg-white px-3 py-2 text-[#0F172A]">
                  <PadlockIcon className="h-5 w-5 shrink-0" />
                  <div className="text-center">
                    <p className="text-[10px] font-semibold uppercase leading-tight">Secured by</p>
                    <p className="text-xs font-bold">
                      positive<span className="text-[#16A34A]">SSL</span>
                    </p>
                  </div>
                </div>
              )}
              <p className="mt-1.5 max-w-[220px] text-center text-[11px] text-white/50 sm:text-right">
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
