"use client";

import { useState } from "react";
import Link from "next/link";
import QuickClassList from "./QuickClassList";
import { getRecommendedClasses, MOCK_HERO_CLASSES, type LanguageFilter } from "./hero-classes";

const TABS: { id: LanguageFilter; label: string }[] = [
  { id: "", label: "Semua" },
  { id: "B. Melayu", label: "Bahasa Melayu" },
  { id: "Chinese", label: "Chinese" },
  { id: "English", label: "English" },
];

const SIDEBAR_ITEMS = [
  {
    id: "booking",
    label: "Tempah",
    tooltip: "Open booking panel",
    onClick: true as const,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    tooltip: "Contact us on WhatsApp",
    href: "https://wa.me/60123456789",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    id: "login",
    label: "Login",
    tooltip: "Login",
    href: "/login",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
] as const;

export default function BookingBannerPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<LanguageFilter>("");
  const [tooltip, setTooltip] = useState<string | null>(null);
  getRecommendedClasses(MOCK_HERO_CLASSES, activeTab, 3);

  return (
    <>
      {/* Collapsed: fixed vertical sticky sidebar (desktop only) */}
      <aside
        className="fixed left-0 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-1 py-3 lg:flex"
        style={{
          width: 56,
          borderRadius: "0 14px 14px 0",
          background: "white",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          opacity: collapsed ? 1 : 0,
          pointerEvents: collapsed ? "auto" : "none",
        }}
        aria-hidden={!collapsed}
      >
        {SIDEBAR_ITEMS.map((item) => (
          <div key={item.id} className="relative flex flex-col items-center">
            {item.onClick ? (
              <button
                type="button"
                aria-label={item.tooltip}
                title={item.tooltip}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[#374151] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827] focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-1"
                onClick={() => item.id === "booking" && setCollapsed(false)}
                onMouseEnter={() => setTooltip(item.label)}
                onMouseLeave={() => setTooltip(null)}
              >
                {item.icon}
              </button>
            ) : (
              <Link
                href={item.href ?? "#"}
                target={item.id === "whatsapp" ? "_blank" : undefined}
                rel={item.id === "whatsapp" ? "noopener noreferrer" : undefined}
                aria-label={item.tooltip}
                title={item.tooltip}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[#374151] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827] focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-1"
                onMouseEnter={() => setTooltip(item.label)}
                onMouseLeave={() => setTooltip(null)}
              >
                {item.icon}
              </Link>
            )}
            {tooltip === item.label && (
              <span
                className="absolute left-full top-1/2 z-30 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#1F2937] px-2.5 py-1.5 text-[12px] font-medium text-white shadow-lg"
                role="tooltip"
              >
                {item.tooltip}
              </span>
            )}
          </div>
        ))}
      </aside>

      {/* Collapsed: mobile-only expand tab */}
      <button
        type="button"
        aria-label="Open booking panel"
        onClick={() => setCollapsed(false)}
        className="fixed bottom-6 left-4 z-20 flex flex-col items-center gap-0.5 rounded-xl border-0 bg-white p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-opacity lg:hidden"
        style={{
          opacity: collapsed ? 1 : 0,
          pointerEvents: collapsed ? "auto" : "none",
        }}
        aria-hidden={!collapsed}
      >
        <svg className="h-5 w-5 text-[#374151]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-[10px] font-medium text-[#64748B]">Tempah</span>
      </button>

      {/* Expanded: booking panel */}
      <div
        className="absolute left-[60px] top-1/2 z-20 flex max-h-[calc(100vh-80px)] w-[420px] max-w-[90vw] -translate-y-1/2 flex-col overflow-hidden rounded-[18px] bg-white/95 p-[26px] shadow-[0_25px_60px_rgba(0,0,0,0.18)] backdrop-blur-[12px] transition-[width,opacity] duration-[0.25s] ease-out max-lg:relative max-lg:left-0 max-lg:top-auto max-lg:mx-auto max-lg:max-h-none max-lg:translate-y-0 max-lg:mt-0"
        style={{
          width: collapsed ? 0 : 420,
          minHeight: collapsed ? 0 : "auto",
          padding: collapsed ? 0 : 26,
          borderRadius: 18,
          opacity: collapsed ? 0 : 1,
          pointerEvents: collapsed ? "none" : "auto",
          overflow: "hidden",
        }}
        aria-hidden={collapsed}
      >
        {!collapsed && (
          <>
            <button
              type="button"
              aria-label="Collapse panel"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A] focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-1"
              onClick={() => setCollapsed(true)}
            >
              <span className="text-sm font-bold" aria-hidden>▾</span>
            </button>

            <p className="text-[13px] font-semibold uppercase tracking-wider text-[#2563EB]">
              Tempah Kursus Anda
            </p>
            <h2 className="mt-1 text-[22px] font-bold leading-tight text-[#0F172A]">
              Kursus Pengendalian Makanan Wajib KKM
            </h2>
            <p className="mt-2 text-[13px] text-[#64748B]">
              Latihan rasmi untuk pengendali makanan. Sijil sah KKM dikeluarkan dalam 12 jam.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-3 py-1.5 text-[12px] font-semibold text-[#166534]">
                ✓ Sijil dalam masa 12 jam
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#EFF6FF] px-3 py-1.5 text-[12px] font-semibold text-[#1D4ED8]">
                ✓ Yuran hanya RM50
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id || "all"}
                  type="button"
                  aria-pressed={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-1"
                  style={
                    activeTab === tab.id
                      ? { background: "#2563EB", color: "white" }
                      : { background: "#F3F4F6", color: "#374151" }
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-4 flex-1 min-h-0">
              <QuickClassList selectedLanguage={activeTab} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
