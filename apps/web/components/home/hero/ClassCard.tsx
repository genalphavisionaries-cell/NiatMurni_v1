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
      className="class-card flex flex-col rounded-lg border border-[#E2E8F0] bg-white transition-all duration-200 ease-out hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
      style={{ padding: "12px 16px", gap: 8 }}
    >
      <div className="class-row-top flex flex-wrap items-center gap-x-2 gap-y-0">
        <span className="text-[13px] font-semibold text-[#0F172A]">{date} ({day})</span>
        <span className="text-[12px] text-[#64748B]">{time.replace(/\s/g, "")}</span>
      </div>

      <div className="class-tags flex flex-wrap items-center gap-1">
        {isNextAvailable && (
          <span
            className="font-semibold"
            style={{
              background: "#DBEAFE",
              color: "#1D4ED8",
              fontSize: 11,
              padding: "3px 6px",
              borderRadius: 6,
            }}
          >
            Next
          </span>
        )}
        <span
          className="rounded text-[#2563EB]"
          style={{ fontSize: 11, padding: "3px 6px", background: "#EFF6FF" }}
        >
          {mode}
        </span>
        <span
          className="rounded text-[#2563EB]"
          style={{ fontSize: 11, padding: "3px 6px", background: "#EFF6FF" }}
        >
          {language}
        </span>
      </div>

      <div className="class-seats text-[13px] font-semibold" style={{ color: "#DC2626" }}>
        🔥 {slots <= 10 ? "Hampir penuh" : `${slots} seats left`}
      </div>

      <div
        className="class-actions flex items-center"
        style={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <div style={{ width: 90 }}>
          <QuantitySelector min={1} max={10} defaultValue={1} />
        </div>
        <Link
          href={`/booking/${item.id}`}
          className="inline-flex shrink-0 items-center justify-center rounded-md bg-[#2563EB] font-semibold text-white transition-colors hover:bg-[#1D4ED8] focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-1"
          style={{ height: 36, padding: "0 14px", fontSize: 13 }}
        >
          Daftar
        </Link>
      </div>
    </div>
  );
}
