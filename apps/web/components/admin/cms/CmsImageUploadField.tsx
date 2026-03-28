"use client";

import { useRef, useState } from "react";
import { FormLabel, TextInput } from "@/components/dashboard";
import { adminApi } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  url: string;
  alt: string;
  onUrlChange: (v: string) => void;
  onAltChange: (v: string) => void;
  showAlt?: boolean;
  disabled?: boolean;
  urlError?: string;
  required?: boolean;
};

export function CmsImageUploadField({
  label,
  url,
  alt,
  onUrlChange,
  onAltChange,
  showAlt = true,
  disabled,
  urlError,
  required: _required,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  const pick = () => inputRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setUploadErr(null);
    setUploading(true);
    try {
      const res = await adminApi.uploadCmsMedia(f);
      onUrlChange(res.data.url);
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <FormLabel>{label}</FormLabel>
      {(urlError || uploadErr) && <p className="mt-0.5 text-xs text-red-600">{urlError || uploadErr}</p>}
      <div className={cn("mt-1 flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-gray-50/80 p-3 sm:flex-row sm:items-start", urlError && "border-red-300")}>
        <div className="flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-white" style={{ width: 96, height: 96 }}>
          {url.trim() ? (
            <img src={url} alt="" className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="px-2 text-center text-xs text-gray-400">No image</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml" className="hidden" onChange={onFile} disabled={disabled || uploading} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={pick}
              disabled={disabled || uploading}
              className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </div>
          <div>
            <span className="text-xs text-gray-500">Image URL</span>
            <TextInput value={url} onChange={(e) => onUrlChange(e.target.value)} placeholder="https://… or /path" className="mt-0.5 font-mono text-xs" disabled={disabled} />
          </div>
          {showAlt ? (
            <div>
              <span className="text-xs text-gray-500">Alt text</span>
              <TextInput value={alt} onChange={(e) => onAltChange(e.target.value)} placeholder="Describe the image" className="mt-0.5 text-sm" disabled={disabled} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
