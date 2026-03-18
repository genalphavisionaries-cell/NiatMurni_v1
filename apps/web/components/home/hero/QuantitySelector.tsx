"use client";

import { useState } from "react";

type QuantitySelectorProps = {
  min?: number;
  max?: number;
  defaultValue?: number;
  onChange?: (n: number) => void;
  compact?: boolean;
};

export default function QuantitySelector({
  min = 1,
  max = 99,
  defaultValue = 1,
  onChange,
  compact = false,
}: QuantitySelectorProps) {
  const [value, setValue] = useState(defaultValue);

  const update = (n: number) => {
    const next = Math.min(max, Math.max(min, n));
    setValue(next);
    onChange?.(next);
  };

  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-sm">
      <button
        type="button"
        aria-label="Decrease"
        className={`flex items-center justify-center bg-[#F8FAFC] transition-colors duration-150 hover:bg-[#E2E8F0] focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-1 active:bg-[#CBD5E1] ${
          compact
            ? "h-7 w-7 text-xs font-medium text-[#0F172A]"
            : "h-8 w-8 text-sm font-medium text-[#0F172A]"
        }`}
        onClick={() => update(value - 1)}
      >
        <span>−</span>
      </button>
      <span
        className={`px-1 text-center font-semibold text-[#0F172A] ${
          compact ? "min-w-[1.6rem] text-xs" : "min-w-[2rem] text-sm"
        }`}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase"
        className={`flex items-center justify-center bg-[#F8FAFC] transition-colors duration-150 hover:bg-[#E2E8F0] focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-1 active:bg-[#CBD5E1] ${
          compact
            ? "h-7 w-7 text-xs font-medium text-[#0F172A]"
            : "h-8 w-8 text-sm font-medium text-[#0F172A]"
        }`}
        onClick={() => update(value + 1)}
      >
        <span>+</span>
      </button>
    </div>
  );
}
