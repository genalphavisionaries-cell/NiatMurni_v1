"use client";

import { useEffect, useState } from "react";
import { FormSection, FormLabel, TextInput, Textarea } from "@/components/dashboard";
import { adminApi } from "@/lib/admin-api";
import type { CmsHeroData, CmsUspData, CmsClassesData, CmsPromoData, CmsFloatingData } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

type Tab = "hero" | "usp" | "classes" | "promo" | "floating";

const tabs: { key: Tab; label: string }[] = [
  { key: "hero", label: "Hero" },
  { key: "usp", label: "USP" },
  { key: "classes", label: "Classes" },
  { key: "promo", label: "Promo" },
  { key: "floating", label: "Floating Menu" },
];

const emptyHero: CmsHeroData = { headline: "", subheadline: "", buttons: [], background_urls: "" };
const emptyUsp: CmsUspData = { title: "", description: "", points: [], side_images_urls: "" };
const emptyClasses: CmsClassesData = { title: "", description: "", button_text: "", button_url: "", max_items: 20 };
const emptyPromo: CmsPromoData = { title: "", description: "", banner_urls: "", cards: [] };
const emptyFloating: CmsFloatingData = { enabled: false, style_json: "", items: [] };

export function CmsHomepageClient() {
  const [activeTab, setActiveTab] = useState<Tab>("hero");
  const [hero, setHero] = useState<CmsHeroData>(emptyHero);
  const [usp, setUsp] = useState<CmsUspData>(emptyUsp);
  const [classes, setClasses] = useState<CmsClassesData>(emptyClasses);
  const [promo, setPromo] = useState<CmsPromoData>(emptyPromo);
  const [floating, setFloating] = useState<CmsFloatingData>(emptyFloating);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    adminApi
      .getCmsHomepage()
      .then((res) => {
        const d = res.data;
        setHero({ ...emptyHero, ...d.hero });
        setUsp({ ...emptyUsp, ...d.usp });
        setClasses({ ...emptyClasses, ...d.classes });
        setPromo({ ...emptyPromo, ...d.promo });
        setFloating({ ...emptyFloating, ...d.floating_menu });
      })
      .catch(() => setMessage({ type: "error", text: "Failed to load CMS data." }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setMessage(null);
    setSaving(true);
    try {
      await adminApi.updateCmsHomepage({ hero, usp, classes, promo, floating_menu: floating });
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

      {/* Tab bar */}
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

      {/* Tab content */}
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
        {activeTab === "hero" && <HeroTab data={hero} onChange={setHero} />}
        {activeTab === "usp" && <UspTab data={usp} onChange={setUsp} />}
        {activeTab === "classes" && <ClassesTab data={classes} onChange={setClasses} />}
        {activeTab === "promo" && <PromoTab data={promo} onChange={setPromo} />}
        {activeTab === "floating" && <FloatingTab data={floating} onChange={setFloating} />}
      </div>
    </div>
  );
}

/* ─── Hero ──────────────────────────────────────────────────────────── */
function HeroTab({ data, onChange }: { data: CmsHeroData; onChange: (d: CmsHeroData) => void }) {
  const set = <K extends keyof CmsHeroData>(k: K, v: CmsHeroData[K]) => onChange({ ...data, [k]: v });
  return (
    <FormSection>
      <div>
        <FormLabel>Headline</FormLabel>
        <TextInput value={data.headline} onChange={(e) => set("headline", e.target.value)} className="mt-1" />
      </div>
      <div>
        <FormLabel>Sub-headline</FormLabel>
        <Textarea value={data.subheadline} onChange={(e) => set("subheadline", e.target.value)} rows={3} className="mt-1" />
      </div>
      <div>
        <FormLabel>CTA Buttons</FormLabel>
        <RepeaterButtons items={data.buttons} onChange={(b) => set("buttons", b)} />
      </div>
      <div>
        <FormLabel>Background image URLs (one per line, max 5)</FormLabel>
        <Textarea value={data.background_urls} onChange={(e) => set("background_urls", e.target.value)} rows={4} className="mt-1" />
      </div>
    </FormSection>
  );
}

/* ─── USP ───────────────────────────────────────────────────────────── */
function UspTab({ data, onChange }: { data: CmsUspData; onChange: (d: CmsUspData) => void }) {
  const set = <K extends keyof CmsUspData>(k: K, v: CmsUspData[K]) => onChange({ ...data, [k]: v });
  return (
    <FormSection>
      <div>
        <FormLabel>Title</FormLabel>
        <TextInput value={data.title} onChange={(e) => set("title", e.target.value)} className="mt-1" />
      </div>
      <div>
        <FormLabel>Description</FormLabel>
        <Textarea value={data.description} onChange={(e) => set("description", e.target.value)} rows={3} className="mt-1" />
      </div>
      <div>
        <FormLabel>USP Points (max 4)</FormLabel>
        {data.points.map((p, i) => (
          <div key={i} className="mt-3 grid grid-cols-3 gap-3 rounded-lg border border-gray-200 p-3">
            <TextInput placeholder="Icon" value={p.icon} onChange={(e) => { const pts = [...data.points]; pts[i] = { ...pts[i], icon: e.target.value }; set("points", pts); }} />
            <TextInput placeholder="Title" value={p.title} onChange={(e) => { const pts = [...data.points]; pts[i] = { ...pts[i], title: e.target.value }; set("points", pts); }} />
            <div className="flex gap-2">
              <TextInput placeholder="Description" value={p.description} onChange={(e) => { const pts = [...data.points]; pts[i] = { ...pts[i], description: e.target.value }; set("points", pts); }} className="flex-1" />
              <button onClick={() => set("points", data.points.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700 text-sm">✕</button>
            </div>
          </div>
        ))}
        {data.points.length < 4 && (
          <button onClick={() => set("points", [...data.points, { icon: "", title: "", description: "" }])} className="mt-2 text-sm text-blue-600 hover:underline">+ Add point</button>
        )}
      </div>
      <div>
        <FormLabel>Side image URLs (one per line)</FormLabel>
        <Textarea value={data.side_images_urls} onChange={(e) => set("side_images_urls", e.target.value)} rows={3} className="mt-1" />
      </div>
    </FormSection>
  );
}

/* ─── Classes ───────────────────────────────────────────────────────── */
function ClassesTab({ data, onChange }: { data: CmsClassesData; onChange: (d: CmsClassesData) => void }) {
  const set = <K extends keyof CmsClassesData>(k: K, v: CmsClassesData[K]) => onChange({ ...data, [k]: v });
  return (
    <FormSection>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FormLabel>Title</FormLabel>
          <TextInput value={data.title} onChange={(e) => set("title", e.target.value)} className="mt-1" />
        </div>
        <div>
          <FormLabel>Max items shown</FormLabel>
          <TextInput type="number" value={data.max_items} onChange={(e) => set("max_items", Number(e.target.value) || 20)} className="mt-1" />
        </div>
      </div>
      <div>
        <FormLabel>Description</FormLabel>
        <Textarea value={data.description} onChange={(e) => set("description", e.target.value)} rows={3} className="mt-1" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FormLabel>Button text</FormLabel>
          <TextInput value={data.button_text} onChange={(e) => set("button_text", e.target.value)} className="mt-1" />
        </div>
        <div>
          <FormLabel>Button URL</FormLabel>
          <TextInput value={data.button_url} onChange={(e) => set("button_url", e.target.value)} className="mt-1" />
        </div>
      </div>
      <p className="text-sm text-gray-500">Class listings are loaded dynamically from the API.</p>
    </FormSection>
  );
}

/* ─── Promo ──────────────────────────────────────────────────────────── */
function PromoTab({ data, onChange }: { data: CmsPromoData; onChange: (d: CmsPromoData) => void }) {
  const set = <K extends keyof CmsPromoData>(k: K, v: CmsPromoData[K]) => onChange({ ...data, [k]: v });
  return (
    <FormSection>
      <div>
        <FormLabel>Title</FormLabel>
        <TextInput value={data.title} onChange={(e) => set("title", e.target.value)} className="mt-1" />
      </div>
      <div>
        <FormLabel>Description</FormLabel>
        <Textarea value={data.description} onChange={(e) => set("description", e.target.value)} rows={3} className="mt-1" />
      </div>
      <div>
        <FormLabel>Banner image URLs (one per line, max 3)</FormLabel>
        <Textarea value={data.banner_urls} onChange={(e) => set("banner_urls", e.target.value)} rows={3} className="mt-1" />
      </div>
      <div>
        <FormLabel>Promo Cards (max 3)</FormLabel>
        {data.cards.map((c, i) => (
          <div key={i} className="mt-3 space-y-2 rounded-lg border border-gray-200 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <TextInput placeholder="Title" value={c.title} onChange={(e) => { const cards = [...data.cards]; cards[i] = { ...cards[i], title: e.target.value }; set("cards", cards); }} />
              <TextInput placeholder="Image URL" value={c.image_url} onChange={(e) => { const cards = [...data.cards]; cards[i] = { ...cards[i], image_url: e.target.value }; set("cards", cards); }} />
            </div>
            <Textarea placeholder="Description" value={c.description} onChange={(e) => { const cards = [...data.cards]; cards[i] = { ...cards[i], description: e.target.value }; set("cards", cards); }} rows={2} />
            <div className="grid gap-3 sm:grid-cols-2">
              <TextInput placeholder="Button label" value={c.button_label} onChange={(e) => { const cards = [...data.cards]; cards[i] = { ...cards[i], button_label: e.target.value }; set("cards", cards); }} />
              <div className="flex gap-2">
                <TextInput placeholder="Link URL" value={c.url} onChange={(e) => { const cards = [...data.cards]; cards[i] = { ...cards[i], url: e.target.value }; set("cards", cards); }} className="flex-1" />
                <button onClick={() => set("cards", data.cards.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700 text-sm">✕</button>
              </div>
            </div>
          </div>
        ))}
        {data.cards.length < 3 && (
          <button onClick={() => set("cards", [...data.cards, { image_url: "", title: "", description: "", button_label: "", url: "" }])} className="mt-2 text-sm text-blue-600 hover:underline">+ Add card</button>
        )}
      </div>
    </FormSection>
  );
}

/* ─── Shared: repeater for hero buttons ──────────────────────────────── */
function RepeaterButtons({ items, onChange }: { items: { label: string; url: string; color?: string }[]; onChange: (items: { label: string; url: string; color?: string }[]) => void }) {
  return (
    <div className="mt-1 space-y-2">
      {items.map((b, i) => (
        <div key={i} className="grid grid-cols-3 gap-2 rounded-lg border border-gray-200 p-3">
          <TextInput placeholder="Label" value={b.label} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], label: e.target.value }; onChange(next); }} />
          <TextInput placeholder="URL" value={b.url} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], url: e.target.value }; onChange(next); }} />
          <div className="flex gap-2">
            <TextInput placeholder="Colour" value={b.color ?? ""} onChange={(e) => { const next = [...items]; next[i] = { ...next[i], color: e.target.value }; onChange(next); }} className="flex-1" />
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700 text-sm">✕</button>
          </div>
        </div>
      ))}
      <button onClick={() => onChange([...items, { label: "", url: "", color: "" }])} className="text-sm text-blue-600 hover:underline">+ Add button</button>
    </div>
  );
}

function FloatingTab({ data, onChange }: { data: CmsFloatingData; onChange: (d: CmsFloatingData) => void }) {
  const set = <K extends keyof CmsFloatingData>(k: K, v: CmsFloatingData[K]) => onChange({ ...data, [k]: v });
  const items = data.items ?? [];

  return (
    <FormSection>
      <div className="flex items-center gap-2">
        <input
          id="floating-enabled"
          type="checkbox"
          checked={!!data.enabled}
          onChange={(e) => set("enabled", e.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor="floating-enabled" className="text-sm font-medium text-gray-900">
          Enable floating bottom menu on public site
        </label>
      </div>

      <div>
        <FormLabel>Menu items (exactly 4 for display)</FormLabel>
        {items.map((item, i) => (
          <div key={i} className="mt-2 grid grid-cols-3 gap-2 rounded-lg border border-gray-200 p-3">
            <TextInput
              placeholder="Icon hint (home/book/mail/whatsapp)"
              value={item.icon}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], icon: e.target.value };
                set("items", next);
              }}
            />
            <TextInput
              placeholder="Label"
              value={item.label}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], label: e.target.value };
                set("items", next);
              }}
            />
            <div className="flex gap-2">
              <TextInput
                placeholder="URL (leave blank for WhatsApp button)"
                value={item.url}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...next[i], url: e.target.value };
                  set("items", next);
                }}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => set("items", items.filter((_, j) => j !== i))}
                className="text-sm text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        {items.length < 4 && (
          <button
            type="button"
            onClick={() => set("items", [...items, { icon: "", label: "", url: "" }])}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            + Add item
          </button>
        )}
        <p className="mt-2 text-xs text-gray-500">
          Tip: First 3 items are links. 4th item is used as WhatsApp trigger in the public floating menu.
        </p>
      </div>

      <div>
        <FormLabel>Advanced style JSON (optional)</FormLabel>
        <Textarea
          rows={4}
          value={data.style_json}
          onChange={(e) => set("style_json", e.target.value)}
          placeholder='{"bg":"#ffffff","text":"#0f172a"}'
          className="mt-1 font-mono text-xs"
        />
      </div>
    </FormSection>
  );
}
