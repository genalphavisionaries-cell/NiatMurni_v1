"use client";

import { useState } from "react";
import { FormSection, FormLabel, TextInput, Textarea } from "@/components/dashboard";
import { adminApi } from "@/lib/admin-api";
import type { HomepageSettings } from "@/lib/homepage-settings";
import { defaultHomepageSettings } from "@/lib/homepage-settings";
import { cn } from "@/lib/utils";

type Props = { initial: HomepageSettings | null };

function getInitial(s: HomepageSettings | null): HomepageSettings {
  if (s && typeof s === "object") return { ...defaultHomepageSettings, ...s };
  return defaultHomepageSettings;
}

/** Convert frontend HomepageSettings shape to backend snake_case payload */
function toBackendPayload(s: HomepageSettings): Record<string, unknown> {
  return {
    site_name: s.siteName,
    logo_url: s.logoUrl ?? undefined,
    logo_alt: s.logoAlt,
    header_nav: s.headerNav,
    footer_columns: s.footerColumns,
    footer_bottom: s.footerBottom,
    footer_logo_url: s.footerLogoUrl ?? undefined,
    footer_description: s.footerDescription ?? "",
    footer_ssl_badge_url: s.footerSslBadgeUrl ?? undefined,
    payment_method_icons: s.paymentMethodIcons ?? undefined,
    hero: s.hero,
    main_banners: s.mainBanners,
    why_choose: {
      title: s.whyChoose.title,
      subtitle: s.whyChoose.subtitle,
      image: s.whyChoose.image ?? undefined,
      benefits: s.whyChoose.benefits,
    },
    social_proof: {
      title: s.socialProof.title,
      subtitle: s.socialProof.subtitle,
      google_rating: s.socialProof.google_rating,
      review_count: s.socialProof.review_count,
      brand_logos: s.socialProof.brand_logos,
      testimonials: s.socialProof.testimonials,
    },
  };
}

export function CmsHomepageClient({ initial }: Props) {
  const [form, setForm] = useState<HomepageSettings>(() => getInitial(initial));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const update = <K extends keyof HomepageSettings>(key: K, value: HomepageSettings[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateHero = <K extends keyof HomepageSettings["hero"]>(key: K, value: HomepageSettings["hero"][K]) => {
    setForm((prev) => ({ ...prev, hero: { ...prev.hero, [key]: value } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const payload = toBackendPayload(form);
      await adminApi.updateHomepageSettings(payload);
      setMessage({ type: "success", text: "Homepage settings saved." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save." });
    } finally {
      setSaving(false);
    }
  };

  const s = form as HomepageSettings;
  const hero = s?.hero ?? { headline: "", subheadline: "", ctaText: "", ctaHref: "", backgroundImageUrl: null, overlayOpacity: 0.4 };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Homepage</h1>
        <p className="mt-1 text-sm text-gray-500">Edit site branding, hero, and footer. Changes appear on the public homepage.</p>
      </div>

      {message && (
        <div
          className={cn(
            "rounded-lg px-4 py-3 text-sm",
            message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          )}
        >
          {message.text}
        </div>
      )}

      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <FormSection>
          <div>
            <FormLabel>Site name</FormLabel>
            <TextInput
              value={s?.siteName ?? ""}
              onChange={(e) => update("siteName", e.target.value)}
              placeholder="Niat Murni Academy"
              className="mt-1"
            />
          </div>
          <div>
            <FormLabel>Logo URL</FormLabel>
            <TextInput
              value={s?.logoUrl ?? ""}
              onChange={(e) => update("logoUrl", e.target.value || null)}
              placeholder="https://… or path"
              className="mt-1"
            />
          </div>
          <div>
            <FormLabel>Logo alt text</FormLabel>
            <TextInput
              value={s?.logoAlt ?? ""}
              onChange={(e) => update("logoAlt", e.target.value)}
              placeholder="Niat Murni Academy"
              className="mt-1"
            />
          </div>
        </FormSection>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-gray-900">Hero section</h2>
        <FormSection className="mt-4">
          <div>
            <FormLabel>Headline</FormLabel>
            <TextInput
              value={hero.headline}
              onChange={(e) => updateHero("headline", e.target.value)}
              placeholder="Professional Food Safety Training"
              className="mt-1"
            />
          </div>
          <div>
            <FormLabel>Subheadline</FormLabel>
            <Textarea
              value={hero.subheadline}
              onChange={(e) => updateHero("subheadline", e.target.value)}
              placeholder="KKM-recognised courses…"
              rows={2}
              className="mt-1"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FormLabel>CTA button text</FormLabel>
              <TextInput
                value={hero.ctaText}
                onChange={(e) => updateHero("ctaText", e.target.value)}
                placeholder="View Upcoming Classes"
                className="mt-1"
              />
            </div>
            <div>
              <FormLabel>CTA button link</FormLabel>
              <TextInput
                value={hero.ctaHref}
                onChange={(e) => updateHero("ctaHref", e.target.value)}
                placeholder="#classes"
                className="mt-1"
              />
            </div>
          </div>
        </FormSection>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-gray-900">Footer</h2>
        <FormSection className="mt-4">
          <div>
            <FormLabel>Footer bottom text</FormLabel>
            <TextInput
              value={s?.footerBottom ?? ""}
              onChange={(e) => update("footerBottom", e.target.value)}
              placeholder="© Niat Murni Academy."
              className="mt-1"
            />
          </div>
          <div>
            <FormLabel>Footer description</FormLabel>
            <Textarea
              value={s?.footerDescription ?? ""}
              onChange={(e) => update("footerDescription", e.target.value)}
              placeholder="Short description"
              rows={2}
              className="mt-1"
            />
          </div>
        </FormSection>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
