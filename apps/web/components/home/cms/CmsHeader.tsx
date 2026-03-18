"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import type { NavLink } from "@/lib/homepage-settings";
import type { PublicCmsNavItem } from "@/lib/public-cms";
import { cmsString } from "@/lib/public-cms";
import { safeHref } from "./utils";

type CmsHeaderProps = {
  siteName: string;
  logoUrl: string | null;
  navTree: PublicCmsNavItem[] | null;
  fallbackNav: NavLink[];
  primaryCta: { label: string; url: string };
};

function LinkEl({
  href,
  label,
  external,
  className,
  onNavigate,
}: {
  href: string;
  label: string;
  external?: boolean;
  className?: string;
  onNavigate?: () => void;
}) {
  if (external || href.startsWith("http")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onNavigate}
      >
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onNavigate}>
      {label}
    </Link>
  );
}

function renderTree(nodes: PublicCmsNavItem[], linkClass: string, onNavigate?: () => void): ReactNode[] {
  return nodes.map((n) => {
    const href = safeHref(n.url);
    const hasKids = (n.children?.length ?? 0) > 0;
    if (hasKids) {
      return (
        <div key={n.id} className="relative">
          <details className="group/details">
            <summary
              className={`${linkClass} cursor-pointer list-none whitespace-nowrap [&::-webkit-details-marker]:hidden`}
            >
              {n.label}
              <span className="ml-1 text-[10px] opacity-70">▾</span>
            </summary>
            <ul className="absolute left-0 top-full z-50 mt-2 min-w-[200px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              {n.children.map((c) => {
                const ch = safeHref(c.url);
                if (!ch) return null;
                return (
                  <li key={c.id}>
                    <LinkEl
                      href={ch}
                      label={c.label}
                      external={c.open_in_new_tab}
                      className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                      onNavigate={onNavigate}
                    />
                  </li>
                );
              })}
            </ul>
          </details>
        </div>
      );
    }
    if (!href) return null;
    const cls = n.is_button
      ? `${linkClass} rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm hover:bg-slate-50`
      : linkClass;
    return (
      <LinkEl
        key={n.id}
        href={href}
        label={n.label}
        external={n.open_in_new_tab}
        className={cls}
        onNavigate={onNavigate}
      />
    );
  });
}

export default function CmsHeader({
  siteName,
  logoUrl,
  navTree,
  fallbackNav,
  primaryCta,
}: CmsHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const useTree = useMemo(() => {
    return !!(navTree?.length && navTree.some((n) => cmsString(n.label)));
  }, [navTree]);

  const headerBg = "var(--cms-header-bg, rgba(255,255,255,0.92))";
  const ctaBg = "var(--cms-primary, #eab308)";

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-slate-200/70 backdrop-blur supports-[backdrop-filter]:bg-white/70"
      style={{ background: headerBg }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={siteName}
              className="h-9 w-auto max-w-[180px] object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span className="text-base font-semibold tracking-tight text-slate-900">{siteName}</span>
          )}
        </Link>

        <nav className="ml-auto hidden items-center gap-5 lg:flex" aria-label="Main">
          {useTree && navTree
            ? renderTree(
                navTree,
                "text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors",
              ).filter(Boolean)
            : fallbackNav.map((i) => {
                const h = i.href.startsWith("#") ? `/${i.href}` : i.href;
                return (
                  <LinkEl
                    key={i.label + i.href}
                    href={h}
                    label={i.label}
                    external={i.external}
                    className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                  />
                );
              })}

          <LinkEl
            href={primaryCta.url.startsWith("#") ? `/${primaryCta.url}` : primaryCta.url}
            label={primaryCta.label}
            external={primaryCta.url.startsWith("http")}
            className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm"
            onNavigate={() => setMobileOpen(false)}
          />
          <style jsx>{`
            a.rounded-full {
              background: ${ctaBg};
            }
            a.rounded-full:hover {
              filter: brightness(0.95);
            }
          `}</style>
        </nav>

        <button
          type="button"
          className="ml-auto inline-flex rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-3" aria-label="Mobile main">
            {useTree && navTree
              ? navTree.flatMap((n) => {
                  const rows: ReactNode[] = [];
                  if (n.children?.length) {
                    rows.push(
                      <p
                        key={`g-${n.id}`}
                        className="pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {n.label}
                      </p>,
                    );
                    n.children.forEach((c) => {
                      const h = safeHref(c.url);
                      if (!h) return;
                      rows.push(
                        <LinkEl
                          key={`c-${c.id}`}
                          href={h}
                          label={c.label}
                          external={c.open_in_new_tab}
                          className="text-sm font-medium text-slate-700"
                          onNavigate={() => setMobileOpen(false)}
                        />,
                      );
                    });
                  } else {
                    const h = safeHref(n.url);
                    if (h) {
                      rows.push(
                        <LinkEl
                          key={`n-${n.id}`}
                          href={h}
                          label={n.label}
                          external={n.open_in_new_tab}
                          className="text-sm font-medium text-slate-700"
                          onNavigate={() => setMobileOpen(false)}
                        />,
                      );
                    }
                  }
                  return rows;
                })
              : fallbackNav.map((i) => {
                  const h = i.href.startsWith("#") ? `/${i.href}` : i.href;
                  return (
                    <LinkEl
                      key={i.label + i.href}
                      href={h}
                      label={i.label}
                      external={i.external}
                      className="text-sm font-medium text-slate-700"
                      onNavigate={() => setMobileOpen(false)}
                    />
                  );
                })}
            <LinkEl
              href={primaryCta.url.startsWith("#") ? `/${primaryCta.url}` : primaryCta.url}
              label={primaryCta.label}
              external={primaryCta.url.startsWith("http")}
              className="mt-2 rounded-full px-4 py-2 text-center text-sm font-semibold text-white"
              onNavigate={() => setMobileOpen(false)}
            />
            <style jsx>{`
              a.mt-2.rounded-full {
                background: ${ctaBg};
              }
              a.mt-2.rounded-full:hover {
                filter: brightness(0.95);
              }
            `}</style>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

