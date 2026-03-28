"use client";

import { cn } from "@/lib/utils";

export function SectionEnabledSwitch({
  enabled,
  onChange,
  label = "Show this section on the site",
}: {
  enabled: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--border)] bg-gray-50 px-4 py-3">
      <span className="text-sm font-medium text-gray-900">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2",
          enabled ? "bg-[var(--primary)]" : "bg-gray-300"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-6 w-6 translate-x-0.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            enabled ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
