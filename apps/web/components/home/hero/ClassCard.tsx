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
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-[#E2E8F0] bg-white p-[10px] transition-all duration-200 ease-out hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
      {/* Row 1: Date + Time */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
        <p className="text-[13px] font-semibold text-[#0F172A]">
          {date} ({day})
        </p>
        <p className="text-[12px] text-[#64748B]">{time}</p>
      </div>
      {/* Row 2: Mode + Language tags */}
      <div className="flex flex-wrap items-center gap-1">
        {isNextAvailable && (
          <span
            className="font-semibold"
            style={{
              background: "#DBEAFE",
              color: "#1D4ED8",
              fontSize: "11px",
              padding: "3px 6px",
              borderRadius: 6,
            }}
          >
            Next Available
          </span>
        )}
        <span className="rounded bg-[#EFF6FF] px-1.5 py-0.5 text-[11px] font-medium text-[#2563EB]">
          {mode}
        </span>
        <span className="rounded bg-[#EFF6FF] px-1.5 py-0.5 text-[11px] font-medium text-[#2563EB]">
          {language}
        </span>
      </div>
      {/* Row 3: Seats + Quantity + Daftar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <span
          className="text-[13px] font-semibold"
          style={{ color: "#DC2626" }}
          title={slots <= 10 ? "Hampir penuh" : undefined}
        >
          🔥 {slots <= 10 ? "Hampir penuh" : `${slots} tempat lagi`}
        </span>
        <div className="flex items-center gap-1.5">
          <QuantitySelector min={1} max={10} defaultValue={1} />
          <Link
            href={`/booking/${item.id}`}
            className="inline-flex shrink-0 items-center justify-center rounded-md bg-[#2563EB] px-2.5 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-1"
          >
            Daftar
          </Link>
        </div>
      </div>
    </div>
  );
}
