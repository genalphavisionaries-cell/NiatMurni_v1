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
    <div className="flex items-center overflow-hidden rounded-lg border border-[#E2E8F0]">
      <button
        type="button"
        aria-label="Decrease"
        className="flex h-7 w-7 items-center justify-center bg-[#F1F5F9] text-hero-text-primary hover:bg-slate-200"
        onClick={() => update(value - 1)}
      >
        <span className="text-sm font-medium">−</span>
      </button>
      <span className="min-w-[2rem] px-2 text-center font-medium text-hero-text-primary">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase"
        className="flex h-7 w-7 items-center justify-center bg-[#F1F5F9] text-hero-text-primary hover:bg-slate-200"
        onClick={() => update(value + 1)}
      >
        <span className="text-sm font-medium">+</span>
      </button>
    </div>
  );
}
