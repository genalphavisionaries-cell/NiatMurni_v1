"use client";

import { useState } from "react";
import QuickClassList from "./QuickClassList";
import { getRecommendedClasses, MOCK_HERO_CLASSES, type LanguageFilter } from "./hero-classes";

const TABS: { id: LanguageFilter; label: string }[] = [
  { id: "", label: "Semua" },
  { id: "B. Melayu", label: "Bahasa Melayu" },
  { id: "Chinese", label: "Chinese" },
  { id: "English", label: "English" },
];

export default function BookingBannerPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<LanguageFilter>("");
  getRecommendedClasses(MOCK_HERO_CLASSES, activeTab, 5);

  return (
    <div
      className="absolute left-[60px] top-1/2 z-20 flex max-h-[calc(100vh-80px)] w-[420px] max-w-[90vw] -translate-y-1/2 flex-col overflow-hidden rounded-[18px] bg-white/95 p-[26px] shadow-[0_25px_60px_rgba(0,0,0,0.18)] backdrop-blur-[12px] transition-[width,opacity] duration-[0.25s] ease-out max-lg:relative max-lg:left-0 max-lg:top-auto max-lg:mx-auto max-lg:max-h-none max-lg:translate-y-0 max-lg:mt-0"
      style={{
        width: collapsed ? 48 : 420,
        minHeight: collapsed ? 160 : "auto",
        padding: collapsed ? 8 : 26,
        borderRadius: collapsed ? 12 : 18,
      }}
    >
      {collapsed ? (
        <button
          type="button"
          aria-label="Expand booking panel"
          className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-lg text-[#0F172A] transition-colors hover:bg-white/80 focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-1"
          onClick={() => setCollapsed(false)}
        >
          <span className="text-xl" aria-hidden>📅</span>
          <span className="text-[10px] font-medium text-[#64748B]">Tempah</span>
        </button>
      ) : (
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

          <div className="mt-4 flex-1 overflow-y-auto">
            <QuickClassList selectedLanguage={activeTab} />
          </div>
        </>
      )}
    </div>
  );
}
