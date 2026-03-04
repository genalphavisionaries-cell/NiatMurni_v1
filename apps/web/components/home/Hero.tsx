"use client";

import Link from "next/link";
import type { HomepageSettings } from "@/lib/homepage-settings";

type HeroProps = {
  settings: HomepageSettings["hero"];
};

export default function Hero({ settings }: HeroProps) {
  const {
    headline,
    subheadline,
    ctaText,
    ctaHref,
    backgroundImageUrl,
    overlayOpacity,
  } = settings;

  return (
    <section
      className="relative min-h-[85vh] overflow-hidden bg-slate-900 py-24 sm:py-32 lg:py-40"
      aria-label="Hero"
    >
      {backgroundImageUrl && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
          />
          <div
            className="absolute inset-0 bg-slate-900"
            style={{ opacity: overlayOpacity }}
          />
        </>
      )}
      {!backgroundImageUrl && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(234,179,8,0.12),transparent)]" />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-tight">
          {headline}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
          {subheadline}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={ctaHref}
            className="inline-flex rounded-xl bg-primary-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-slate-900 active:scale-[0.98]"
          >
            {ctaText}
          </Link>
          <Link
            href="#programs"
            className="inline-flex rounded-xl border border-slate-500 bg-transparent px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
          >
            Our programmes
          </Link>
        </div>
      </div>
    </section>
  );
}
