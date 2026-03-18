import type { HomepageSettings } from "@/lib/homepage-settings";
import type { PublicCmsPayload, PublicCmsHomepageSection } from "@/lib/public-cms";

import HeroSection from "./sections/HeroSection";
import WhyChooseUsSection from "./sections/WhyChooseUsSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import FaqSection from "./sections/FaqSection";
import CtaSection from "./sections/CtaSection";

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
  const faq = first("faq");
  const cta = first("cta");
  const programs = first("programs");
  const contactSection = first("contact");

  const hasAny =
    !!hero ||
    !!why ||
    !!testimonials ||
    !!faq ||
    !!cta ||
    !!programs ||
    !!contactSection;

  if (!hasAny) return null;

  return (
    <>
      {hero ? <HeroSection section={hero} site={cms.site} /> : null}
      {why ? <WhyChooseUsSection section={why} /> : null}

      {/* Controlled integration: "programs" key can render the existing classes block for now */}
      {programs ? <UpcomingClassesSection /> : null}

      {testimonials ? <TestimonialsSection section={testimonials} /> : null}
      {faq ? <FaqSection section={faq} /> : null}
      {cta ? <CtaSection section={cta} /> : null}

      {/* Controlled integration: "contact" key can render the existing contact block for now */}
      {contactSection ? (
        <ContactSection email={cms.contact.email} phone={cms.contact.phone} />
      ) : null}
    </>
  );
}

