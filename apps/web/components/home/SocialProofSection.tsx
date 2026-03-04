"use client";

import { useRef, useEffect, useState } from "react";
import type { SocialProofSettings } from "@/lib/homepage-settings";

type SocialProofSectionProps = {
  data: SocialProofSettings;
};

const BRAND_LOGO_BOX_SIZE = 120;
const AUTO_SLIDE_THRESHOLD = 6;
const AUTO_SLIDE_INTERVAL_MS = 3000;

function StarRating({ rating, size = "md" }: { rating: number; size?: "md" | "lg" }) {
  const stars = Math.min(5, Math.max(0, Math.round(rating)));
  const sizeClass = size === "lg" ? "text-2xl sm:text-3xl" : "text-base";
  return (
    <span className={`inline-flex gap-0.5 text-[#EAB308] ${sizeClass}`} aria-hidden>
      {"★".repeat(stars)}
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

        {/* Trust Header — centered, gradient, Google rating */}
        <div
          className="mx-auto mt-10 max-w-2xl rounded-[20px] px-6 py-10 text-center sm:px-10 sm:py-10"
          style={{
            background: "linear-gradient(135deg, #f8fafc, #eef2ff)",
            padding: 40,
          }}
        >
          <div className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 shadow-sm">
            <span className="text-lg font-medium sm:text-xl" style={{ color: "#4285F4" }}>G</span>
            <span className="text-lg sm:text-xl" style={{ color: "#EA4335" }}>o</span>
            <span className="text-lg sm:text-xl" style={{ color: "#FBBC04" }}>o</span>
            <span className="text-lg sm:text-xl" style={{ color: "#4285F4" }}>g</span>
            <span className="text-lg sm:text-xl" style={{ color: "#34A853" }}>l</span>
            <span className="text-lg sm:text-xl" style={{ color: "#EA4335" }}>e</span>
          </div>
          <div className="mt-4 flex justify-center">
            <StarRating rating={google_rating} size="lg" />
          </div>
          <p className="mt-2 text-xl font-bold text-[#0F172A] sm:text-2xl">
            {google_rating.toFixed(1)} Google Rating
          </p>
          <p className="mt-1 text-sm font-medium text-[#64748B]">
            {review_count.toLocaleString()}+ Peserta Berpuas Hati
          </p>
        </div>

        {/* Testimonial Cards — grid 1/2/3, card design, hover lift */}
        {sortedTestimonials.length > 0 && (
          <div className="mt-12 lg:mt-14">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedTestimonials.map((t, i) => (
                <div
                  key={`${t.name}-${i}`}
                  className="rounded-[18px] bg-white p-6 shadow-md transition-transform duration-200 hover:-translate-y-[4px]"
                >
                  <div className="flex gap-0.5 text-[#EAB308]">
                    <StarRating rating={t.rating} />
                  </div>
                  <p className="mt-4 text-[15px] leading-relaxed text-[#334155]">
                    &ldquo;{t.review}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    {t.avatar ? (
                      <img
                        src={t.avatar}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E0E7FF] text-sm font-semibold text-[#4338CA]"
                        aria-hidden
                      >
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#0F172A]">
                        {t.name}
                      </p>
                      {t.role && (
                        <p className="truncate text-xs text-[#64748B]">
                          {t.role}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
