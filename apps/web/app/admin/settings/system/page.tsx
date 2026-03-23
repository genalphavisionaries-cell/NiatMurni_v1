"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";

export default function AdminSettingsSystemPage() {
  const [activeTab, setActiveTab] = useState<"general" | "api_connections">("general");
  const [loading, setLoading] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingConnections, setSavingConnections] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [siteName, setSiteName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [themeColor, setThemeColor] = useState("#2563eb");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [gaMeasurementId, setGaMeasurementId] = useState("");
  const [gaServiceAccount, setGaServiceAccount] = useState("");
  const [stripePublishableKey, setStripePublishableKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState("");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const [settingsRes, apiConnectionsRes] = await Promise.all([
          adminApi.getSettings(),
          adminApi.getApiConnections(),
        ]);
        setSiteName(settingsRes.data.site_name ?? "");
        setLogoUrl(settingsRes.data.logo_url ?? "");
        setThemeColor(settingsRes.data.theme_color ?? "#2563eb");
        setSupportEmail(settingsRes.data.support_email ?? "");
        setSupportPhone(settingsRes.data.support_phone ?? "");
        setGaMeasurementId(apiConnectionsRes.data.google_analytics.measurement_id ?? "");
        setGaServiceAccount(apiConnectionsRes.data.google_analytics.service_account ?? "");
        setStripePublishableKey(apiConnectionsRes.data.stripe.publishable_key ?? "");
        setStripeSecretKey(apiConnectionsRes.data.stripe.secret_key ?? "");
        setStripeWebhookSecret(apiConnectionsRes.data.stripe.webhook_secret ?? "");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  const onSubmitGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSavingGeneral(true);
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
      setSuccess("General settings saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSavingGeneral(false);
    }
  };

  const onSubmitApiConnections = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSavingConnections(true);
    try {
      const res = await adminApi.updateApiConnections({
        google_analytics: {
          measurement_id: gaMeasurementId,
          service_account: gaServiceAccount,
        },
        stripe: {
          publishable_key: stripePublishableKey,
          secret_key: stripeSecretKey,
          webhook_secret: stripeWebhookSecret,
        },
      });
      setGaMeasurementId(res.data.google_analytics.measurement_id ?? "");
      setGaServiceAccount(res.data.google_analytics.service_account ?? "");
      setStripePublishableKey(res.data.stripe.publishable_key ?? "");
      setStripeSecretKey(res.data.stripe.secret_key ?? "");
      setStripeWebhookSecret(res.data.stripe.webhook_secret ?? "");
      setSuccess("API connections saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save API connections");
    } finally {
      setSavingConnections(false);
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

      <div className="rounded-xl border border-[var(--border)] bg-white p-2 shadow-sm">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${activeTab === "general" ? "bg-[var(--primary)] text-white" : "text-gray-700 hover:bg-gray-100"}`}
          >
            General
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("api_connections")}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${activeTab === "api_connections" ? "bg-[var(--primary)] text-white" : "text-gray-700 hover:bg-gray-100"}`}
          >
            API Connections
          </button>
        </div>
      </div>

      {activeTab === "general" ? (
        <form onSubmit={onSubmitGeneral} className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-4">
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
            disabled={savingGeneral}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {savingGeneral ? "Saving…" : "Save settings"}
          </button>
        </form>
      ) : (
        <form onSubmit={onSubmitApiConnections} className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Google Analytics Measurement ID</label>
            <input
              type="text"
              value={gaMeasurementId}
              onChange={(e) => setGaMeasurementId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="G-XXXXXXXXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Google Analytics Service Account JSON</label>
            <textarea
              value={gaServiceAccount}
              onChange={(e) => setGaServiceAccount(e.target.value)}
              className="mt-1 min-h-[140px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder='{"type":"service_account",...}'
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Stripe Publishable Key</label>
              <input
                type="text"
                value={stripePublishableKey}
                onChange={(e) => setStripePublishableKey(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="pk_live_..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stripe Secret Key</label>
              <input
                type="text"
                value={stripeSecretKey}
                onChange={(e) => setStripeSecretKey(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="sk_live_..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Stripe Webhook Secret</label>
            <input
              type="text"
              value={stripeWebhookSecret}
              onChange={(e) => setStripeWebhookSecret(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="whsec_..."
            />
          </div>

          <button
            type="submit"
            disabled={savingConnections}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {savingConnections ? "Saving…" : "Save API connections"}
          </button>
        </form>
      )}
    </div>
  );
}
