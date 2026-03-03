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
      className="relative overflow-hidden bg-stone-800 py-20 sm:py-28 lg:py-32"
      aria-label="Hero"
    >
      {backgroundImageUrl && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
          />
          <div
            className="absolute inset-0 bg-stone-900"
            style={{ opacity: overlayOpacity }}
          />
        </>
      )}
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {headline}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-stone-300 sm:text-xl">
          {subheadline}
        </p>
        <div className="mt-10">
          <Link
            href={ctaHref}
            className="inline-flex rounded-full bg-amber-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-800"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}
