"use client";

import Link from "next/link";
import type { PublicCmsFloatingMenu } from "@/lib/public-cms";

function IconHome() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBook() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
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

function IconMail() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16v12H4V6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 13a5 5 0 0 1 7.07 0l1.41 1.41a5 5 0 0 1-7.07 7.07l-1.06-1.06"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 11a5 5 0 0 1-7.07 0L5.52 9.59a5 5 0 0 1 7.07-7.07l1.06 1.06"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function iconFor(hint?: string) {
  const k = (hint ?? "").toLowerCase();
  if (k.includes("home")) return <IconHome />;
  if (k.includes("book") || k.includes("class") || k.includes("kursus")) return <IconBook />;
  if (k.includes("mail") || k.includes("email") || k.includes("contact")) return <IconMail />;
  if (k.includes("whatsapp") || k === "wa") return <IconWhatsApp />;
  return <IconLink />;
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href) || href.startsWith("//") || href.startsWith("mailto:") || href.startsWith("tel:");
}

type Props = {
  config: PublicCmsFloatingMenu;
};

export default function FloatingBottomNav({ config }: Props) {
  if (!config.enabled || config.items.length !== 4) return null;

  const openWhatsAppFromMenu = () => {
    window.dispatchEvent(new Event("open-whatsapp-chat"));
  };

  return (
    <nav
      className="pointer-events-none fixed bottom-0 left-1/2 z-40 w-full max-w-[420px] -translate-x-1/2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1"
      aria-label="Quick navigation"
    >
      <div className="pointer-events-auto flex rounded-full border border-slate-200/80 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.12)] backdrop-blur-md">
        {config.items.map((item, index) => {
          const isWaSlot = index === 3;
          if (isWaSlot) {
            return (
              <button
                key={`nav-wa-${item.label}`}
                type="button"
                onClick={openWhatsAppFromMenu}
                className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-2.5 text-[11px] font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
                aria-label={item.label ? `Open WhatsApp: ${item.label}` : "Open WhatsApp chat"}
              >
                <span className="text-[#25D366]">{iconFor(item.icon ?? "whatsapp")}</span>
                <span className="max-w-full truncate px-0.5">{item.label || "WhatsApp"}</span>
              </button>
            );
          }

          const href = item.url?.trim() || "/";
          const label = item.label || "Link";
          const external = isExternalHref(href);

          if (external) {
            return (
              <a
                key={`nav-${index}-${href}`}
                href={href}
                className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-2.5 text-[11px] font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                aria-label={label}
              >
                <span className="text-sky-600">{iconFor(item.icon)}</span>
                <span className="max-w-full truncate px-0.5">{label}</span>
              </a>
            );
          }

          return (
            <Link
              key={`nav-${index}-${href}`}
              href={href}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-2.5 text-[11px] font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
              aria-label={label}
            >
              <span className="text-sky-600">{iconFor(item.icon)}</span>
              <span className="max-w-full truncate px-0.5">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
