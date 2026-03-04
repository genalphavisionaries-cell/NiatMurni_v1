"use client";

import Link from "next/link";
import { useState } from "react";
import QuickClassList from "./QuickClassList";
import QuantitySelector from "./QuantitySelector";
import LanguageQuickSelector from "./LanguageQuickSelector";
import { getRecommendedClasses, MOCK_HERO_CLASSES, type LanguageFilter } from "./hero-classes";

const TABS: { id: LanguageFilter; label: string }[] = [
  { id: "", label: "All Classes" },
  { id: "B. Melayu", label: "Bahasa Melayu" },
  { id: "Chinese", label: "Chinese" },
  { id: "English", label: "English" },
];

export default function QuickClassPanel() {
  const [activeTab, setActiveTab] = useState<LanguageFilter>("");
  const recommended = getRecommendedClasses(MOCK_HERO_CLASSES, activeTab, 3);

  return (
    <div
      className="flex w-full max-w-[440px] flex-col gap-7 overflow-y-auto p-12 font-inter"
      style={{ background: "#F8F7F3" }}
    >
      {/* Small Label */}
      <div className="flex items-center gap-2">
        <svg
          className="h-4 w-4 shrink-0 text-[#2563EB]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: "#2563EB", letterSpacing: "0.04em" }}
        >
          Pendaftaran Segera
        </span>
      </div>

      {/* Main Title */}
      <h1 className="text-[34px] font-bold leading-[1.15] text-[#0F172A]">
        Kursus Pengendalian
        <br />
        Makanan Wajib KKM
      </h1>

      {/* Social proof */}
      <p className="flex items-center gap-3 text-[13px] text-[#64748B]">
        <span>⭐ Trusted by 25,000+ food handlers nationwide</span>
      </p>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <span
          className="rounded-lg px-2.5 py-1.5 text-[13px] font-semibold"
          style={{ background: "#FEF3C7", color: "#92400E" }}
        >
          Sijil dalam 12 Jam
        </span>
        <span
          className="rounded-lg px-2.5 py-1.5 text-[13px] font-semibold"
          style={{ background: "#DBEAFE", color: "#1E40AF" }}
        >
          Fee: RM50 Sahaja
        </span>
      </div>

      {/* Language Quick Selector */}
      <LanguageQuickSelector
        selectedLanguage={activeTab}
        onLanguageChange={setActiveTab}
        hasRecommendedClasses={recommended.length > 0}
      />

      {/* Class Filter Tabs */}
      <div className="flex gap-2.5">
        {TABS.map((tab) => (
          <button
            key={tab.id || "all"}
            type="button"
            aria-pressed={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg border px-3 py-1.5 text-[13px] transition-all duration-200 focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-2 ${
              activeTab !== tab.id ? "hover:bg-[#F1F5F9]" : ""
            }`}
            style={
              activeTab === tab.id
                ? { background: "#2563EB", color: "white", borderColor: "#2563EB" }
                : { background: "#FFFFFF", borderColor: "#E2E8F0", color: "#0F172A" }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Class List */}
      <QuickClassList selectedLanguage={activeTab} />

      {/* Quantity Selector */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-[#0F172A]">Kuantiti</span>
        <QuantitySelector />
      </div>

      {/* CTA */}
      <button
        type="button"
        className="w-full rounded-[10px] py-2.5 px-4 font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-[#1D4ED8] hover:-translate-y-px focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-2 active:translate-y-0"
        style={{ background: "#2563EB" }}
      >
        Pilih Kelas
      </button>

      {/* Trust under CTA */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[#64748B]">
        <span>✓ Sijil sah KKM</span>
        <span>✓ Online training</span>
        <span>✓ Certificate within 12 hours</span>
      </div>

      {/* Bottom CTAs */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          className="w-full rounded-[10px] py-3 px-[18px] font-semibold text-white transition-[background-color,transform] duration-200 hover:-translate-y-px focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-2 active:translate-y-0"
          style={{ background: "#F59E0B" }}
        >
          Daftar Secara Kumpulan
        </button>
        <Link
          href="/#classes"
          className="text-center font-semibold transition hover:underline focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-2"
          style={{ color: "#2563EB" }}
        >
          Lihat Semua →
        </Link>
      </div>
    </div>
  );
}
