"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PublicCmsHomepageSection, PublicCmsSite } from "@/lib/public-cms";
import { cmsString } from "@/lib/public-cms";
import { extraString, safeHref, parseJsonSafe } from "../utils";

type HeroBadge = { label: string };

type HeroSlide = {
  desktop_image_url?: string | null;
  mobile_image_url?: string | null;
  title?: string;
  subtitle?: string;
  description?: string;
  button_primary_label?: string;
  button_primary_url?: string | null;
  button_secondary_label?: string;
  button_secondary_url?: string | null;
};

export default function HeroSection({
  section,
  site,
}: {
  section: PublicCmsHomepageSection;
  site: PublicCmsSite;
}) {
  const baseTitle =
    cmsString(section.title) ??
    cmsString(site.site_tagline) ??
    "Food Safety Training";
  const baseSubtitle =
    cmsString(section.subtitle) ??
    cmsString(section.description) ??
    "KKM-recognised training for food handlers — online or in person.";

  const basePrimaryLabel =
    cmsString(section.button_primary_label) ??
    cmsString(site.primary_cta_label) ??
    "Register";
  const basePrimaryUrl =
    safeHref(section.button_primary_url) ??
    safeHref(site.primary_cta_url) ??
    "/#classes";
  const baseSecondaryLabel = cmsString(section.button_secondary_label) ?? "View classes";
  const baseSecondaryUrl = safeHref(section.button_secondary_url) ?? "/#classes";

  const overlayOpacity = Number(extraString(section.extra_data, "overlay_opacity") ?? "0.25");
  const badges = parseJsonSafe<HeroBadge[]>(
    extraString(section.extra_data, "badges_json")
  ) ?? [];

  const desktopDefault = safeHref(section.image_url);
  const mobileDefault =
    safeHref(extraString(section.extra_data, "mobile_image_url") ?? "") ??
    desktopDefault;

  const parsedSlides = parseJsonSafe<HeroSlide[]>(
    extraString(section.extra_data, "slides_json")
  );

  const slides: HeroSlide[] = useMemo(() => {
    if (parsedSlides?.length) return parsedSlides;
    return [
      {
        desktop_image_url: desktopDefault,
        mobile_image_url: mobileDefault,
        title: baseTitle,
        subtitle: baseSubtitle,
        button_primary_label: basePrimaryLabel,
        button_primary_url: basePrimaryUrl,
        button_secondary_label: baseSecondaryLabel,
        button_secondary_url: baseSecondaryUrl,
      },
    ];
  }, [
    parsedSlides,
    desktopDefault,
    mobileDefault,
    baseTitle,
    basePrimaryLabel,
    basePrimaryUrl,
    baseSecondaryLabel,
    baseSecondaryUrl,
    baseSubtitle,
  ]);

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => {
      setActive((v) => (v + 1) % slides.length);
    }, 6500);
    return () => clearInterval(t);
  }, [slides.length]);

  const slide = slides[Math.min(active, slides.length - 1)];

  const title = cmsString(slide.title) ?? baseTitle;
  const subtitle =
    cmsString(slide.subtitle) ?? cmsString(slide.description) ?? baseSubtitle;

  const primaryLabel =
    cmsString(slide.button_primary_label) ?? basePrimaryLabel;
  const primaryUrl =
    safeHref(slide.button_primary_url ?? "") ?? basePrimaryUrl;

  const secondaryLabel =
    cmsString(slide.button_secondary_label) ?? baseSecondaryLabel;
  const secondaryUrl =
    safeHref(slide.button_secondary_url ?? "") ?? baseSecondaryUrl;

  const desktopImg = safeHref(slide.desktop_image_url ?? "") ?? desktopDefault;
  const mobileImg = safeHref(slide.mobile_image_url ?? "") ?? mobileDefault;

  const overlay =
    Number.isFinite(overlayOpacity) && overlayOpacity >= 0 && overlayOpacity <= 1
      ? overlayOpacity
      : 0.25;

  return (
    <section id="hero" className="relative h-screen min-h-[720px] overflow-hidden bg-slate-950">
      {/* Background images */}
      {desktopImg ? (
        <img
          src={desktopImg}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover hidden md:block"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : null}
      {mobileImg ? (
        <img
          src={mobileImg}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover md:hidden"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : null}

      {/* Dark overlay & premium glow */}
      <div
        className="absolute inset-0 bg-slate-950"
        style={{ opacity: overlay }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(234,179,8,0.16),transparent)]"
        aria-hidden
      />

      <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl py-14 sm:py-20 lg:py-28">
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

        {/* Carousel controls */}
        {slides.length > 1 ? (
          <div className="absolute inset-x-0 bottom-8 left-0 flex items-center justify-center gap-3 md:bottom-10">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => setActive((v) => (v - 1 + slides.length) % slides.length)}
              className="rounded-full border border-white/20 bg-white/10 p-2 text-white hover:bg-white/15"
            >
              <span aria-hidden>‹</span>
            </button>
            <div className="flex items-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Go to slide ${idx + 1}`}
                  onClick={() => setActive(idx)}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    idx === active ? "bg-[#EAB308]" : "bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => setActive((v) => (v + 1) % slides.length)}
              className="rounded-full border border-white/20 bg-white/10 p-2 text-white hover:bg-white/15"
            >
              <span aria-hidden>›</span>
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

