"use client";

import { useMemo, useState } from "react";
import type { PublicCmsHomepageSection, PublicCmsPayload } from "@/lib/public-cms";
import { cmsString } from "@/lib/public-cms";

function missingFieldsForSection(s: PublicCmsHomepageSection): string[] {
  const key = (s.section_key ?? "").trim().toLowerCase();
  const missing: string[] = [];
  if (!cmsString(s.title)) missing.push("title");
  if (!cmsString(s.subtitle)) missing.push("subtitle");
  if (!cmsString(s.description)) missing.push("description");
  if (!cmsString(s.image_url)) missing.push("image_url");
  if (!cmsString(s.button_primary_label)) missing.push("button_primary_label");
  if (!cmsString(s.button_primary_url)) missing.push("button_primary_url");
  if (!cmsString(s.button_secondary_label)) missing.push("button_secondary_label");
  if (!cmsString(s.button_secondary_url)) missing.push("button_secondary_url");

  const needsItems = ["why_choose_us", "usp", "features"].includes(key);
  if (needsItems) {
    const raw = s.extra_data?.items_json;
    if (typeof raw !== "string" || !raw.trim()) missing.push("items_json");
  }

  return missing;
}

export default function CmsDebugPanel({ cms }: { cms: PublicCmsPayload }) {
  const [open, setOpen] = useState(true);

  const sectionKeys = useMemo(() => {
    const keys = (cms.homepage_sections ?? []).map((s) =>
      (s.section_key ?? "").trim().toLowerCase()
    );
    return [...new Set(keys)].sort();
  }, [cms.homepage_sections]);

  const rows = useMemo(() => {
    return (cms.homepage_sections ?? []).map((s) => ({
      key: (s.section_key ?? "").trim().toLowerCase() || "(no key)",
      missing: missingFieldsForSection(s),
    }));
  }, [cms.homepage_sections]);

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div
      className="fixed bottom-3 right-3 z-[9999] max-h-[min(50vh,20rem)] w-[min(calc(100vw-1.5rem),18rem)] overflow-hidden rounded-md border border-emerald-800/80 bg-zinc-950/95 text-left text-[11px] leading-snug text-emerald-100 shadow-lg backdrop-blur-sm"
      aria-hidden
    >
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 border-b border-emerald-900/80 bg-emerald-950/50 px-2 py-1.5 font-semibold text-emerald-300"
        onClick={() => setOpen((o) => !o)}
      >
        <span>CMS debug</span>
        <span className="text-[10px] font-normal opacity-80">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div className="max-h-[min(45vh,18rem)] overflow-y-auto p-2 font-mono">
          <div className="mb-2 text-[10px] uppercase tracking-wide text-emerald-500">Section keys</div>
          <div className="mb-3 break-all text-emerald-200/90">
            {sectionKeys.length ? sectionKeys.join(", ") : <span className="text-amber-400">(none)</span>}
          </div>
          <div className="mb-1 text-[10px] uppercase tracking-wide text-emerald-500">Missing fields</div>
          {rows.length === 0 ? (
            <div className="text-amber-400">No homepage_sections</div>
          ) : (
            <ul className="space-y-2">
              {rows.map((r, i) => (
                <li key={`${r.key}-${i}`} className="border-l-2 border-emerald-800 pl-2">
                  <div className="text-emerald-300">{r.key}</div>
                  {r.missing.length ? (
                    <div className="text-amber-300/95">{r.missing.join(", ")}</div>
                  ) : (
                    <div className="text-emerald-600">—</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
