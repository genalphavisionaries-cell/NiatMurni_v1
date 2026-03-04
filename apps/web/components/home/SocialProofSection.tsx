"use client";

import { useRef, useState } from "react";
import type { SocialProofSettings } from "@/lib/homepage-settings";

type SocialProofSectionProps = {
  data: SocialProofSettings;
};

/** Google review URL - replace with your actual Google Place ID / review link */
const GOOGLE_REVIEW_URL = "https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID";

const BRAND_LOGO_BOX_SIZE = 120;
const REVIEW_TRUNCATE_LENGTH = 120;

function StarRating({ rating, size = "md" }: { rating: number; size?: "md" | "lg" }) {
  const stars = Math.min(5, Math.max(0, Math.round(rating)));
  const sizeClass = size === "lg" ? "text-xl" : "text-sm";
  return (
    <span className={`inline-flex gap-0.5 text-[#EAB308] ${sizeClass}`} aria-hidden>
      {"★".repeat(stars)}
    </span>
  );
}

function GoogleGIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center ${className}`} aria-hidden>
      <span className="text-sm font-medium" style={{ color: "#4285F4" }}>G</span>
      <span className="text-sm" style={{ color: "#EA4335" }}>o</span>
      <span className="text-sm" style={{ color: "#FBBC04" }}>o</span>
      <span className="text-sm" style={{ color: "#4285F4" }}>g</span>
      <span className="text-sm" style={{ color: "#34A853" }}>l</span>
      <span className="text-sm" style={{ color: "#EA4335" }}>e</span>
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
  const testimonialRef = useRef<HTMLDivElement>(null);
  const sortedLogos = [...brand_logos].sort((a, b) => a.order - b.order);
  const sortedTestimonials = [...testimonials].sort((a, b) => a.order - b.order);

  const scrollTestimonials = () => {
    if (testimonialRef.current) {
      testimonialRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
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

        {/* Brand logos row */}
        <div className="relative mt-10 flex items-center justify-center overflow-hidden">
          <div
            className="flex w-full snap-x snap-mandatory items-center gap-6 overflow-x-auto scroll-smooth py-2 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {sortedLogos.map((item, i) => (
              <div
                key={`${item.company_name}-${i}`}
                className="flex shrink-0 snap-center items-center justify-center rounded-lg border border-[#E5E8F0] bg-[#FAFAFA] transition-colors hover:border-[#CBD5E1] hover:bg-white"
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
        </div>

        {/* Google Rating header — horizontal bar like reference */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] px-6 py-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <GoogleGIcon className="h-5 w-5" />
              <span className="text-base font-semibold text-[#0F172A]">Google Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#0F172A]">
                {google_rating.toFixed(1)}
              </span>
              <StarRating rating={google_rating} size="lg" />
              <span className="text-sm text-[#64748B]">
                {review_count.toLocaleString()} reviews
              </span>
            </div>
          </div>
          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-2"
          >
            Write a Review
          </a>
        </div>

        {/* Testimonial cards — horizontal scroll, card layout like reference */}
        {sortedTestimonials.length > 0 && (
          <div className="relative mt-8">
            <div
              ref={testimonialRef}
              className="flex gap-6 overflow-x-auto scroll-smooth pb-2 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none" }}
            >
              {sortedTestimonials.map((t, i) => (
                <TestimonialCard key={`${t.name}-${i}`} testimonial={t} />
              ))}
            </div>
            {sortedTestimonials.length > 1 && (
              <button
                type="button"
                aria-label="More reviews"
                onClick={scrollTestimonials}
                className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#64748B] shadow-sm transition-colors hover:bg-[#F9FAFB] hover:text-[#0F172A]"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function TestimonialCard({
  testimonial: t,
}: {
  testimonial: SocialProofSettings["testimonials"][number];
}) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncate = t.review.length > REVIEW_TRUNCATE_LENGTH;
  const displayText = expanded || !needsTruncate
    ? t.review
    : t.review.slice(0, REVIEW_TRUNCATE_LENGTH) + "…";

  return (
    <div
      className="w-[300px] shrink-0 snap-start rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:w-[320px]"
    >
      <div className="flex items-start gap-3">
        {t.avatar ? (
          <img
            src={t.avatar}
            alt=""
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E5E7EB] text-sm font-semibold text-[#64748B]"
            aria-hidden
          >
            {t.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#0F172A]">{t.name}</p>
          <div className="mt-1 flex items-center gap-2">
            <StarRating rating={t.rating} />
            {t.date && (
              <span className="text-xs text-[#64748B]">{t.date}</span>
            )}
          </div>
        </div>
      </div>
      <p className="mt-3 text-[14px] leading-relaxed text-[#334155]">
        &ldquo;{displayText}&rdquo;
      </p>
      {needsTruncate && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-1 text-[13px] font-medium text-[#2563EB] hover:underline focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-1"
        >
          Read more
        </button>
      )}
      <div className="mt-4 flex items-center gap-1.5 text-[12px] text-[#64748B]">
        <GoogleGIcon className="h-3.5 w-3.5" />
        <span>Posted on Google</span>
      </div>
    </div>
  );
}
