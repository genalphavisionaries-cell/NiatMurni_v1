"use client";

import { useRef, useEffect, useState } from "react";
import type { SocialProofSettings } from "@/lib/homepage-settings";

type SocialProofSectionProps = {
  data: SocialProofSettings;
};

const BRAND_LOGO_BOX_SIZE = 120;
const AUTO_SLIDE_THRESHOLD = 6;
const AUTO_SLIDE_INTERVAL_MS = 3000;

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex text-[#EAB308]" aria-hidden>
      {"★".repeat(Math.min(5, Math.max(0, rating)))}
    </span>
  );
}

export default function SocialProofSection({ data }: SocialProofSectionProps) {
  const {
    title,
    subtitle,
    google_rating,
    review_count,
    brand_logos,
    testimonials,
  } = data;
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const sortedLogos = [...brand_logos].sort((a, b) => a.order - b.order);
  const sortedTestimonials = [...testimonials].sort((a, b) => a.order - b.order);
  const shouldAutoSlide = sortedLogos.length > AUTO_SLIDE_THRESHOLD;

  useEffect(() => {
    if (!shouldAutoSlide || isPaused || !sliderRef.current) return;
    const el = sliderRef.current;
    const step = BRAND_LOGO_BOX_SIZE + 24;
    const timer = setInterval(() => {
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      const next = el.scrollLeft + step;
      if (next >= maxScroll - 1) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, AUTO_SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [shouldAutoSlide, isPaused, sortedLogos.length]);

  const scroll = (dir: "left" | "right") => {
    if (!sliderRef.current) return;
    const step = BRAND_LOGO_BOX_SIZE + 24;
    sliderRef.current.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  return (
    <section
      className="bg-white py-20"
      style={{ paddingTop: 80, paddingBottom: 80 }}
      aria-labelledby="social-proof-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="text-center">
          <h2 id="social-proof-heading" className="text-2xl font-bold text-[#0F172A] sm:text-3xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mx-auto mt-3 max-w-2xl text-[#64748B]">
              {subtitle}
            </p>
          )}
        </header>

        {/* Brand logos: single row, image boxes; auto-slide when more than 6 */}
        <div
          className="relative mt-10 flex items-center justify-center overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            ref={sliderRef}
            className="flex w-full snap-x snap-mandatory items-center gap-6 overflow-x-auto scroll-smooth py-2"
            style={{ scrollbarWidth: "thin" }}
          >
            {sortedLogos.map((item, i) => (
              <div
                key={`${item.company_name}-${i}`}
                className="flex shrink-0 snap-center items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] transition-colors hover:border-[#CBD5E1] hover:bg-white"
                style={{
                  width: BRAND_LOGO_BOX_SIZE,
                  height: 72,
                  minWidth: BRAND_LOGO_BOX_SIZE,
                }}
              >
                {item.logo ? (
                  <img
                    src={item.logo}
                    alt={item.company_name}
                    className="max-h-12 w-auto max-w-[90%] object-contain opacity-80 transition-opacity hover:opacity-100"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-center text-xs font-medium text-[#94A3B8] line-clamp-2 px-2">
                    {item.company_name}
                  </span>
                )}
              </div>
            ))}
          </div>
          {shouldAutoSlide && sortedLogos.length > 0 && (
            <>
              <button
                type="button"
                aria-label="Previous logos"
                onClick={() => scroll("left")}
                className="absolute left-2 z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/90 text-[#64748B] shadow-md hover:bg-white hover:text-[#0F172A] max-lg:hidden"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Next logos"
                onClick={() => scroll("right")}
                className="absolute right-2 z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/90 text-[#64748B] shadow-md hover:bg-white hover:text-[#0F172A] max-lg:hidden"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Google rating summary */}
        <div className="mt-8 text-center" style={{ marginTop: 32 }}>
          <div className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 shadow-sm">
            <span className="text-xl font-medium" style={{ color: "#4285F4" }}>G</span>
            <span className="text-xl" style={{ color: "#EA4335" }}>o</span>
            <span className="text-xl" style={{ color: "#FBBC04" }}>o</span>
            <span className="text-xl" style={{ color: "#4285F4" }}>g</span>
            <span className="text-xl" style={{ color: "#34A853" }}>l</span>
            <span className="text-xl" style={{ color: "#EA4335" }}>e</span>
          </div>
          <div className="mt-3 flex justify-center gap-1 text-xl text-[#EAB308]">
            <StarRating rating={google_rating} />
          </div>
          <p className="mt-1 text-sm font-semibold text-[#0F172A]">
            {google_rating.toFixed(1)} Google Rating
          </p>
          <p className="text-sm text-[#64748B]">
            {review_count.toLocaleString()}+ Peserta Berpuas Hati
          </p>
          <div
            className="mx-auto mt-2 h-px w-12 rounded-full bg-[#E5E7EB]"
            aria-hidden
          />
        </div>

        {/* Testimonials */}
        {sortedTestimonials.length > 0 && (
          <div className="mt-10 lg:mt-12">
            <div className="relative">
              <div
                ref={sliderRef}
                className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 scroll-smooth lg:grid lg:grid-cols-2 lg:overflow-visible"
                style={{ scrollbarWidth: "thin" }}
              >
                {sortedTestimonials.map((t, i) => (
                  <div
                    key={`${t.name}-${i}`}
                    className="min-w-[85vw] shrink-0 snap-center rounded-2xl bg-white p-5 shadow-md sm:min-w-[380px] lg:min-w-0 lg:max-w-[380px]"
                    style={{
                      borderRadius: 16,
                      padding: 20,
                      maxWidth: 380,
                    }}
                  >
                    <div className="flex gap-1 text-[#EAB308]">
                      <StarRating rating={t.rating} />
                    </div>
                    <p className="mt-3 text-[15px] leading-relaxed text-[#334155]">
                      &ldquo;{t.review}&rdquo;
                    </p>
                    <p className="mt-3 text-sm font-semibold text-[#0F172A]">
                      {t.name}
                    </p>
                  </div>
                ))}
              </div>
              {sortedTestimonials.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous testimonial"
                    onClick={() => scroll("left")}
                    className="absolute left-0 top-1/2 z-10 flex -translate-y-1/2 rounded-full bg-white p-2 shadow-md hover:bg-[#F9FAFB] max-lg:flex lg:hidden"
                  >
                    <svg className="h-5 w-5 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Next testimonial"
                    onClick={() => scroll("right")}
                    className="absolute right-0 top-1/2 z-10 flex -translate-y-1/2 rounded-full bg-white p-2 shadow-md hover:bg-[#F9FAFB] max-lg:flex lg:hidden"
                  >
                    <svg className="h-5 w-5 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
