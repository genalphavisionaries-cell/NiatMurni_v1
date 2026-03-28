import type { PublicCmsPayload, PublicCmsHomepageSection, PublicCmsTheme } from "@/lib/public-cms";

import HeroSection from "./sections/HeroSection";
import WhyChooseUsSection from "./sections/WhyChooseUsSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import PromotionsSection from "./sections/PromotionsSection";

import UpcomingClassesSection from "../UpcomingClassesSection";
import ContactSection from "../ContactSection";

/** Canonical homepage body keys from `homepage_sections` only (plus classes / contact). */
const HOMEPAGE_BODY_KEYS = new Set([
  "hero",
  "why_choose_us",
  "testimonials",
  "cta",
  "classes",
  "contact",
]);

function normalizeKey(k: string | null | undefined): string {
  return (k ?? "").trim().toLowerCase();
}

function byOrder(a: PublicCmsHomepageSection, b: PublicCmsHomepageSection): number {
  return (a.sort_order ?? 0) - (b.sort_order ?? 0);
}

export default function CmsHomepageRenderer({ cms }: { cms: PublicCmsPayload }) {
  const sections = (cms.homepage_sections ?? [])
    .filter((s) => HOMEPAGE_BODY_KEYS.has(normalizeKey(s.section_key)))
    .slice()
    .sort(byOrder);

  const byKey = new Map<string, PublicCmsHomepageSection[]>();
  for (const s of sections) {
    const k = normalizeKey(s.section_key);
    byKey.set(k, [...(byKey.get(k) ?? []), s]);
  }

  const first = (key: string): PublicCmsHomepageSection | null => {
    const arr = byKey.get(key);
    return arr?.length ? arr[0] : null;
  };

  const hero = first("hero");
  const why = first("why_choose_us");
  const testimonials = first("testimonials");
  const cta = first("cta");
  const classesSection = first("classes");
  const contactSection = first("contact");
  const theme: PublicCmsTheme = cms.theme;

  if (process.env.NODE_ENV === "development") {
    for (const key of ["hero", "why_choose_us", "testimonials", "cta"] as const) {
      if (!first(key)) {
        console.warn(`[CMS] Missing homepage_sections entry for canonical key "${key}"`);
      }
    }
  }

  return (
    <>
      {hero ? <HeroSection section={hero} site={cms.site} theme={theme} /> : null}
      {why ? <WhyChooseUsSection section={why} theme={theme} /> : null}
      <UpcomingClassesSection theme={theme} section={classesSection ?? undefined} />
      {testimonials ? <TestimonialsSection section={testimonials} theme={theme} /> : null}
      {cta ? <PromotionsSection section={cta} theme={theme} /> : null}
      {contactSection ? (
        <ContactSection email={cms.contact.email} phone={cms.contact.phone} />
      ) : null}
    </>
  );
}
