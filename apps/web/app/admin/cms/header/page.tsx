"use client";

import { useEffect, useState } from "react";
import { FormSection, FormLabel, TextInput } from "@/components/dashboard";
import { adminApi } from "@/lib/admin-api";
import type { CmsHeaderData, CmsMenuItem } from "@/lib/admin-api";
import { cn } from "@/lib/utils";
import { isValidHttpOrRelativeUrl } from "@/lib/cms-admin-validation";
import { safeTrim } from "@/lib/safe-string-utils";
import { CmsFieldGroup } from "@/components/admin/cms/CmsFieldGroup";
import { SectionEnabledSwitch } from "@/components/admin/cms/SectionEnabledSwitch";
import { CmsImageUploadField } from "@/components/admin/cms/CmsImageUploadField";
import { CmsColorField } from "@/components/admin/cms/CmsColorField";

const emptyHeader: CmsHeaderData = {
  logo_url: "",
  logo_alt: "",
  menu_items: [],
  cta: { label: "", url: "", bg_color: "", text_color: "" },
  languages: [],
  enabled: true,
};

function validateHeader(d: CmsHeaderData): string[] {
  const e: string[] = [];
  if (safeTrim(d.logo_url) && !isValidHttpOrRelativeUrl(d.logo_url)) {
    e.push("Header: logo URL is invalid.");
  }
  if (safeTrim(d.cta.url) && !isValidHttpOrRelativeUrl(d.cta.url)) {
    e.push("Header: CTA URL is invalid.");
  }
  for (const item of d.menu_items) {
    if (safeTrim(item.url) && !isValidHttpOrRelativeUrl(item.url)) {
      e.push("Header: a menu item has an invalid URL.");
      break;
    }
  }
  return e;
}

export default function AdminCmsHeaderPage() {
  const [data, setData] = useState<CmsHeaderData>(emptyHeader);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    adminApi
      .getCmsHomepage()
      .then((res) => setData({ ...emptyHeader, ...res.data.header }))
      .catch(() => setMessage({ type: "error", text: "Failed to load header data." }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setMessage(null);
    const errs = validateHeader(data);
    if (errs.length) {
      setMessage({ type: "error", text: errs.join(" ") });
      return;
    }
    setSaving(true);
    try {
      await adminApi.updateCmsHomepage({ header: data } as never);
      setMessage({ type: "success", text: "Header saved." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Save failed." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-12 text-center text-sm text-gray-500">Loading…</div>;

  const enabled = data.enabled !== false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Header & Navigation</h1>
          <p className="mt-1 text-sm text-gray-500">Edit header logo, menu items, CTA button, and language options.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {message && (
        <div className={cn("rounded-lg px-4 py-3 text-sm", message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800")}>{message.text}</div>
      )}

      <SectionEnabledSwitch enabled={enabled} onChange={(v) => setData({ ...data, enabled: v })} label="Show header section on the site" />

      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <CmsFieldGroup title="Media">
          <CmsImageUploadField
            label="Logo"
            url={data.logo_url}
            alt={data.logo_alt ?? ""}
            onUrlChange={(v) => setData({ ...data, logo_url: v })}
            onAltChange={(v) => setData({ ...data, logo_alt: v })}
            disabled={!enabled}
          />
        </CmsFieldGroup>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Navigation Menu</h2>
        {data.menu_items.map((item, i) => (
          <div key={i} className="mt-2 grid grid-cols-4 gap-2 rounded-lg border border-gray-200 p-3">
            <TextInput
              placeholder="Label"
              value={item.label}
              onChange={(e) => {
                const next = [...data.menu_items];
                next[i] = { ...next[i], label: e.target.value };
                setData({ ...data, menu_items: next });
              }}
              disabled={!enabled}
            />
            <TextInput
              placeholder="URL"
              value={item.url}
              onChange={(e) => {
                const next = [...data.menu_items];
                next[i] = { ...next[i], url: e.target.value };
                setData({ ...data, menu_items: next });
              }}
              disabled={!enabled}
            />
            <select
              value={item.type}
              onChange={(e) => {
                const next = [...data.menu_items];
                next[i] = { ...next[i], type: e.target.value };
                setData({ ...data, menu_items: next });
              }}
              disabled={!enabled}
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
            >
              <option value="page">Page</option>
              <option value="anchor">Anchor</option>
              <option value="external">External</option>
            </select>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={item.has_children}
                  onChange={(e) => {
                    const next = [...data.menu_items];
                    next[i] = { ...next[i], has_children: e.target.checked };
                    setData({ ...data, menu_items: next });
                  }}
                  disabled={!enabled}
                />
                Children
              </label>
              <button
                type="button"
                onClick={() => setData({ ...data, menu_items: data.menu_items.filter((_, j) => j !== i) })}
                className="ml-auto text-red-500 hover:text-red-700 text-sm"
                disabled={!enabled}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setData({ ...data, menu_items: [...data.menu_items, { label: "", url: "", type: "page", has_children: false }] })}
          className="mt-2 text-sm text-slate-700 hover:underline disabled:opacity-50"
          disabled={!enabled}
        >
          + Add menu item
        </button>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Call to Action</h2>
        <FormSection className="space-y-6">
          <CmsFieldGroup title="Content">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FormLabel>Label</FormLabel>
                <TextInput
                  value={data.cta.label}
                  onChange={(e) => setData({ ...data, cta: { ...data.cta, label: e.target.value } })}
                  className="mt-1"
                  disabled={!enabled}
                />
              </div>
              <div>
                <FormLabel>URL</FormLabel>
                <TextInput
                  value={data.cta.url}
                  onChange={(e) => setData({ ...data, cta: { ...data.cta, url: e.target.value } })}
                  className="mt-1"
                  disabled={!enabled}
                />
              </div>
            </div>
          </CmsFieldGroup>
          <CmsFieldGroup title="Styling">
            <div className="grid gap-4 sm:grid-cols-2">
              <CmsColorField label="Button background" value={data.cta.bg_color} onChange={(v) => setData({ ...data, cta: { ...data.cta, bg_color: v } })} />
              <CmsColorField label="Button text" value={data.cta.text_color} onChange={(v) => setData({ ...data, cta: { ...data.cta, text_color: v } })} />
            </div>
          </CmsFieldGroup>
        </FormSection>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Languages</h2>
        {data.languages.map((lang, i) => (
          <div key={i} className="mt-2 grid grid-cols-3 gap-2 rounded-lg border border-gray-200 p-3">
            <TextInput
              placeholder="Code (e.g. en)"
              value={lang.code}
              onChange={(e) => {
                const next = [...data.languages];
                next[i] = { ...next[i], code: e.target.value };
                setData({ ...data, languages: next });
              }}
              disabled={!enabled}
            />
            <TextInput
              placeholder="Label"
              value={lang.label}
              onChange={(e) => {
                const next = [...data.languages];
                next[i] = { ...next[i], label: e.target.value };
                setData({ ...data, languages: next });
              }}
              disabled={!enabled}
            />
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={lang.active}
                  onChange={(e) => {
                    const next = [...data.languages];
                    next[i] = { ...next[i], active: e.target.checked };
                    setData({ ...data, languages: next });
                  }}
                  disabled={!enabled}
                />
                Active
              </label>
              <button
                type="button"
                onClick={() => setData({ ...data, languages: data.languages.filter((_, j) => j !== i) })}
                className="ml-auto text-red-500 hover:text-red-700 text-sm"
                disabled={!enabled}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setData({ ...data, languages: [...data.languages, { code: "", label: "", active: true }] })}
          className="mt-2 text-sm text-slate-700 hover:underline disabled:opacity-50"
          disabled={!enabled}
        >
          + Add language
        </button>
      </div>
    </div>
  );
}
