"use client";

import Link from "next/link";
import QuantitySelector from "./QuantitySelector";
import type { HeroClassItem } from "./hero-classes";

type ClassCardProps = {
  item: HeroClassItem;
  isNextAvailable?: boolean;
};

export default function ClassCard({ item, isNextAvailable = false }: ClassCardProps) {
  const { date, day, time, slots, mode, language } = item;
  const isLowStock = slots <= 10;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm transition-all duration-200 hover:border-[#2563EB]/30 hover:shadow-md">
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 h-full w-1 shrink-0 rounded-l-xl"
        style={{ background: "linear-gradient(180deg, #2563EB 0%, #1D4ED8 100%)" }}
        aria-hidden
      />

      <div className="flex flex-col gap-3 pl-4 pr-4 py-4 sm:pl-5 sm:pr-5 sm:py-4">
        {/* Row 1: Date + time (left) | Seats (right) — no overlap */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#0F172A] leading-tight">
              {date} <span className="font-normal text-[#64748B]">({day})</span>
            </p>
            <p className="mt-0.5 text-xs text-[#64748B] leading-tight whitespace-nowrap">
              {time.replace(/\s*–\s*/g, " – ")}
            </p>
          </div>
          <span
            className={`shrink-0 inline-flex items-center gap-1 text-xs font-semibold ${isLowStock ? "text-[#DC2626]" : "text-[#0F172A]"}`}
          >
            <span aria-hidden>🔥</span>
            {isLowStock ? "Hampir penuh" : `${slots} seats left`}
          </span>
        </div>

        {/* Row 2: Tags only — single row, no wrap into seats */}
        <div className="flex flex-wrap items-center gap-1.5">
          {isNextAvailable && (
            <span className="rounded-full bg-[#DBEAFE] px-2.5 py-0.5 text-xs font-semibold text-[#1D4ED8]">
              Next
            </span>
          )}
          <span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-xs font-medium text-[#475569]">
            {mode}
          </span>
          <span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-xs font-medium text-[#475569]">
            {language}
          </span>
        </div>

        {/* Row 3: Quantity (left) | Daftar (right) */}
        <div className="flex items-center justify-between gap-3 pt-0.5">
          <QuantitySelector min={1} max={10} defaultValue={1} />
          <Link
            href={`/booking/${item.id}`}
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1D4ED8] hover:shadow focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-2"
          >
            Daftar
          </Link>
        </div>
      </div>
    </div>
  );
}
