"use client";

import { useEffect, useState } from "react";
import { FormLabel, FormSection, TextInput, Textarea } from "@/components/dashboard";
import { adminApi } from "@/lib/admin-api";
import type { CmsHeroData, CmsUspData, CmsClassesData, CmsPromoData, CmsPromoCard, CmsUspPoint } from "@/lib/admin-api";
import { cn } from "@/lib/utils";
import { hasRichText, isValidHttpOrRelativeUrl } from "@/lib/cms-admin-validation";
import { safeTrim, hasNonEmptyString, splitAndTrimLines } from "@/lib/safe-string-utils";
import { CmsFieldGroup } from "@/components/admin/cms/CmsFieldGroup";
import { SectionEnabledSwitch } from "@/components/admin/cms/SectionEnabledSwitch";
import { CmsRichTextField } from "@/components/admin/cms/CmsRichTextField";
import { CmsImageUploadField } from "@/components/admin/cms/CmsImageUploadField";
import { CmsMultiImageLinesField } from "@/components/admin/cms/CmsMultiImageLinesField";
import { CmsColorField } from "@/components/admin/cms/CmsColorField";

type Tab = "hero" | "why_choose_us" | "classes" | "cta";
type HomepageSavePayload = {
  hero: CmsHeroData;
  why_choose_us: CmsUspData;
  classes: CmsClassesData;
  cta: CmsPromoData;
};

const tabs: { key: Tab; label: string }[] = [
  { key: "hero", label: "Hero" },
  { key: "why_choose_us", label: "Why choose us" },
  { key: "classes", label: "Classes" },
  { key: "cta", label: "CTA" },
];

const emptyHero: CmsHeroData = {
  headline: "",
  subheadline: "",
  buttons: [],
  background_urls: "",
  background_alts: "",
  accent_color: "",
  enabled: true,
};

const emptyUsp: CmsUspData = {
  title: "",
  description: "",
  points: [],
  side_images_urls: "",
  side_images_alts: "",
  accent_color: "",
  enabled: true,
};

const emptyClasses: CmsClassesData = {
  title: "",
  description: "",
  button_text: "",
  button_url: "",
  max_items: 20,
  accent_color: "",
  enabled: true,
};

const emptyPromo: CmsPromoData = {
  title: "",
  description: "",
  banner_urls: "",
  banner_alts: "",
  accent_color: "",
  cards: [],
  enabled: true,
};

function emptyPromoCard(): CmsPromoCard {
  return {
    image_url: "",
    title: "",
    description: "",
    button_label: "",
    url: "",
    card_color: "",
    image_alt: "",
  };
}

function emptyUspPoint(): CmsUspPoint {
  return { icon: "", title: "", description: "", background_color: "", icon_alt: "" };
}

function firstNullSaveField(payload: HomepageSavePayload): string | null {
  const direct: Array<[string, unknown]> = [
    ["hero.headline", payload.hero.headline],
    ["hero.subheadline", payload.hero.subheadline],
    ["why_choose_us.title", payload.why_choose_us.title],
    ["why_choose_us.description", payload.why_choose_us.description],
    ["classes.title", payload.classes.title],
    ["classes.description", payload.classes.description],
    ["classes.button_text", payload.classes.button_text],
    ["classes.button_url", payload.classes.button_url],
    ["cta.title", payload.cta.title],
    ["cta.description", payload.cta.description],
  ];
  for (const [path, value] of direct) {
    if (value === null) return path;
  }
  for (let i = 0; i < payload.why_choose_us.points.length; i++) {
    const p = payload.why_choose_us.points[i];
    if (p?.description === null) return `why_choose_us.points[${i}].description`;
    if (p?.title === null) return `why_choose_us.points[${i}].title`;
    if (p?.icon === null) return `why_choose_us.points[${i}].icon`;
  }
  for (let i = 0; i < payload.cta.cards.length; i++) {
    const c = payload.cta.cards[i];
    if (c?.description === null) return `cta.cards[${i}].description`;
    if (c?.title === null) return `cta.cards[${i}].title`;
    if (c?.image_url === null) return `cta.cards[${i}].image_url`;
    if (c?.url === null) return `cta.cards[${i}].url`;
  }
  return null;
}

function validateHomepage(
  hero: CmsHeroData,
  whyChooseUs: CmsUspData,
  classes: CmsClassesData,
  ctaSection: CmsPromoData
): string[] {
  const errors: string[] = [];

  const heroOn = hero.enabled !== false;
  if (heroOn) {
    if (!hasRichText(safeTrim(hero.headline))) {
      errors.push("Hero: headline is required when this section is enabled.");
    }
    const bgLines = splitAndTrimLines(hero.background_urls);
    for (const line of bgLines) {
      if (!isValidHttpOrRelativeUrl(line)) {
        errors.push("Hero: optional image URL is invalid. Leave empty or use a valid URL.");
        break;
      }
    }
    for (const b of hero.buttons) {
      if (safeTrim(b.url) && !isValidHttpOrRelativeUrl(b.url)) {
        errors.push("Hero: a button has an invalid URL.");
        break;
      }
    }
  }

  const whyOn = whyChooseUs.enabled !== false;
  if (whyOn) {
    if (!hasRichText(safeTrim(whyChooseUs.title))) {
      errors.push("Why choose us: title is required when this section is enabled.");
    }
    for (const line of splitAndTrimLines(whyChooseUs.side_images_urls)) {
      if (!isValidHttpOrRelativeUrl(line)) {
        errors.push("Why choose us: optional side image URL is invalid. Leave empty or use a valid URL.");
        break;
      }
    }
  }
  if (whyOn) {
    whyChooseUs.points.forEach((p, i) => {
      const hasAnyContent =
        safeTrim(p.icon) !== "" ||
        hasNonEmptyString(p.title) ||
        hasRichText(safeTrim(p.description)) ||
        safeTrim(p.background_color) !== "" ||
        safeTrim(p.icon_alt) !== "";
      if (!hasAnyContent) {
        return;
      }
      if (!hasNonEmptyString(p.title)) {
        errors.push(`Why choose us card ${i + 1}: title is required when this card has content.`);
      }
      if (safeTrim(p.icon) && !isValidHttpOrRelativeUrl(p.icon)) {
        errors.push(
          `Why choose us card ${i + 1}: optional image URL is invalid. Optional: provide image URL if needed, or leave empty.`
        );
      }
    });
  }

  const classesOn = classes.enabled !== false;
  if (classesOn) {
    if (!safeTrim(classes.title)) {
      errors.push("Classes: title is required when this section is enabled.");
    }
    if (safeTrim(classes.button_url) && !isValidHttpOrRelativeUrl(classes.button_url)) {
      errors.push("Classes: button URL is invalid.");
    }
  }

  const ctaOn = ctaSection.enabled !== false;
  if (ctaOn) {
    if (!hasRichText(safeTrim(ctaSection.title))) {
      errors.push("CTA: title is required when this section is enabled.");
    }
    const bannerLines = splitAndTrimLines(ctaSection.banner_urls);
    for (const line of bannerLines) {
      if (!isValidHttpOrRelativeUrl(line)) {
        errors.push("CTA: optional banner image URL is invalid. Leave empty or use a valid URL.");
        break;
      }
    }
  }
  if (ctaOn) {
    ctaSection.cards.forEach((c, i) => {
      const hasAnyContent =
        safeTrim(c.image_url) !== "" ||
        hasNonEmptyString(c.title) ||
        hasRichText(safeTrim(c.description)) ||
        hasNonEmptyString(c.button_label) ||
        hasNonEmptyString(c.url);
      if (!hasAnyContent) {
        return;
      }
      if (!hasNonEmptyString(c.title)) {
        errors.push(`CTA card ${i + 1}: title is required when this card has content.`);
      }
      if (safeTrim(c.image_url) && !isValidHttpOrRelativeUrl(c.image_url)) {
        errors.push(
          `CTA card ${i + 1}: optional image URL is invalid. Optional: provide image URL if needed, or leave empty.`
        );
      }
      if (safeTrim(c.url) && !isValidHttpOrRelativeUrl(c.url)) {
        errors.push(`CTA card ${i + 1}: link URL is invalid.`);
      }
    });
  }

  return errors;
}

export function CmsHomepageClient() {
  const [activeTab, setActiveTab] = useState<Tab>("hero");
  const [hero, setHero] = useState<CmsHeroData>(emptyHero);
  const [whyChooseUs, setWhyChooseUs] = useState<CmsUspData>(emptyUsp);
  const [classes, setClasses] = useState<CmsClassesData>(emptyClasses);
  const [ctaSection, setCtaSection] = useState<CmsPromoData>(emptyPromo);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    adminApi
      .getCmsHomepage()
      .then((res) => {
        const d = res.data;
        const w = d.why_choose_us ?? d.usp;
        const c = d.cta ?? d.promo;
        setHero({ ...emptyHero, ...d.hero });
        setWhyChooseUs({
          ...emptyUsp,
          ...w,
          points: w?.points?.length ? w.points.map((p) => ({ ...emptyUspPoint(), ...p })) : [],
        });
        setClasses({ ...emptyClasses, ...d.classes });
        setCtaSection({
          ...emptyPromo,
          ...c,
          cards: c?.cards?.length ? c.cards.map((x) => ({ ...emptyPromoCard(), ...x })) : [],
        });
      })
      .catch(() => setMessage({ type: "error", text: "Failed to load CMS data." }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setMessage(null);
    const payload: HomepageSavePayload = { hero, why_choose_us: whyChooseUs, classes, cta: ctaSection };
    if (process.env.NODE_ENV === "development") {
      console.log("DEBUG SAVE PAYLOAD:", payload);
      const nullField = firstNullSaveField(payload);
      if (nullField) {
        console.error("CMS SAVE NULL FIELD:", nullField);
      }
    }
    const errs = validateHomepage(payload.hero, payload.why_choose_us, payload.classes, payload.cta);
    if (errs.length) {
      setMessage({ type: "error", text: errs.join(" ") });
      return;
    }
    setSaving(true);
    try {
      await adminApi.updateCmsHomepage(payload);
      setMessage({ type: "success", text: "Homepage saved." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Save failed." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-sm text-gray-500">Loading CMS data…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Homepage</h1>
          <p className="mt-1 text-sm text-gray-500">Edit homepage sections. Changes appear on the public site.</p>
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
        <div className={cn("rounded-lg px-4 py-3 text-sm", message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800")}>
          {message.text}
        </div>
      )}

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
        {activeTab === "hero" && <HeroTab data={hero} onChange={setHero} />}
        {activeTab === "why_choose_us" && <UspTab data={whyChooseUs} onChange={setWhyChooseUs} />}
        {activeTab === "classes" && <ClassesTab data={classes} onChange={setClasses} />}
        {activeTab === "cta" && <PromoTab data={ctaSection} onChange={setCtaSection} />}
      </div>
    </div>
  );
}

function HeroTab({ data, onChange }: { data: CmsHeroData; onChange: (d: CmsHeroData) => void }) {
  const set = <K extends keyof CmsHeroData>(k: K, v: CmsHeroData[K]) => onChange({ ...data, [k]: v });
  const enabled = data.enabled !== false;

  return (
    <FormSection className="space-y-8">
      <SectionEnabledSwitch enabled={enabled} onChange={(v) => set("enabled", v)} />
      <CmsFieldGroup title="Content">
        <CmsRichTextField label="Headline" value={data.headline} onChange={(v) => set("headline", v)} placeholder="Main hero headline" disabled={!enabled} />
        <CmsRichTextField label="Sub-headline" value={data.subheadline} onChange={(v) => set("subheadline", v)} placeholder="Supporting text" disabled={!enabled} />
      </CmsFieldGroup>
      <CmsFieldGroup title="Actions">
        <RepeaterButtons items={data.buttons} onChange={(b) => set("buttons", b)} disabled={!enabled} />
      </CmsFieldGroup>
      <CmsFieldGroup title="Media">
        <CmsMultiImageLinesField
          label="Background images"
          urlsText={data.background_urls}
          altsText={data.background_alts ?? ""}
          onUrlsTextChange={(v) => set("background_urls", v)}
          onAltsTextChange={(v) => set("background_alts", v)}
          slotCount={5}
          disabled={!enabled}
        />
      </CmsFieldGroup>
      <CmsFieldGroup title="Styling">
        <CmsColorField label="Section accent" value={data.accent_color ?? ""} onChange={(v) => set("accent_color", v)} />
      </CmsFieldGroup>
    </FormSection>
  );
}

function UspTab({ data, onChange }: { data: CmsUspData; onChange: (d: CmsUspData) => void }) {
  const set = <K extends keyof CmsUspData>(k: K, v: CmsUspData[K]) => onChange({ ...data, [k]: v });
  const enabled = data.enabled !== false;

  return (
    <FormSection className="space-y-8">
      <SectionEnabledSwitch enabled={enabled} onChange={(v) => set("enabled", v)} />
      <CmsFieldGroup title="Content">
        <CmsRichTextField label="Title" value={data.title} onChange={(v) => set("title", v)} disabled={!enabled} />
        <CmsRichTextField label="Description" value={data.description} onChange={(v) => set("description", v)} disabled={!enabled} />
      </CmsFieldGroup>
      <CmsFieldGroup title="USP cards (max 4)">
        {data.points.map((p, i) => (
          <div key={i} className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-gray-800">Card {i + 1}</span>
              <button
                type="button"
                onClick={() => set("points", data.points.filter((_, j) => j !== i))}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
            <CmsImageUploadField
              label="Icon / image"
              url={p.icon}
              alt={p.icon_alt ?? ""}
              onUrlChange={(v) => {
                const pts = [...data.points];
                pts[i] = { ...pts[i], icon: v };
                set("points", pts);
              }}
              onAltChange={(v) => {
                const pts = [...data.points];
                pts[i] = { ...pts[i], icon_alt: v };
                set("points", pts);
              }}
              disabled={!enabled}
            />
            <div>
              <FormLabel>Title</FormLabel>
              <TextInput
                value={p.title}
                onChange={(e) => {
                  const pts = [...data.points];
                  pts[i] = { ...pts[i], title: e.target.value };
                  set("points", pts);
                }}
                className="mt-1"
                disabled={!enabled}
              />
            </div>
            <CmsRichTextField
              label="Description"
              value={p.description}
              onChange={(v) => {
                const pts = [...data.points];
                pts[i] = { ...pts[i], description: v };
                set("points", pts);
              }}
              minHeight="100px"
              disabled={!enabled}
            />
            <CmsColorField
              label="Card background"
              value={p.background_color ?? ""}
              onChange={(v) => {
                const pts = [...data.points];
                pts[i] = { ...pts[i], background_color: v };
                set("points", pts);
              }}
            />
          </div>
        ))}
        {data.points.length < 4 && (
          <button
            type="button"
            onClick={() => set("points", [...data.points, emptyUspPoint()])}
            disabled={!enabled}
            className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50"
          >
            + Add USP card
          </button>
        )}
      </CmsFieldGroup>
      <CmsFieldGroup title="Media">
        <CmsMultiImageLinesField
          label="Side images"
          urlsText={data.side_images_urls}
          altsText={data.side_images_alts ?? ""}
          onUrlsTextChange={(v) => set("side_images_urls", v)}
          onAltsTextChange={(v) => set("side_images_alts", v)}
          slotCount={6}
          disabled={!enabled}
        />
      </CmsFieldGroup>
      <CmsFieldGroup title="Styling">
        <CmsColorField label="Section accent" value={data.accent_color ?? ""} onChange={(v) => set("accent_color", v)} />
      </CmsFieldGroup>
    </FormSection>
  );
}

function ClassesTab({ data, onChange }: { data: CmsClassesData; onChange: (d: CmsClassesData) => void }) {
  const set = <K extends keyof CmsClassesData>(k: K, v: CmsClassesData[K]) => onChange({ ...data, [k]: v });
  const enabled = data.enabled !== false;

  return (
    <FormSection className="space-y-8">
      <SectionEnabledSwitch enabled={enabled} onChange={(v) => set("enabled", v)} />
      <CmsFieldGroup title="Content">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FormLabel>Title</FormLabel>
            <TextInput value={data.title} onChange={(e) => set("title", e.target.value)} className="mt-1" disabled={!enabled} />
          </div>
          <div>
            <FormLabel>Max items shown</FormLabel>
            <TextInput
              type="number"
              value={data.max_items}
              onChange={(e) => set("max_items", Number(e.target.value) || 20)}
              className="mt-1"
              disabled={!enabled}
            />
          </div>
        </div>
        <div>
          <FormLabel>Description</FormLabel>
          <Textarea value={data.description} onChange={(e) => set("description", e.target.value)} rows={3} className="mt-1" disabled={!enabled} />
        </div>
      </CmsFieldGroup>
      <CmsFieldGroup title="Actions">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FormLabel>Button text</FormLabel>
            <TextInput value={data.button_text} onChange={(e) => set("button_text", e.target.value)} className="mt-1" disabled={!enabled} />
          </div>
          <div>
            <FormLabel>Button URL</FormLabel>
            <TextInput value={data.button_url} onChange={(e) => set("button_url", e.target.value)} className="mt-1" disabled={!enabled} placeholder="/classes or https://…" />
          </div>
        </div>
        <p className="text-sm text-gray-500">Class listings are loaded dynamically from the API.</p>
      </CmsFieldGroup>
      <CmsFieldGroup title="Styling">
        <CmsColorField label="Section accent" value={data.accent_color ?? ""} onChange={(v) => set("accent_color", v)} />
      </CmsFieldGroup>
    </FormSection>
  );
}

function PromoTab({ data, onChange }: { data: CmsPromoData; onChange: (d: CmsPromoData) => void }) {
  const set = <K extends keyof CmsPromoData>(k: K, v: CmsPromoData[K]) => onChange({ ...data, [k]: v });
  const enabled = data.enabled !== false;

  return (
    <FormSection className="space-y-8">
      <SectionEnabledSwitch enabled={enabled} onChange={(v) => set("enabled", v)} />
      <CmsFieldGroup title="Content">
        <CmsRichTextField label="Title" value={data.title} onChange={(v) => set("title", v)} disabled={!enabled} />
        <CmsRichTextField label="Description" value={data.description} onChange={(v) => set("description", v)} disabled={!enabled} />
      </CmsFieldGroup>
      <CmsFieldGroup title="Media">
        <CmsMultiImageLinesField
          label="Banner images"
          urlsText={data.banner_urls}
          altsText={data.banner_alts ?? ""}
          onUrlsTextChange={(v) => set("banner_urls", v)}
          onAltsTextChange={(v) => set("banner_alts", v)}
          slotCount={3}
          disabled={!enabled}
        />
      </CmsFieldGroup>
      <CmsFieldGroup title="Promo cards (max 3)">
        {data.cards.map((c, i) => (
          <div key={i} className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800">Card {i + 1}</span>
              <button type="button" onClick={() => set("cards", data.cards.filter((_, j) => j !== i))} className="text-sm text-red-500 hover:text-red-700">
                Remove
              </button>
            </div>
            <CmsImageUploadField
              label="Card image"
              url={c.image_url}
              alt={c.image_alt ?? ""}
              onUrlChange={(v) => {
                const cards = [...data.cards];
                cards[i] = { ...cards[i], image_url: v };
                set("cards", cards);
              }}
              onAltChange={(v) => {
                const cards = [...data.cards];
                cards[i] = { ...cards[i], image_alt: v };
                set("cards", cards);
              }}
              disabled={!enabled}
            />
            <div>
              <FormLabel>Title</FormLabel>
              <TextInput
                value={c.title}
                onChange={(e) => {
                  const cards = [...data.cards];
                  cards[i] = { ...cards[i], title: e.target.value };
                  set("cards", cards);
                }}
                className="mt-1"
                disabled={!enabled}
              />
            </div>
            <CmsRichTextField
              label="Description"
              value={c.description}
              onChange={(v) => {
                const cards = [...data.cards];
                cards[i] = { ...cards[i], description: v };
                set("cards", cards);
              }}
              minHeight="100px"
              disabled={!enabled}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FormLabel>Button label</FormLabel>
                <TextInput
                  value={c.button_label}
                  onChange={(e) => {
                    const cards = [...data.cards];
                    cards[i] = { ...cards[i], button_label: e.target.value };
                    set("cards", cards);
                  }}
                  className="mt-1"
                  disabled={!enabled}
                />
              </div>
              <div>
                <FormLabel>Button URL</FormLabel>
                <TextInput
                  value={c.url}
                  onChange={(e) => {
                    const cards = [...data.cards];
                    cards[i] = { ...cards[i], url: e.target.value };
                    set("cards", cards);
                  }}
                  className="mt-1"
                  disabled={!enabled}
                />
              </div>
            </div>
            <CmsColorField
              label="Card color"
              value={c.card_color ?? ""}
              onChange={(v) => {
                const cards = [...data.cards];
                cards[i] = { ...cards[i], card_color: v };
                set("cards", cards);
              }}
            />
          </div>
        ))}
        {data.cards.length < 3 && (
          <button
            type="button"
            onClick={() => set("cards", [...data.cards, emptyPromoCard()])}
            disabled={!enabled}
            className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50"
          >
            + Add promo card
          </button>
        )}
      </CmsFieldGroup>
      <CmsFieldGroup title="Styling">
        <CmsColorField label="Section accent" value={data.accent_color ?? ""} onChange={(v) => set("accent_color", v)} />
      </CmsFieldGroup>
    </FormSection>
  );
}

function RepeaterButtons({
  items,
  onChange,
  disabled,
}: {
  items: { label: string; url: string; color?: string }[];
  onChange: (items: { label: string; url: string; color?: string }[]) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      <FormLabel>CTA buttons</FormLabel>
      {items.map((b, i) => (
        <div key={i} className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-3">
            <span className="text-xs text-gray-500">Label</span>
            <TextInput
              value={b.label}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], label: e.target.value };
                onChange(next);
              }}
              className="mt-0.5"
              disabled={disabled}
            />
          </div>
          <div className="lg:col-span-4">
            <span className="text-xs text-gray-500">URL</span>
            <TextInput
              value={b.url}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], url: e.target.value };
                onChange(next);
              }}
              className="mt-0.5"
              disabled={disabled}
            />
          </div>
          <div className="lg:col-span-4">
            <CmsColorField label="Button color" value={b.color ?? ""} onChange={(v) => {
              const next = [...items];
              next[i] = { ...next[i], color: v };
              onChange(next);
            }} />
          </div>
          <div className="flex lg:col-span-1 lg:justify-end">
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-sm text-red-500 hover:text-red-700" disabled={disabled}>
              ✕
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { label: "", url: "", color: "" }])}
        disabled={disabled}
        className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50"
      >
        + Add button
      </button>
    </div>
  );
}
