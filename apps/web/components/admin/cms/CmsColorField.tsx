"use client";

import { FormLabel, TextInput } from "@/components/dashboard";
import { cn } from "@/lib/utils";
import { safeTrim } from "@/lib/safe-string-utils";

export function CmsColorField({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const hex = safeTrim(value) || "#000000";
  const pickerSafe = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : "#000000";

  return (
    <div className={cn(className)}>
      <FormLabel>{label}</FormLabel>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <input
          type="color"
          value={pickerSafe}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded border border-[var(--border)] bg-white p-0.5"
          aria-label={label}
        />
        <TextInput
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#2563eb"
          className="max-w-[140px] font-mono text-xs"
        />
      </div>
    </div>
  );
}
