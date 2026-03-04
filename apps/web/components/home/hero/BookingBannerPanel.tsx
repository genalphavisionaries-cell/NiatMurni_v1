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

type SidebarItem =
  | { id: string; label: string; tooltip: string; icon: React.ReactNode; type: "action"; onClick: () => void }
  | { id: string; label: string; tooltip: string; icon: React.ReactNode; type: "link"; href: string; external?: boolean };

function CalendarIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
function UserIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
function ChevronLeftIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}
function ChevronRightIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

type BookingBannerPanelProps = {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

export default function BookingBannerPanel({ collapsed, onCollapsedChange }: BookingBannerPanelProps) {
  const [activeTab, setActiveTab] = useState<LanguageFilter>("");
  getRecommendedClasses(MOCK_HERO_CLASSES, activeTab, 5);

  const SIDEBAR_ITEMS: SidebarItem[] = [
    { id: "booking", label: "Tempah", tooltip: "Open booking panel", type: "action", onClick: () => onCollapsedChange(false), icon: <CalendarIcon /> },
    { id: "whatsapp", label: "WhatsApp", tooltip: "Contact us on WhatsApp", type: "link", href: "https://wa.me/60123456789", external: true, icon: <WhatsAppIcon /> },
    { id: "login", label: "Login", tooltip: "Login", type: "link", href: "/login", icon: <UserIcon /> },
  ];

  /* Collapsed: 56px icon sidebar */
  if (collapsed) {
    return (
      <div
        className="flex flex-col items-center gap-3 rounded-xl bg-white pt-5 shadow-[0_25px_60px_rgba(0,0,0,0.15)]"
        style={{ width: 56, paddingTop: 20, gap: 12 }}
      >
        <button
          type="button"
          aria-label="Expand booking panel"
          onClick={() => onCollapsedChange(false)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#374151] hover:bg-[#F3F4F6] focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-1"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
        {SIDEBAR_ITEMS.map((item) =>
          item.type === "action" ? (
            <button
              key={item.id}
              type="button"
              aria-label={item.tooltip}
              onClick={item.onClick}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[#374151] hover:bg-[#F3F4F6] focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-1"
            >
              {item.icon}
            </button>
          ) : (
            <Link
              key={item.id}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              aria-label={item.tooltip}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[#374151] hover:bg-[#F3F4F6] focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-1"
            >
              {item.icon}
            </Link>
          )
        )}
      </div>
    );
  }

  /* Expanded: full panel */
  return (
    <>
      <div
        className="booking-panel relative flex max-h-[80vh] w-full flex-col overflow-hidden rounded-[20px] bg-white"
        style={{
          padding: 24,
          boxShadow: "0 25px 60px rgba(0,0,0,0.15)",
        }}
      >
        <button
          type="button"
          aria-label="Collapse panel"
          onClick={() => onCollapsedChange(true)}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-1"
          style={{ top: 16, right: 16 }}
        >
          <ChevronLeftIcon className="h-5 w-5" />
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

        <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
            <QuickClassList selectedLanguage={activeTab} />
          </div>
          <div className="mt-3 shrink-0 border-t border-[#E5E7EB] pt-3">
            <Link
              href="/#classes"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F172A] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1E293B] focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-1"
            >
              Lihat Jadual Kelas
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
