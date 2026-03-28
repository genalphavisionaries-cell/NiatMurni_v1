"use client";

import { useEffect, useState } from "react";
import { FormSection, FormLabel, TextInput } from "@/components/dashboard";
import { adminApi } from "@/lib/admin-api";
import type { CmsFooterData, CmsFooterLink } from "@/lib/admin-api";
import { cn } from "@/lib/utils";
import { hasRichText, isValidHttpOrRelativeUrl } from "@/lib/cms-admin-validation";
import { safeTrim, splitAndTrimLines } from "@/lib/safe-string-utils";
import { CmsFieldGroup } from "@/components/admin/cms/CmsFieldGroup";
import { SectionEnabledSwitch } from "@/components/admin/cms/SectionEnabledSwitch";
import { CmsRichTextField } from "@/components/admin/cms/CmsRichTextField";
import { CmsImageUploadField } from "@/components/admin/cms/CmsImageUploadField";
import { CmsMultiImageLinesField } from "@/components/admin/cms/CmsMultiImageLinesField";

const emptyFooter: CmsFooterData = {
  brand: { logo_url: "", description: "", logo_alt: "" },
  quick_links: [],
  buttons: [],
  payment: { title: "", icons_urls: "", icons_alts: "" },
  legal_links: [],
  bottom: { copyright: "", ssl_badge_url: "" },
  enabled: true,
};

type Tab = "brand" | "links" | "payment" | "bottom";
const tabs: { key: Tab; label: string }[] = [
  { key: "brand", label: "Brand" },
  { key: "links", label: "Links & Buttons" },
  { key: "payment", label: "Payment Trust" },
  { key: "bottom", label: "Bottom Bar" },
];

function validateFooter(d: CmsFooterData): string[] {
  const e: string[] = [];
  if (d.enabled !== false) {
    if (!hasRichText(d.brand?.description ?? "") && !safeTrim(d.brand?.logo_url)) {
      e.push("Footer: add brand description or logo when the section is enabled.");
    }
  }
  if (safeTrim(d.brand?.logo_url) && !isValidHttpOrRelativeUrl(d.brand.logo_url)) {
    e.push("Footer: brand logo URL is invalid.");
  }
  const linkLists = [...(d.quick_links ?? []), ...(d.buttons ?? []), ...(d.legal_links ?? [])];
  for (const link of linkLists) {
    if (safeTrim(link.url) && !isValidHttpOrRelativeUrl(link.url)) {
      e.push("Footer: a link has an invalid URL.");
      break;
    }
  }
  for (const line of splitAndTrimLines(d.payment.icons_urls)) {
    if (!isValidHttpOrRelativeUrl(line)) {
      e.push("Footer: invalid payment icon URL.");
      break;
    }
  }
  if (safeTrim(d.bottom.ssl_badge_url) && !isValidHttpOrRelativeUrl(d.bottom.ssl_badge_url)) {
    e.push("Footer: SSL badge URL is invalid.");
  }
  return e;
}

export default function AdminCmsFooterPage() {
  const [activeTab, setActiveTab] = useState<Tab>("brand");
  const [data, setData] = useState<CmsFooterData>(emptyFooter);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    adminApi
      .getCmsHomepage()
      .then((res) => setData({ ...emptyFooter, ...res.data.footer }))
      .catch(() => setMessage({ type: "error", text: "Failed to load footer data." }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setMessage(null);
    const errs = validateFooter(data);
    if (errs.length) {
      setMessage({ type: "error", text: errs.join(" ") });
      return;
    }
    setSaving(true);
    try {
      await adminApi.updateCmsHomepage({ footer: data } as never);
      setMessage({ type: "success", text: "Footer saved." });
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
          <h1 className="text-2xl font-semibold text-gray-900">Footer</h1>
          <p className="mt-1 text-sm text-gray-500">Edit footer branding, links, payment icons, and legal text.</p>
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

      <SectionEnabledSwitch enabled={enabled} onChange={(v) => setData({ ...data, enabled: v })} label="Show footer section on the site" />

      <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-gray-50 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeTab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        {activeTab === "brand" && (
          <FormSection className="space-y-8">
            <CmsFieldGroup title="Media">
              <CmsImageUploadField
                label="Brand logo"
                url={data.brand.logo_url}
                alt={data.brand.logo_alt ?? ""}
                onUrlChange={(v) => setData({ ...data, brand: { ...data.brand, logo_url: v } })}
                onAltChange={(v) => setData({ ...data, brand: { ...data.brand, logo_alt: v } })}
                disabled={!enabled}
              />
            </CmsFieldGroup>
            <CmsFieldGroup title="Content">
              <CmsRichTextField
                label="Footer content (description)"
                value={data.brand.description}
                onChange={(v) => setData({ ...data, brand: { ...data.brand, description: v } })}
                disabled={!enabled}
              />
            </CmsFieldGroup>
          </FormSection>
        )}

        {activeTab === "links" && (
          <FormSection className="space-y-8">
            <CmsFieldGroup title="Actions">
              <LinkRepeater label="Quick Links" items={data.quick_links} onChange={(v) => setData({ ...data, quick_links: v })} max={8} disabled={!enabled} />
              <LinkRepeater label="Buttons" items={data.buttons} onChange={(v) => setData({ ...data, buttons: v })} max={3} disabled={!enabled} />
            </CmsFieldGroup>
          </FormSection>
        )}

        {activeTab === "payment" && (
          <FormSection className="space-y-8">
            <CmsFieldGroup title="Content">
              <div>
                <FormLabel>Title</FormLabel>
                <TextInput
                  value={data.payment.title}
                  onChange={(e) => setData({ ...data, payment: { ...data.payment, title: e.target.value } })}
                  className="mt-1"
                  disabled={!enabled}
                />
              </div>
            </CmsFieldGroup>
            <CmsFieldGroup title="Media">
              <CmsMultiImageLinesField
                label="Payment method icons"
                urlsText={data.payment.icons_urls}
                altsText={data.payment.icons_alts ?? ""}
                onUrlsTextChange={(v) => setData({ ...data, payment: { ...data.payment, icons_urls: v } })}
                onAltsTextChange={(v) => setData({ ...data, payment: { ...data.payment, icons_alts: v } })}
                slotCount={8}
                disabled={!enabled}
              />
            </CmsFieldGroup>
          </FormSection>
        )}

        {activeTab === "bottom" && (
          <FormSection className="space-y-8">
            <CmsFieldGroup title="Actions">
              <LinkRepeater label="Legal Links" items={data.legal_links} onChange={(v) => setData({ ...data, legal_links: v })} max={6} disabled={!enabled} />
            </CmsFieldGroup>
            <CmsFieldGroup title="Content">
              <div>
                <FormLabel>Copyright text</FormLabel>
                <TextInput
                  value={data.bottom.copyright}
                  onChange={(e) => setData({ ...data, bottom: { ...data.bottom, copyright: e.target.value } })}
                  className="mt-1"
                  disabled={!enabled}
                />
              </div>
            </CmsFieldGroup>
            <CmsFieldGroup title="Media">
              <CmsImageUploadField
                label="SSL badge"
                url={data.bottom.ssl_badge_url}
                alt=""
                showAlt={false}
                onUrlChange={(v) => setData({ ...data, bottom: { ...data.bottom, ssl_badge_url: v } })}
                onAltChange={() => {}}
                disabled={!enabled}
              />
            </CmsFieldGroup>
          </FormSection>
        )}
      </div>
    </div>
  );
}

function LinkRepeater({
  label,
  items,
  onChange,
  max,
  disabled,
}: {
  label: string;
  items: CmsFooterLink[];
  onChange: (v: CmsFooterLink[]) => void;
  max: number;
  disabled?: boolean;
}) {
  return (
    <div>
      <FormLabel>{label}</FormLabel>
      {items.map((link, i) => (
        <div key={i} className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-gray-200 p-3">
          <TextInput
            placeholder="Label"
            value={link.label}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...next[i], label: e.target.value };
              onChange(next);
            }}
            disabled={disabled}
          />
          <div className="flex gap-2">
            <TextInput
              placeholder="URL"
              value={link.url}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], url: e.target.value };
                onChange(next);
              }}
              className="flex-1"
              disabled={disabled}
            />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700 text-sm" disabled={disabled}>
              ✕
            </button>
          </div>
        </div>
      ))}
      {items.length < max && (
        <button type="button" onClick={() => onChange([...items, { label: "", url: "" }])} className="mt-2 text-sm text-slate-700 hover:underline disabled:opacity-50" disabled={disabled}>
          + Add {label.toLowerCase().replace(/s$/, "")}
        </button>
      )}
    </div>
  );
}
