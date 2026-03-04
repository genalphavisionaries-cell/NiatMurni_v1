"use client";

import Link from "next/link";
import { useState } from "react";
import QuickClassList from "./QuickClassList";
import QuantitySelector from "./QuantitySelector";

const TABS = [
  { id: "all", label: "All Classes" },
  { id: "bm", label: "Bahasa Melayu" },
  { id: "ch", label: "Chinese" },
  { id: "en", label: "English" },
];

export default function QuickClassPanel() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div
      className="flex w-full max-w-[440px] flex-col gap-7 overflow-y-auto p-12 font-inter"
      style={{ background: "#F8F7F3" }}
    >
      {/* 3.1 Small Label */}
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

      {/* 3.2 Main Title */}
      <h1
        className="text-[34px] font-bold leading-[1.15] text-[#0F172A]"
      >
        Kursus Pengendalian
        <br />
        Makanan Wajib KKM
      </h1>

      {/* 3.3 Badges */}
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

      {/* 3.4 Class Filter Tabs */}
      <div className="flex gap-2.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className="rounded-lg border px-3 py-1.5 text-[13px] transition"
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

      {/* 3.5 Class List */}
      <QuickClassList />

      {/* 3.6 Quantity Selector */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-[#0F172A]">Kuantiti</span>
        <QuantitySelector />
      </div>

      {/* 3.7 CTA */}
      <button
        type="button"
        className="w-full rounded-[10px] py-2.5 px-4 font-semibold text-white transition hover:bg-[#1D4ED8]"
        style={{ background: "#2563EB" }}
      >
        Pilih Kelas
      </button>

      {/* 3.8 Bottom CTAs */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          className="w-full rounded-[10px] py-3 px-[18px] font-semibold text-white transition hover:opacity-90"
          style={{ background: "#F59E0B" }}
        >
          Daftar Secara Kumpulan
        </button>
        <Link
          href="/#classes"
          className="text-center font-semibold transition hover:underline"
          style={{ color: "#2563EB" }}
        >
          Lihat Semua →
        </Link>
      </div>
    </div>
  );
}
