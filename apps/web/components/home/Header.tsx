"use client";

import Link from "next/link";
import { useState } from "react";
import type { HomepageSettings } from "@/lib/homepage-settings";

type HeaderProps = {
  settings: Pick<HomepageSettings, "siteName" | "logoUrl" | "logoAlt" | "headerNav">;
};

export default function Header({ settings }: HeaderProps) {
  const { siteName, logoUrl, logoAlt, headerNav } = settings;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-stone-900">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={logoAlt || siteName}
              className="h-9 w-auto max-w-[180px] object-contain"
            />
          ) : (
            <span className="text-lg tracking-tight">{siteName}</span>
          )}
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {headerNav.map((item) =>
            item.external ? (
              <a
                key={item.href + item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-stone-600 transition hover:text-stone-900"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="text-sm font-medium text-stone-600 transition hover:text-stone-900"
              >
                {item.label}
              </Link>
            )
          )}
          <Link
            href="/#classes"
            className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
          >
            Register
          </Link>
        </nav>
        <button
          type="button"
          className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 md:hidden"
          onClick={() => setMobileMenuOpen((o) => !o)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle menu"
        >
          <span className="sr-only">Menu</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="border-t border-stone-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4" aria-label="Main mobile">
            {headerNav.map((item) =>
              item.external ? (
                <a
                  key={item.href + item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-stone-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className="text-sm font-medium text-stone-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            )}
            <Link
              href="/#classes"
              className="rounded-full bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Register
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
