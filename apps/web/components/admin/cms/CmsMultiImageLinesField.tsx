"use client";

import { useMemo } from "react";
import { FormLabel } from "@/components/dashboard";
import { CmsImageUploadField } from "./CmsImageUploadField";

function parseLines(s: string): string[] {
  return s.split("\n").map((x) => x.trim());
}

function packFromSlots(slots: { url: string; alt: string }[]): { urls: string; alts: string } {
  const ku: string[] = [];
  const ka: string[] = [];
  for (const s of slots) {
    if (s.url.trim()) {
      ku.push(s.url.trim());
      ka.push(s.alt.trim());
    }
  }
  return { urls: ku.join("\n"), alts: ka.join("\n") };
}

type Props = {
  label: string;
  urlsText: string;
  altsText: string;
  onUrlsTextChange: (v: string) => void;
  onAltsTextChange: (v: string) => void;
  slotCount: number;
  disabled?: boolean;
};

/** Fixed slots; only non-empty URLs are written to the newline-backed API fields. */
export function CmsMultiImageLinesField({
  label,
  urlsText,
  altsText,
  onUrlsTextChange,
  onAltsTextChange,
  slotCount,
  disabled,
}: Props) {
  const rows = useMemo(() => {
    const u = parseLines(urlsText);
    const a = parseLines(altsText);
    const out: { url: string; alt: string }[] = [];
    for (let i = 0; i < slotCount; i++) {
      out.push({ url: u[i] ?? "", alt: a[i] ?? "" });
    }
    return out;
  }, [urlsText, altsText, slotCount]);

  const commit = (next: { url: string; alt: string }[]) => {
    const { urls, alts } = packFromSlots(next);
    onUrlsTextChange(urls);
    onAltsTextChange(alts);
  };

  const setRow = (index: number, patch: Partial<{ url: string; alt: string }>) => {
    const base = rows.map((r) => ({ ...r }));
    base[index] = { ...base[index], ...patch };
    commit(base);
  };

  return (
    <div>
      <FormLabel>{label}</FormLabel>
      <p className="mt-0.5 text-xs text-gray-500">{slotCount} slots — unused slots are omitted when saving.</p>
      <div className="mt-2 space-y-4">
        {rows.map((row, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
            <CmsImageUploadField
              label={`Image ${i + 1}`}
              url={row.url}
              alt={row.alt}
              onUrlChange={(v) => setRow(i, { url: v })}
              onAltChange={(v) => setRow(i, { alt: v })}
              disabled={disabled}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
