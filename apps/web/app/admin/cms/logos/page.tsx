"use client";

import { useEffect, useState } from "react";
import { FormSection, FormLabel, TextInput } from "@/components/dashboard";
import { adminApi } from "@/lib/admin-api";
import type { CmsTrustData } from "@/lib/admin-api";
import { cn } from "@/lib/utils";
import { isValidHttpOrRelativeUrl } from "@/lib/cms-admin-validation";
import { CmsFieldGroup } from "@/components/admin/cms/CmsFieldGroup";
import { SectionEnabledSwitch } from "@/components/admin/cms/SectionEnabledSwitch";
import { CmsImageUploadField } from "@/components/admin/cms/CmsImageUploadField";

const emptyTrust: CmsTrustData = {
  logos: [],
  google_rating_text: "",
  google_button_label: "",
  google_button_url: "",
  enabled: true,
};

function validateTrust(d: CmsTrustData): string[] {
  const e: string[] = [];
  for (const logo of d.logos) {
    if (logo.image_url?.trim() && !isValidHttpOrRelativeUrl(logo.image_url)) {
      e.push("Trust: a logo image URL is invalid.");
      break;
    }
  }
  if (d.google_button_url?.trim() && !isValidHttpOrRelativeUrl(d.google_button_url)) {
    e.push("Trust: Google button URL is invalid.");
  }
  return e;
}

export default function AdminCmsLogosPage() {
  const [data, setData] = useState<CmsTrustData>(emptyTrust);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    adminApi
      .getCmsHomepage()
      .then((res) => {
        const t = res.data.testimonials ?? res.data.trust;
        setData({
          ...emptyTrust,
          ...t,
          logos: (t?.logos ?? []).map((l) => ({
            image_url: l.image_url ?? "",
            title: l.title ?? "",
            image_alt: l.image_alt ?? "",
          })),
        });
      })
      .catch(() => setMessage({ type: "error", text: "Failed to load trust data." }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setMessage(null);
    const errs = validateTrust(data);
    if (errs.length) {
      setMessage({ type: "error", text: errs.join(" ") });
      return;
    }
    setSaving(true);
    try {
      await adminApi.updateCmsHomepage({ testimonials: data } as never);
      setMessage({ type: "success", text: "Logos & trust saved." });
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
          <h1 className="text-2xl font-semibold text-gray-900">Logos & Trust</h1>
          <p className="mt-1 text-sm text-gray-500">Manage partner logos and Google rating shown on the homepage.</p>
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

      <SectionEnabledSwitch enabled={enabled} onChange={(v) => setData({ ...data, enabled: v })} label="Show trust / logos section on the site" />

      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <FormSection className="space-y-8">
          <CmsFieldGroup title="Media">
            <FormLabel>Partner logos (max 10)</FormLabel>
            {data.logos.map((logo, i) => (
              <div key={i} className="mt-4 space-y-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">Logo {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => setData({ ...data, logos: data.logos.filter((_, j) => j !== i) })}
                    className="text-sm text-red-500 hover:text-red-700"
                    disabled={!enabled}
                  >
                    Remove
                  </button>
                </div>
                <CmsImageUploadField
                  label="Image"
                  url={logo.image_url}
                  alt={logo.image_alt ?? ""}
                  onUrlChange={(v) => {
                    const next = [...data.logos];
                    next[i] = { ...next[i], image_url: v };
                    setData({ ...data, logos: next });
                  }}
                  onAltChange={(v) => {
                    const next = [...data.logos];
                    next[i] = { ...next[i], image_alt: v };
                    setData({ ...data, logos: next });
                  }}
                  disabled={!enabled}
                />
                <div>
                  <FormLabel>Partner / brand name</FormLabel>
                  <TextInput
                    value={logo.title}
                    onChange={(e) => {
                      const next = [...data.logos];
                      next[i] = { ...next[i], title: e.target.value };
                      setData({ ...data, logos: next });
                    }}
                    className="mt-1"
                    placeholder="Shown next to or under the logo"
                    disabled={!enabled}
                  />
                </div>
              </div>
            ))}
            {data.logos.length < 10 && (
              <button
                type="button"
                onClick={() => setData({ ...data, logos: [...data.logos, { image_url: "", title: "", image_alt: "" }] })}
                disabled={!enabled}
                className="mt-2 text-sm font-medium text-blue-600 hover:underline disabled:opacity-50"
              >
                + Add logo
              </button>
            )}
          </CmsFieldGroup>
        </FormSection>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Google Rating</h2>
        <FormSection className="space-y-6">
          <CmsFieldGroup title="Content">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <FormLabel>Rating text</FormLabel>
                <TextInput
                  value={data.google_rating_text}
                  onChange={(e) => setData({ ...data, google_rating_text: e.target.value })}
                  className="mt-1"
                  disabled={!enabled}
                />
              </div>
              <div>
                <FormLabel>Button label</FormLabel>
                <TextInput
                  value={data.google_button_label}
                  onChange={(e) => setData({ ...data, google_button_label: e.target.value })}
                  className="mt-1"
                  disabled={!enabled}
                />
              </div>
              <div>
                <FormLabel>Button URL</FormLabel>
                <TextInput
                  value={data.google_button_url}
                  onChange={(e) => setData({ ...data, google_button_url: e.target.value })}
                  className="mt-1"
                  disabled={!enabled}
                />
              </div>
            </div>
          </CmsFieldGroup>
        </FormSection>
      </div>
    </div>
  );
}
