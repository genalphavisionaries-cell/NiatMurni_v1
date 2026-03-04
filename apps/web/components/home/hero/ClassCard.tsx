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
    <div
      className="class-card flex flex-col rounded-lg border border-[#E2E8F0] bg-white transition-all duration-200 ease-out hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
      style={{ padding: "10px 12px", gap: 6 }}
    >
      {/* Top row: date + time | seats */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0">
          <span className="text-[12px] font-semibold text-[#0F172A]">{date} ({day})</span>
          <span className="text-[11px] text-[#64748B]">{time.replace(/\s/g, "")}</span>
        </div>
        <span className="shrink-0 text-[11px] font-semibold text-[#DC2626]">
          🔥 {slots <= 10 ? "Hampir penuh" : `${slots} seats left`}
        </span>
      </div>

      {/* Tags row */}
      <div className="class-tags flex flex-wrap items-center gap-1">
        {isNextAvailable && (
          <span
            className="rounded px-1.5 py-0.5 font-semibold"
            style={{ background: "#DBEAFE", color: "#1D4ED8", fontSize: 10 }}
          >
            Next
          </span>
        )}
        <span
          className="rounded px-1.5 py-0.5 text-[#2563EB]"
          style={{ fontSize: 10, background: "#EFF6FF" }}
        >
          {mode}
        </span>
        <span
          className="rounded px-1.5 py-0.5 text-[#2563EB]"
          style={{ fontSize: 10, background: "#EFF6FF" }}
        >
          {language}
        </span>
      </div>

      {/* Action row: quantity + Daftar */}
      <div className="class-actions flex items-center" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ width: 84 }}>
          <QuantitySelector min={1} max={10} defaultValue={1} />
        </div>
        <Link
          href={`/booking/${item.id}`}
          className="inline-flex shrink-0 items-center justify-center rounded-md bg-[#2563EB] font-semibold text-white transition-colors hover:bg-[#1D4ED8] focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-1"
          style={{ height: 32, padding: "0 12px", fontSize: 12 }}
        >
          Daftar
        </Link>
      </div>
    </div>
  );
}
