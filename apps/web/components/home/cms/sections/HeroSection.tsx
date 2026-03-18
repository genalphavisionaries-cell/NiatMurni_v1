import Link from "next/link";
import type { PublicCmsHomepageSection, PublicCmsSite } from "@/lib/public-cms";
import { cmsString } from "@/lib/public-cms";
import { extraString, safeHref, parseJsonSafe } from "../utils";

type HeroBadge = { label: string };

export default function HeroSection({
  section,
  site,
}: {
  section: PublicCmsHomepageSection;
  site: PublicCmsSite;
}) {
  const title = cmsString(section.title) ?? cmsString(site.site_tagline) ?? "Food Safety Training";
  const subtitle =
    cmsString(section.subtitle) ??
    cmsString(section.description) ??
    "KKM-recognised training for food handlers — online or in person.";

  const primaryLabel = cmsString(section.button_primary_label) ?? cmsString(site.primary_cta_label) ?? "Register";
  const primaryUrl = safeHref(section.button_primary_url) ?? safeHref(site.primary_cta_url) ?? "/#classes";
  const secondaryLabel = cmsString(section.button_secondary_label) ?? "View classes";
  const secondaryUrl = safeHref(section.button_secondary_url) ?? "/#classes";

  const heroImage = safeHref(section.image_url);
  const overlayOpacity = Number(extraString(section.extra_data, "overlay_opacity") ?? "0.25");
  const badges = parseJsonSafe<HeroBadge[]>(extraString(section.extra_data, "badges_json")) ?? [];

  return (
    <section id="hero" className="relative overflow-hidden bg-slate-950">
      {heroImage ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
          <div className="absolute inset-0 bg-slate-950" style={{ opacity: Number.isFinite(overlayOpacity) ? overlayOpacity : 0.25 }} />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(234,179,8,0.16),transparent)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          {badges.length ? (
            <div className="mb-6 flex flex-wrap gap-2">
              {badges.slice(0, 6).map((b, idx) => (
                <span
                  key={`${b.label}-${idx}`}
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90"
                >
                  {b.label}
                </span>
              ))}
            </div>
          ) : null}

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-white/80 sm:text-xl">
            {subtitle}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href={primaryUrl}
              className="inline-flex rounded-xl px-7 py-4 text-sm font-semibold text-white shadow-lg transition active:scale-[0.98]"
              style={{ background: "var(--cms-primary, #eab308)" }}
            >
              {primaryLabel}
            </Link>
            <Link
              href={secondaryUrl}
              className="inline-flex rounded-xl border border-white/25 bg-white/5 px-7 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {secondaryLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

