"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import Link from "next/link";
import LogoBox from "./LogoBox";
import type { NavLink } from "@/lib/homepage-settings";
import type { PublicCmsNavItem } from "@/lib/public-cms";

type HeroHeaderProps = {
  siteName?: string;
  logoUrl?: string | null;
  /** CMS structured nav (preferred when non-empty) */
  navTree?: PublicCmsNavItem[] | null;
  /** Legacy flat nav from homepage-settings */
  fallbackNav?: NavLink[];
  primaryCta?: { label: string; url: string };
};

const LANG_OPTIONS = [
  { id: "bm", label: "BM", flag: "🇲🇾" },
  { id: "en", label: "EN", flag: "🇬🇧" },
  { id: "zh", label: "中文", flag: "🇨🇳" },
];

function navHref(url: string | null): string | null {
  if (!url?.trim()) return null;
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/") || u.startsWith("#")) return u;
  return `/${u}`;
}

function NavLinkEl({
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

function renderNavNodes(
  nodes: PublicCmsNavItem[],
  className: string,
  onNavigate?: () => void
): ReactNode[] {
  return nodes.map((node) => {
    const href = navHref(node.url);
    const hasKids = node.children?.length > 0;
    if (hasKids) {
      return (
        <div key={node.id} className="relative group">
          <details className="group/details">
            <summary
              className={`${className} cursor-pointer list-none whitespace-nowrap [&::-webkit-details-marker]:hidden`}
            >
              {node.label}
              <span className="ml-0.5 text-[10px] opacity-70">▾</span>
            </summary>
            <ul className="absolute left-0 top-full z-30 mt-1 min-w-[160px] rounded-lg border border-white/20 bg-[#0f172a]/95 py-1 shadow-lg backdrop-blur">
              {node.children!.map((c) => {
                const ch = navHref(c.url);
                if (!ch) return null;
                return (
                  <li key={c.id}>
                    <NavLinkEl
                      href={ch}
                      label={c.label}
                      external={c.open_in_new_tab}
                      className="block px-3 py-2 text-[13px] text-white/90 hover:bg-white/10"
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
    return (
      <NavLinkEl
        key={node.id}
        href={href}
        label={node.label}
        external={node.open_in_new_tab}
        className={node.is_button ? `${className} rounded-full bg-amber-500 px-3 py-1.5 font-semibold text-white hover:bg-amber-600` : className}
        onNavigate={onNavigate}
      />
    );
  });
}

export default function HeroHeader({
  siteName = "Niat Murni Academy",
  logoUrl = null,
  navTree = null,
  fallbackNav = [],
  primaryCta = { label: "Register", url: "/#classes" },
}: HeroHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState(LANG_OPTIONS[0]);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const linkClass =
    "text-[13px] font-medium text-white/90 transition-colors hover:text-white whitespace-nowrap";
  const useTree = navTree && navTree.length > 0;

  return (
    <header
      className="site-header absolute left-0 top-0 z-[20] flex w-full items-center justify-end gap-2 md:gap-4"
      style={{
        height: 72,
        padding: "0 40px",
      }}
    >
      <LogoBox logoUrl={logoUrl} alt={siteName} />
      <nav
        className="ml-auto hidden items-center gap-4 lg:flex"
        aria-label="Main"
      >
        {useTree
          ? renderNavNodes(navTree, linkClass).filter(Boolean)
          : fallbackNav.map((item) => {
              const h = item.href.startsWith("#") ? `/${item.href}` : item.href;
              return (
                <NavLinkEl
                  key={item.label + item.href}
                  href={h}
                  label={item.label}
                  external={item.external}
                  className={linkClass}
                />
              );
            })}
        <NavLinkEl
          href={primaryCta.url.startsWith("#") ? `/${primaryCta.url}` : primaryCta.url}
          label={primaryCta.label}
          external={primaryCta.url.startsWith("http")}
          className="rounded-full bg-amber-500 px-4 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-amber-600"
        />
      </nav>
      <div className="relative ml-1" ref={langRef}>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={langOpen}
          onClick={() => setLangOpen((o) => !o)}
          className="flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-2.5 py-1.5 text-[13px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus:outline focus:outline-2 focus:outline-white focus:outline-offset-2"
        >
          <span>{lang.flag}</span>
          <span>{lang.label}</span>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {langOpen && (
          <ul
            role="listbox"
            className="absolute right-0 top-full z-20 mt-1.5 min-w-[100px] rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-lg"
          >
            {LANG_OPTIONS.map((opt) => (
              <li key={opt.id} role="option" aria-selected={lang.id === opt.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-[#0F172A] hover:bg-[#F3F4F6] focus:bg-[#F3F4F6] focus:outline"
                  onClick={() => {
                    setLang(opt);
                    setLangOpen(false);
                  }}
                >
                  <span>{opt.flag}</span>
                  <span>{opt.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="button"
        aria-label={menuOpen ? "Close menu" : "Menu"}
        aria-expanded={menuOpen}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/10 focus:outline focus:outline-2 focus:outline-white focus:outline-offset-2 lg:hidden"
        onClick={() => setMenuOpen((o) => !o)}
      >
        <span className="relative h-6 w-6">
          <span
            className="absolute left-1/2 top-1/2 block h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 bg-current transition-all duration-200"
            style={{
              top: menuOpen ? "50%" : "30%",
              transform: menuOpen ? "translate(-50%,-50%) rotate(45deg)" : "translate(-50%,-50%)",
            }}
          />
          <span
            className="absolute left-1/2 top-1/2 block h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 bg-current transition-opacity duration-200"
            style={{ opacity: menuOpen ? 0 : 1 }}
          />
          <span
            className="absolute left-1/2 top-1/2 block h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 bg-current transition-all duration-200"
            style={{
              top: menuOpen ? "50%" : "70%",
              transform: menuOpen ? "translate(-50%,-50%) rotate(-45deg)" : "translate(-50%,-50%)",
            }}
          />
        </span>
      </button>
      {menuOpen && (
        <div className="absolute left-0 right-0 top-[72px] z-[25] border-t border-white/10 bg-[#0f172a]/95 px-6 py-4 backdrop-blur lg:hidden">
          <nav className="flex flex-col gap-3" aria-label="Mobile main">
            {useTree
              ? navTree.flatMap((node) => {
                  const href = navHref(node.url);
                  const rows: ReactNode[] = [];
                  if (node.children?.length) {
                    rows.push(
                      <p key={`g-${node.id}`} className="text-xs font-semibold uppercase tracking-wide text-white/50">
                        {node.label}
                      </p>
                    );
                    node.children.forEach((c) => {
                      const ch = navHref(c.url);
                      if (!ch) return;
                      rows.push(
                        <NavLinkEl
                          key={c.id}
                          href={ch}
                          label={c.label}
                          external={c.open_in_new_tab}
                          className="pl-2 text-sm text-white/90"
                          onNavigate={() => setMenuOpen(false)}
                        />
                      );
                    });
                  } else if (href) {
                    rows.push(
                      <NavLinkEl
                        key={node.id}
                        href={href}
                        label={node.label}
                        external={node.open_in_new_tab}
                        className="text-sm text-white/90"
                        onNavigate={() => setMenuOpen(false)}
                      />
                    );
                  }
                  return rows;
                })
              : fallbackNav.map((item) => {
                  const h = item.href.startsWith("#") ? `/${item.href}` : item.href;
                  return (
                    <NavLinkEl
                      key={item.label + item.href}
                      href={h}
                      label={item.label}
                      external={item.external}
                      className="text-sm text-white/90"
                      onNavigate={() => setMenuOpen(false)}
                    />
                  );
                })}
            <NavLinkEl
              href={
                primaryCta.url.startsWith("#")
                  ? `/${primaryCta.url}`
                  : primaryCta.url
              }
              label={primaryCta.label}
              external={primaryCta.url.startsWith("http")}
              className="mt-2 rounded-full bg-amber-500 py-2.5 text-center text-sm font-semibold text-white"
              onNavigate={() => setMenuOpen(false)}
            />
          </nav>
        </div>
      )}
    </header>
  );
}
