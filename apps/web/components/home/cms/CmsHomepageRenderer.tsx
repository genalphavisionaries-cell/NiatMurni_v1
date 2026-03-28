import type { HomepageSettings } from "@/lib/homepage-settings";
import type { PublicCmsPayload, PublicCmsHomepageSection, PublicCmsTheme } from "@/lib/public-cms";
import { cmsString } from "@/lib/public-cms";

import HeroSection from "./sections/HeroSection";
import WhyChooseUsSection from "./sections/WhyChooseUsSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import PromotionsSection from "./sections/PromotionsSection";

import UpcomingClassesSection from "../UpcomingClassesSection";
import ContactSection from "../ContactSection";
import { parseJsonSafe } from "./utils";

export type SupportedCmsSectionKey =
  | "hero"
  | "about"
  | "features"
  | "programs"
  | "why_choose_us"
  | "usp"
  | "stats"
  | "testimonials"
  | "trust"
  | "faq"
  | "cta"
  | "promo"
  | "classes"
  | "contact";

const FALLBACK = {
  hero: {
    title: "Kursus Pengendalian Makanan Diiktiraf KKM",
    subtitle: "Dapatkan sijil sah untuk bekerja atau menjalankan perniagaan makanan di Malaysia.",
    cta_text: "Daftar Sekarang",
    image: "/images/default-hero.jpg",
  },
  why_choose_us: {
    title: "Kenapa Pilih Niat Murni Academy?",
    items: [
      "Trainer bertauliah KKM",
      "Sijil sah di seluruh Malaysia",
      "Kelas online & fizikal",
      "Proses cepat dan mudah",
    ],
  },
  testimonials: {
    title: "Apa Kata Peserta Kami",
  },
  cta: {
    title: "Tempah Tempat Anda Sekarang",
    subtitle: "Kelas terhad setiap sesi — jangan lepaskan peluang",
    button: "Daftar Sekarang",
  },
} as const;

const WHY_ITEMS_FALLBACK = FALLBACK.why_choose_us.items.map((t) => ({
  title: t,
  description: "",
}));

const supported = new Set<string>([
  "hero",
  "about",
  "features",
  "programs",
  "why_choose_us",
  "usp",
  "stats",
  "testimonials",
  "trust",
  "faq",
  "cta",
  "promo",
  "classes",
  "contact",
]);

function normalizeKey(k: string | null | undefined): string {
  return (k ?? "").trim().toLowerCase();
}

function byOrder(a: PublicCmsHomepageSection, b: PublicCmsHomepageSection): number {
  return (a.sort_order ?? 0) - (b.sort_order ?? 0);
}

function makeFallbackHeroSection(): PublicCmsHomepageSection {
  return {
    section_key: "hero",
    name: "Hero",
    sort_order: 0,
    title: FALLBACK.hero.title,
    subtitle: FALLBACK.hero.subtitle,
    description: null,
    image_url: FALLBACK.hero.image,
    button_primary_label: FALLBACK.hero.cta_text,
    button_primary_url: "/#classes",
    button_secondary_label: "Lihat Kelas",
    button_secondary_url: "/#classes",
    extra_data: null,
  };
}

function mergeHeroSection(
  s: PublicCmsHomepageSection | null,
  legacy: HomepageSettings
): PublicCmsHomepageSection {
  const legacyImg = legacy.hero.backgroundImageUrl ?? "/images/food-handling-hero.svg";
  if (!s) {
    const fb = makeFallbackHeroSection();
    return { ...fb, image_url: legacyImg || FALLBACK.hero.image };
  }
  const title = cmsString(s.title) != null ? s.title : FALLBACK.hero.title;
  const subtitle =
    cmsString(s.subtitle) != null
      ? s.subtitle
      : cmsString(s.description) != null
        ? s.description
        : FALLBACK.hero.subtitle;
  const image_url =
    cmsString(s.image_url) != null ? s.image_url : legacyImg || FALLBACK.hero.image;
  const button_primary_label =
    cmsString(s.button_primary_label) != null ? s.button_primary_label : FALLBACK.hero.cta_text;
  const button_primary_url =
    cmsString(s.button_primary_url) != null ? s.button_primary_url : "/#classes";
  return {
    ...s,
    title,
    subtitle,
    image_url,
    button_primary_label,
    button_primary_url,
  };
}

function makeFallbackWhySection(): PublicCmsHomepageSection {
  return {
    section_key: "why_choose_us",
    name: "Why choose us",
    sort_order: 1,
    title: FALLBACK.why_choose_us.title,
    subtitle: null,
    description: null,
    image_url: null,
    button_primary_label: null,
    button_primary_url: null,
    button_secondary_label: null,
    button_secondary_url: null,
    extra_data: { items_json: JSON.stringify(WHY_ITEMS_FALLBACK) },
  };
}

function mergeWhySection(s: PublicCmsHomepageSection | null): PublicCmsHomepageSection {
  if (!s) return makeFallbackWhySection();
  const raw = s.extra_data?.items_json;
  const parsed = parseJsonSafe<Array<{ title?: string; description?: string }>>(
    typeof raw === "string" ? raw : null
  );
  // Only use fallback if CMS section exists but has NO items_json at all (null/undefined)
  // If CMS provides empty array or empty items, respect that (don't override with fallback)
  const itemsJson = raw == null ? JSON.stringify(WHY_ITEMS_FALLBACK) : (typeof raw === "string" ? raw : JSON.stringify(parsed ?? []));
  return {
    ...s,
    title: cmsString(s.title) || FALLBACK.why_choose_us.title,
    extra_data: { ...(s.extra_data ?? {}), items_json: itemsJson },
  };
}

function makeFallbackTestimonialsSection(): PublicCmsHomepageSection {
  return {
    section_key: "testimonials",
    name: "Testimonials",
    sort_order: 3,
    title: FALLBACK.testimonials.title,
    subtitle: null,
    description: null,
    image_url: null,
    button_primary_label: null,
    button_primary_url: null,
    button_secondary_label: null,
    button_secondary_url: null,
    extra_data: null,
  };
}

function mergeTestimonialsSection(s: PublicCmsHomepageSection | null): PublicCmsHomepageSection {
  if (!s) return makeFallbackTestimonialsSection();
  return {
    ...s,
    title: cmsString(s.title) || FALLBACK.testimonials.title,
  };
}

function makeFallbackCtaSection(): PublicCmsHomepageSection {
  return {
    section_key: "cta",
    name: "CTA",
    sort_order: 4,
    title: FALLBACK.cta.title,
    subtitle: FALLBACK.cta.subtitle,
    description: null,
    image_url: null,
    button_primary_label: FALLBACK.cta.button,
    button_primary_url: "/#classes",
    button_secondary_label: null,
    button_secondary_url: null,
    extra_data: null,
  };
}

function mergeCtaSection(s: PublicCmsHomepageSection | null): PublicCmsHomepageSection {
  if (!s) return makeFallbackCtaSection();
  return {
    ...s,
    title: cmsString(s.title) || FALLBACK.cta.title,
    subtitle: cmsString(s.subtitle) || FALLBACK.cta.subtitle,
    button_primary_label: cmsString(s.button_primary_label) || FALLBACK.cta.button,
    button_primary_url: s.button_primary_url || "/#classes",
  };
}

export default function CmsHomepageRenderer({
  cms,
  legacy,
}: {
  cms: PublicCmsPayload;
  legacy: HomepageSettings;
}) {
  const sections = (cms.homepage_sections ?? [])
    .filter((s) => supported.has(normalizeKey(s.section_key)))
    .slice()
    .sort(byOrder);

  const byKey = new Map<string, PublicCmsHomepageSection[]>();
  for (const s of sections) {
    const k = normalizeKey(s.section_key);
    byKey.set(k, [...(byKey.get(k) ?? []), s]);
  }

  const first = (k: SupportedCmsSectionKey): PublicCmsHomepageSection | null => {
    const arr = byKey.get(k);
    return arr?.length ? arr[0] : null;
  };

  /** CMS primary: `cms.hero` from API/normalize, else first hero section; `FALLBACK.hero` only inside `mergeHeroSection` when both are absent. */
  const hero = cms?.hero ?? first("hero");
  const isCmsDebug =
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_CMS_DEBUG === "true";

  const heroSection = mergeHeroSection(hero, legacy);
  const whySection = mergeWhySection(first("why_choose_us") ?? first("usp") ?? first("features"));
  const testimonialsSection = mergeTestimonialsSection(first("testimonials") ?? first("trust"));
  const ctaSection = mergeCtaSection(first("cta") ?? first("promo"));
  const classesSection = first("classes");
  const contactSection = first("contact");
  const theme: PublicCmsTheme = cms.theme;

  if (isCmsDebug) {
    console.log("CMS HERO:", cms?.hero);
    
    // Validate critical fields for each section
    if (!hero || !cmsString(hero.title)) {
      console.warn("CMS MISSING DATA:", "hero", { title: hero?.title, hasImage: !!hero?.image_url });
    }
    
    const whyRaw = first("why_choose_us") ?? first("usp") ?? first("features");
    if (!whyRaw || !cmsString(whyRaw.title)) {
      console.warn("CMS MISSING DATA:", "why_choose_us", { title: whyRaw?.title, hasItems: !!whyRaw?.extra_data?.items_json });
    }
    
    const testimonialRaw = first("testimonials") ?? first("trust");
    if (!testimonialRaw || !cmsString(testimonialRaw.title)) {
      console.warn("CMS MISSING DATA:", "testimonials", { title: testimonialRaw?.title, hasItems: !!testimonialRaw?.extra_data?.items_json });
    }
    
    const ctaRaw = first("cta") ?? first("promo");
    if (!ctaRaw || !cmsString(ctaRaw.title)) {
      console.warn("CMS MISSING DATA:", "cta", { title: ctaRaw?.title, hasPromos: !!ctaRaw?.extra_data?.promos_json });
    }
  }

  return (
    <>
      {/* 1. Hero */}
      {heroSection ? <HeroSection section={heroSection} site={cms.site} theme={theme} /> : null}
      {/* 2. Why Us */}
      {whySection ? <WhyChooseUsSection section={whySection} theme={theme} /> : null}
      {/* 3. Upcoming Classes — always rendered here, between Why Us and Testimonials */}
      <UpcomingClassesSection theme={theme} section={classesSection ?? undefined} />
      {/* 4. Trust & Reviews */}
      {testimonialsSection ? <TestimonialsSection section={testimonialsSection} theme={theme} /> : null}
      {/* 5. Promotions */}
      {ctaSection ? <PromotionsSection section={ctaSection} theme={theme} /> : null}
      {/* 6. Contact (if configured) */}
      {contactSection ? (
        <ContactSection email={cms.contact.email} phone={cms.contact.phone} />
      ) : null}
    </>
  );
}
