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
    <div
      className="group relative flex flex-col overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm transition-all duration-200 hover:border-[#2563EB]/30 hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:gap-6"
      style={{ paddingLeft: 14 }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 h-full w-1 shrink-0 rounded-l-xl"
        style={{ background: "linear-gradient(180deg, #2563EB 0%, #1D4ED8 100%)" }}
        aria-hidden
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2 py-4 pr-4 sm:flex-row sm:items-center sm:gap-6 sm:py-4 sm:pr-0">
        {/* Date & time */}
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-[#0F172A]">
            {date} <span className="font-normal text-[#64748B]">({day})</span>
          </span>
          <span className="text-xs text-[#64748B]">{time.replace(/\s/g, " ")}</span>
        </div>

        {/* Tags */}
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
      </div>

      {/* Right: seats + quantity + CTA */}
      <div className="flex flex-wrap items-center gap-3 border-t border-[#E2E8F0] bg-[#FAFAFA]/80 px-4 py-3 sm:border-t-0 sm:border-l sm:bg-transparent sm:pl-0 sm:pr-4 sm:py-4">
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold ${isLowStock ? "text-[#DC2626]" : "text-[#0F172A]"}`}
        >
          <span aria-hidden>🔥</span>
          {isLowStock ? "Hampir penuh" : `${slots} seats left`}
        </span>
        <div className="flex items-center gap-3">
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
