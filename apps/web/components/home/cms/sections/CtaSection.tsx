import Link from "next/link";
import type { PublicCmsHomepageSection } from "@/lib/public-cms";
import { cmsString } from "@/lib/public-cms";
import { safeHref, extraString } from "../utils";

export default function CtaSection({ section }: { section: PublicCmsHomepageSection }) {
  const title = cmsString(section.title) ?? "Ready to get certified?";
  const subtitle = cmsString(section.subtitle) ?? cmsString(section.description);
  const ctaLabel = cmsString(section.button_primary_label) ?? "View upcoming classes";
  const ctaUrl = safeHref(section.button_primary_url) ?? "/#classes";

  const bg = extraString(section.extra_data, "background_color") ?? "var(--cms-footer-bg, #0f172a)";

  return (
    <section id="cta" className="relative overflow-hidden py-16 sm:py-20" style={{ background: bg }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(234,179,8,0.16),transparent)]" />
      <div className="relative mx-auto max-w-4xl px-4 text-center text-white sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
        {subtitle ? (
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/80">{subtitle}</p>
        ) : null}
        <div className="mt-10">
          <Link
            href={ctaUrl}
            className="inline-flex rounded-xl px-8 py-4 text-base font-semibold text-white shadow-lg transition active:scale-[0.98]"
            style={{ background: "var(--cms-primary, #eab308)" }}
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

