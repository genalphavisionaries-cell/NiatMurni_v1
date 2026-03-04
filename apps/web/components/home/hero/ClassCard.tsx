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
    <div className="flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 transition-all duration-200 ease-out hover:shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
      <div className="min-w-0 flex-1">
        {isNextAvailable && (
          <span
            className="mb-1.5 inline-block rounded-md px-1.5 py-0.5 text-[11px] font-semibold"
            style={{ background: "#DBEAFE", color: "#1D4ED8" }}
          >
            Next Available
          </span>
        )}
        <p className="font-semibold text-[#0F172A]">
          {date} ({day})
        </p>
        <p className="mt-0.5 text-sm text-[#64748B]">{time}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-[#EFF6FF] px-2 py-1 text-xs font-medium text-[#2563EB]">
            {mode}
          </span>
          <span className="rounded-md bg-[#EFF6FF] px-2 py-1 text-xs font-medium text-[#2563EB]">
            {language}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8F0] pt-3">
        <span className="text-[12px] font-medium text-[#64748B]">
          {slots} tempat lagi
        </span>
        <div className="flex items-center gap-2">
          <QuantitySelector min={1} max={10} defaultValue={1} />
          <Link
            href={`/booking/${item.id}`}
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#2563EB] px-3 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-2"
          >
            Daftar Kelas
          </Link>
        </div>
      </div>
    </div>
  );
}
