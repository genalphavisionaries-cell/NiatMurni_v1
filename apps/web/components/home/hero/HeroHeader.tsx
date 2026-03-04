"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type HeroHeaderProps = {
  siteName?: string;
};

const LANG_OPTIONS = [
  { id: "bm", label: "BM", flag: "🇲🇾" },
  { id: "en", label: "EN", flag: "🇬🇧" },
  { id: "zh", label: "中文", flag: "🇨🇳" },
];

export default function HeroHeader({ siteName = "Niat Murni Academy" }: HeroHeaderProps) {
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

  return (
    <header className="top-nav flex items-center justify-between px-6 py-6 sm:px-8 sm:py-8">
      <Link
        href="/"
        className="text-lg font-semibold text-white drop-shadow-md transition-opacity duration-200 hover:opacity-90 focus:outline focus:outline-2 focus:outline-white focus:outline-offset-2"
      >
        {siteName}
      </Link>
      <div className="flex items-center gap-3">
        <div className="relative" ref={langRef}>
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
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white/90 transition-colors duration-200 hover:bg-white/10 focus:outline focus:outline-2 focus:outline-white focus:outline-offset-2"
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
      </div>
    </header>
  );
}
