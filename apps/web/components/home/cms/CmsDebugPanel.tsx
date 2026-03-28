"use client";

import { useMemo, useState } from "react";
import type { PublicCmsHomepageSection, PublicCmsPayload } from "@/lib/public-cms";
import { cmsString } from "@/lib/public-cms";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatRelativeTime(date: Date): string | null {
  const diffMs = Date.now() - date.getTime();
  if (!Number.isFinite(diffMs)) return null;

  const abs = Math.abs(diffMs);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  const valueAndUnit = abs < minute
    ? { v: Math.max(1, Math.round(abs / 1000)), u: "sec" }
    : abs < hour
      ? { v: Math.round(abs / minute), u: "min" }
      : abs < day
        ? { v: Math.round(abs / hour), u: "hour" }
        : { v: Math.round(abs / day), u: "day" };

  const plural = valueAndUnit.v === 1 ? "" : "s";
  if (diffMs >= 0) return `${valueAndUnit.v} ${valueAndUnit.u}${plural} ago`;
  return `in ${valueAndUnit.v} ${valueAndUnit.u}${plural}`;
}

function getLastUpdatedInfo(lastUpdated: string | null | undefined): { display: string; relative: string | null } {
  if (!lastUpdated || !lastUpdated.trim()) {
    return { display: "(unknown)", relative: null };
  }

  const date = new Date(lastUpdated);
  if (Number.isNaN(date.getTime())) {
    return { display: lastUpdated, relative: null };
  }

  const display = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  return { display, relative: formatRelativeTime(date) };
}

function sectionFieldState(s: PublicCmsHomepageSection): { missing: string[]; allEmpty: boolean } {
  const key = (s.section_key ?? "").trim().toLowerCase();
  const checks: Array<{ field: string; hasValue: boolean }> = [
    { field: "title", hasValue: cmsString(s.title) != null },
    { field: "subtitle", hasValue: cmsString(s.subtitle) != null },
    { field: "description", hasValue: cmsString(s.description) != null },
    { field: "image_url", hasValue: cmsString(s.image_url) != null },
    { field: "button_primary_label", hasValue: cmsString(s.button_primary_label) != null },
    { field: "button_primary_url", hasValue: cmsString(s.button_primary_url) != null },
    { field: "button_secondary_label", hasValue: cmsString(s.button_secondary_label) != null },
    { field: "button_secondary_url", hasValue: cmsString(s.button_secondary_url) != null },
  ];

  const needsItems = ["why_choose_us", "usp", "features"].includes(key);
  if (needsItems) {
    const raw = s.extra_data?.items_json;
    checks.push({ field: "items_json", hasValue: typeof raw === "string" && !!raw.trim() });
  }

  const missing = checks.filter((x) => !x.hasValue).map((x) => x.field);
  return { missing, allEmpty: missing.length === checks.length };
}

export default function CmsDebugPanel({ cms }: { cms: PublicCmsPayload }) {
  const [open, setOpen] = useState(true);
  const isCmsDebug =
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_CMS_DEBUG === "true";

  const sectionKeys = useMemo(() => {
    const keys = (cms.homepage_sections ?? []).map((s) =>
      (s.section_key ?? "").trim().toLowerCase()
    );
    return [...new Set(keys)].sort();
  }, [cms.homepage_sections]);

  const rows = useMemo(() => {
    return (cms.homepage_sections ?? []).map((s) => ({
      key: (s.section_key ?? "").trim().toLowerCase() || "(no key)",
      ...sectionFieldState(s),
    }));
  }, [cms.homepage_sections]);

  const lastUpdatedInfo = useMemo(
    () => getLastUpdatedInfo(cms.last_updated),
    [cms.last_updated]
  );

  if (!isCmsDebug) return null;

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
          <div className="mb-2 text-[10px] uppercase tracking-wide text-emerald-500">Last updated</div>
          <div className="mb-3 text-emerald-200/90">
            {lastUpdatedInfo.display}
            {lastUpdatedInfo.relative ? (
              <span className="ml-1 text-emerald-400/90">({lastUpdatedInfo.relative})</span>
            ) : null}
          </div>
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
                <li
                  key={`${r.key}-${i}`}
                  className={
                    r.allEmpty
                      ? "rounded-sm border-l-2 border-red-500 bg-red-950/30 px-2 py-1"
                      : "border-l-2 border-emerald-800 pl-2"
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className={r.allEmpty ? "text-red-300" : "text-emerald-300"}>{r.key}</div>
                    {r.allEmpty ? (
                      <span className="rounded border border-red-400/70 bg-red-900/50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-200">
                        Section empty
                      </span>
                    ) : null}
                  </div>
                  {r.missing.length ? (
                    <div className={r.allEmpty ? "text-red-200/95" : "text-amber-300/95"}>
                      {r.missing.join(", ")}
                    </div>
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
