import type { HomepageSettings } from "@/lib/homepage-settings";
import type { PublicCmsPayload, PublicCmsHomepageSection } from "@/lib/public-cms";

import HeroSection from "./sections/HeroSection";
import WhyChooseUsSection from "./sections/WhyChooseUsSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import PromotionsSection from "./sections/PromotionsSection";

import UpcomingClassesSection from "../UpcomingClassesSection";
import ContactSection from "../ContactSection";

export type SupportedCmsSectionKey =
  | "hero"
  | "about"
  | "features"
  | "programs"
  | "why_choose_us"
  | "stats"
  | "testimonials"
  | "faq"
  | "cta"
  | "contact";

const supported = new Set<string>([
  "hero",
  "about",
  "features",
  "programs",
  "why_choose_us",
  "stats",
  "testimonials",
  "faq",
  "cta",
  "contact",
]);

function normalizeKey(k: string): string {
  return k.trim().toLowerCase();
}

function byOrder(a: PublicCmsHomepageSection, b: PublicCmsHomepageSection): number {
  return (a.sort_order ?? 0) - (b.sort_order ?? 0);
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

  const hero = first("hero");
  const why = first("why_choose_us") ?? first("features");
  const testimonials = first("testimonials");
  const cta = first("cta");
  const contactSection = first("contact");

  const hasAny =
    !!hero ||
    !!why ||
    !!testimonials ||
    !!cta ||
    !!contactSection;

  if (!hasAny) return null;

  return (
    <>
      {/* 1. Hero */}
      {hero ? <HeroSection section={hero} site={cms.site} /> : null}
      {/* 2. Why Us */}
      {why ? <WhyChooseUsSection section={why} /> : null}
      {/* 3. Upcoming Classes — always rendered here, between Why Us and Testimonials */}
      <UpcomingClassesSection />
      {/* 4. Trust & Reviews */}
      {testimonials ? <TestimonialsSection section={testimonials} /> : null}
      {/* 5. Promotions */}
      {cta ? <PromotionsSection section={cta} /> : null}
      {/* 6. Contact (if configured) */}
      {contactSection ? (
        <ContactSection email={cms.contact.email} phone={cms.contact.phone} />
      ) : null}
    </>
  );
}

