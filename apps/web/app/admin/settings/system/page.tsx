"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";

export default function AdminSettingsSystemPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [siteName, setSiteName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [themeColor, setThemeColor] = useState("#2563eb");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminApi.getSettings();
        setSiteName(res.data.site_name ?? "");
        setLogoUrl(res.data.logo_url ?? "");
        setThemeColor(res.data.theme_color ?? "#2563eb");
        setSupportEmail(res.data.support_email ?? "");
        setSupportPhone(res.data.support_phone ?? "");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const form = new FormData();
      form.set("site_name", siteName);
      form.set("logo_url", logoUrl);
      form.set("theme_color", themeColor);
      form.set("support_email", supportEmail);
      form.set("support_phone", supportPhone);
      if (logoFile) form.set("logo", logoFile);
      const res = await adminApi.updateSettings(form);
      setSiteName(res.data.site_name ?? "");
      setLogoUrl(res.data.logo_url ?? "");
      setThemeColor(res.data.theme_color ?? "#2563eb");
      setSupportEmail(res.data.support_email ?? "");
      setSupportPhone(res.data.support_phone ?? "");
      setLogoFile(null);
      setSuccess("System settings saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-8 text-center text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">System</h1>
        <p className="mt-1 text-sm text-gray-500">System configuration</p>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      {success && <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</div>}

      <form onSubmit={onSubmit} className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Site name</label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Logo URL</label>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Logo upload</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">Upload replaces Logo URL after save.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Theme color</label>
            <input
              type="color"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-gray-300 px-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Support phone</label>
            <input
              type="text"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="+60..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Support email</label>
          <input
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="support@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
      </form>
    </div>
  );
}
