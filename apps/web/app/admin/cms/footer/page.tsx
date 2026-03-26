"use client";

import { useEffect, useState } from "react";
import { FormSection, FormLabel, TextInput, Textarea } from "@/components/dashboard";
import { adminApi } from "@/lib/admin-api";
import type { CmsFooterData, CmsFooterLink } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

const emptyFooter: CmsFooterData = {
  brand: { logo_url: "", description: "" },
  quick_links: [],
  buttons: [],
  payment: { title: "", icons_urls: "" },
  legal_links: [],
  bottom: { copyright: "", ssl_badge_url: "" },
};

type Tab = "brand" | "links" | "payment" | "bottom";
const tabs: { key: Tab; label: string }[] = [
  { key: "brand", label: "Brand" },
  { key: "links", label: "Links & Buttons" },
  { key: "payment", label: "Payment Trust" },
  { key: "bottom", label: "Bottom Bar" },
];

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Footer</h1>
          <p className="mt-1 text-sm text-gray-500">Edit footer branding, links, payment icons, and legal text.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {message && (
        <div className={cn("rounded-lg px-4 py-3 text-sm", message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800")}>{message.text}</div>
      )}

      <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-gray-50 p-1">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={cn("flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors", activeTab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900")}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        {activeTab === "brand" && (
          <FormSection>
            <div>
              <FormLabel>Logo URL</FormLabel>
              <TextInput value={data.brand.logo_url} onChange={(e) => setData({ ...data, brand: { ...data.brand, logo_url: e.target.value } })} className="mt-1" />
            </div>
            <div>
              <FormLabel>Description</FormLabel>
              <Textarea value={data.brand.description} onChange={(e) => setData({ ...data, brand: { ...data.brand, description: e.target.value } })} rows={4} className="mt-1" />
            </div>
          </FormSection>
        )}

        {activeTab === "links" && (
          <FormSection>
            <LinkRepeater label="Quick Links" items={data.quick_links} onChange={(v) => setData({ ...data, quick_links: v })} max={8} />
            <LinkRepeater label="Buttons" items={data.buttons} onChange={(v) => setData({ ...data, buttons: v })} max={3} />
          </FormSection>
        )}

        {activeTab === "payment" && (
          <FormSection>
            <div>
              <FormLabel>Title</FormLabel>
              <TextInput value={data.payment.title} onChange={(e) => setData({ ...data, payment: { ...data.payment, title: e.target.value } })} className="mt-1" />
            </div>
            <div>
              <FormLabel>Payment icon URLs (one per line)</FormLabel>
              <Textarea value={data.payment.icons_urls} onChange={(e) => setData({ ...data, payment: { ...data.payment, icons_urls: e.target.value } })} rows={5} className="mt-1" />
            </div>
          </FormSection>
        )}

        {activeTab === "bottom" && (
          <FormSection>
            <LinkRepeater label="Legal Links" items={data.legal_links} onChange={(v) => setData({ ...data, legal_links: v })} max={6} />
            <div>
              <FormLabel>Copyright text</FormLabel>
              <TextInput value={data.bottom.copyright} onChange={(e) => setData({ ...data, bottom: { ...data.bottom, copyright: e.target.value } })} className="mt-1" />
            </div>
            <div>
              <FormLabel>SSL badge URL</FormLabel>
              <TextInput value={data.bottom.ssl_badge_url} onChange={(e) => setData({ ...data, bottom: { ...data.bottom, ssl_badge_url: e.target.value } })} className="mt-1" />
            </div>
          </FormSection>
        )}
      </div>
    </div>
  );
}

function LinkRepeater({ label, items, onChange, max }: { label: string; items: CmsFooterLink[]; onChange: (v: CmsFooterLink[]) => void; max: number }) {
  return (
    <div>
      <FormLabel>{label}</FormLabel>
      {items.map((link, i) => (
        <div key={i} className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-gray-200 p-3">
          <TextInput placeholder="Label" value={link.label} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], label: e.target.value }; onChange(next); }} />
          <div className="flex gap-2">
            <TextInput placeholder="URL" value={link.url} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], url: e.target.value }; onChange(next); }} className="flex-1" />
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700 text-sm">✕</button>
          </div>
        </div>
      ))}
      {items.length < max && (
        <button onClick={() => onChange([...items, { label: "", url: "" }])} className="mt-2 text-sm text-blue-600 hover:underline">+ Add {label.toLowerCase().replace(/s$/, "")}</button>
      )}
    </div>
  );
}
