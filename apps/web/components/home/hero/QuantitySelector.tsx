"use client";

import { useState } from "react";

type QuantitySelectorProps = {
  min?: number;
  max?: number;
  defaultValue?: number;
  onChange?: (n: number) => void;
};

export default function QuantitySelector({
  min = 1,
  max = 99,
  defaultValue = 1,
  onChange,
}: QuantitySelectorProps) {
  const [value, setValue] = useState(defaultValue);

  const update = (n: number) => {
    const next = Math.min(max, Math.max(min, n));
    setValue(next);
    onChange?.(next);
  };

  return (
    <div className="flex items-center overflow-hidden rounded-md border border-[#E2E8F0]">
      <button
        type="button"
        aria-label="Decrease"
        className="flex h-6 w-6 items-center justify-center bg-[#F1F5F9] text-[12px] font-medium text-[#0F172A] transition-colors duration-150 hover:bg-[#E2E8F0] focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-1 active:bg-[#CBD5E1]"
        onClick={() => update(value - 1)}
      >
        <span>−</span>
      </button>
      <span className="min-w-[1.5rem] px-1 text-center text-[12px] font-medium text-[#0F172A]">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase"
        className="flex h-6 w-6 items-center justify-center bg-[#F1F5F9] text-[12px] font-medium text-[#0F172A] transition-colors duration-150 hover:bg-[#E2E8F0] focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-1 active:bg-[#CBD5E1]"
        onClick={() => update(value + 1)}
      >
        <span>+</span>
      </button>
    </div>
  );
}
