"use client";

import { useEffect, useState } from "react";
import { FormSection, FormLabel, TextInput } from "@/components/dashboard";
import { adminApi } from "@/lib/admin-api";
import type { CmsTrustData, CmsTrustLogo } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

const emptyTrust: CmsTrustData = { logos: [], google_rating_text: "", google_button_label: "", google_button_url: "" };

export default function AdminCmsLogosPage() {
  const [data, setData] = useState<CmsTrustData>(emptyTrust);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    adminApi
      .getCmsHomepage()
      .then((res) => setData({ ...emptyTrust, ...res.data.trust }))
      .catch(() => setMessage({ type: "error", text: "Failed to load trust data." }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setMessage(null);
    setSaving(true);
    try {
      await adminApi.updateCmsHomepage({ trust: data } as never);
      setMessage({ type: "success", text: "Logos & trust saved." });
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
          <h1 className="text-2xl font-semibold text-gray-900">Logos & Trust</h1>
          <p className="mt-1 text-sm text-gray-500">Manage partner logos and Google rating shown on the homepage.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {message && (
        <div className={cn("rounded-lg px-4 py-3 text-sm", message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800")}>{message.text}</div>
      )}

      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <FormSection>
          <div>
            <FormLabel>Partner Logos (max 10)</FormLabel>
            {data.logos.map((logo, i) => (
              <div key={i} className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-gray-200 p-3">
                <TextInput placeholder="Image URL" value={logo.image_url} onChange={(e) => { const next = [...data.logos]; next[i] = { ...next[i], image_url: e.target.value }; setData({ ...data, logos: next }); }} />
                <div className="flex gap-2">
                  <TextInput placeholder="Alt text / title" value={logo.title} onChange={(e) => { const next = [...data.logos]; next[i] = { ...next[i], title: e.target.value }; setData({ ...data, logos: next }); }} className="flex-1" />
                  <button onClick={() => setData({ ...data, logos: data.logos.filter((_, j) => j !== i) })} className="text-red-500 hover:text-red-700 text-sm">✕</button>
                </div>
              </div>
            ))}
            {data.logos.length < 10 && (
              <button onClick={() => setData({ ...data, logos: [...data.logos, { image_url: "", title: "" }] })} className="mt-2 text-sm text-blue-600 hover:underline">+ Add logo</button>
            )}
          </div>
        </FormSection>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Google Rating</h2>
        <FormSection>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <FormLabel>Rating text</FormLabel>
              <TextInput value={data.google_rating_text} onChange={(e) => setData({ ...data, google_rating_text: e.target.value })} className="mt-1" />
            </div>
            <div>
              <FormLabel>Button label</FormLabel>
              <TextInput value={data.google_button_label} onChange={(e) => setData({ ...data, google_button_label: e.target.value })} className="mt-1" />
            </div>
            <div>
              <FormLabel>Button URL</FormLabel>
              <TextInput value={data.google_button_url} onChange={(e) => setData({ ...data, google_button_url: e.target.value })} className="mt-1" />
            </div>
          </div>
        </FormSection>
      </div>
    </div>
  );
}
