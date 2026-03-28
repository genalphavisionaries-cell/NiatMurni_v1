"use client";

import type { CSSProperties } from "react";
import type { PublicCmsHomepageSection, PublicCmsTheme } from "@/lib/public-cms";
import { cmsString } from "@/lib/public-cms";
import { getSectionColor } from "@/lib/cms-section-colors";
import { cmsPlainTextForAttribute } from "@/lib/sanitize-cms-html";
import { extraString, parseJsonSafe, safeHref } from "../utils";
import { safeTrim, safeStringTrim } from "@/lib/safe-string-utils";
import { useRef, useState } from "react";
import { SafeCmsHtml } from "../SafeCmsHtml";

type Testimonial = {
  name: string;
  review: string;
  rating?: number;
  date?: string;
};

type BrandItem = {
  company_name: string;
  logo?: string | null;
  image_alt?: string | null;
};

const REVIEW_TRUNCATE_LENGTH = 120;

function Stars({
  rating,
  size = "md",
  starColor,
}: {
  rating: number;
  size?: "md" | "lg";
  starColor: string;
}) {
  const r = Math.min(5, Math.max(0, Math.round(rating)));
  const cls = size === "lg" ? "text-xl" : "text-sm";
  return (
    <span className={cls} style={{ color: starColor }} aria-hidden>
      {"★".repeat(r)}{"☆".repeat(5 - r)}
    </span>
  );
}

function GoogleGMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-white text-lg font-semibold ${className}`}
      style={{ color: "#4285F4" }}
      aria-hidden
    >
      G
    </span>
  );
}

function plainText(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
}

function normalizeBrands(raw: unknown): BrandItem[] {
  if (!Array.isArray(raw)) return [];
  const out: BrandItem[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      // Legacy format: array of strings
      const name = safeTrim(item);
      if (name) out.push({ company_name: name, logo: null });
      continue;
    }
    if (item && typeof item === "object") {
      // New format: array of objects with company_name and logo
      const o = item as Record<string, unknown>;
      const company_name = safeStringTrim(o.company_name ?? o.title ?? o.name);
      if (!company_name) continue;
      const logo = safeStringTrim(o.logo ?? o.image_url) || null;
      const image_alt = safeStringTrim(o.image_alt) || null;
      out.push({ company_name, logo, image_alt });
    }
  }
  return out;
}

export default function TestimonialsSection({
  section,
  theme,
}: {
  section: PublicCmsHomepageSection;
  theme: PublicCmsTheme;
}) {
  const colors = getSectionColor(section, theme);
  const title = cmsString(section.title) ?? "";
  const subtitle = cmsString(section.subtitle) ?? cmsString(section.description) ?? "";
  const googleReviewLabel = cmsString(section.button_primary_label);
  const googleReviewUrl = safeHref(section.button_primary_url);
  const testimonialRef = useRef<HTMLDivElement>(null);

  const items =
    parseJsonSafe<Testimonial[]>(extraString(section.extra_data, "items_json")) ?? [];
  const visible = items.filter((t) => cmsString(t?.name) && cmsString(t?.review));

  type Summary = { rating?: number; count?: number };
  const summaryJson = parseJsonSafe<Summary>(
    extraString(section.extra_data, "review_summary_json")
  );
  const summaryRating =
    typeof summaryJson?.rating === "number" && summaryJson.rating > 0 ? summaryJson.rating : null;
  const summaryCount =
    typeof summaryJson?.count === "number" && summaryJson.count > 0 ? summaryJson.count : null;
  const hasSummary = summaryRating !== null || summaryCount !== null;

  const brandsParsed = parseJsonSafe<unknown[]>(extraString(section.extra_data, "brands_json")) ?? [];
  const brandItems = normalizeBrands(brandsParsed);

  const scrollTestimonials = () => {
    if (testimonialRef.current) {
      testimonialRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  const showReviewCta = Boolean(googleReviewLabel && googleReviewUrl);
  if (
    !cmsString(title) &&
    !subtitle &&
    !visible.length &&
    !brandItems.length &&
    !hasSummary &&
    !showReviewCta
  ) {
    return null;
  }

  return (
    <section
      id="testimonials"
      className="bg-[#F8FAFC] py-20"
      style={
        {
          paddingTop: 80,
          paddingBottom: 80,
          ["--section-accent" as string]: colors.accent,
        } as CSSProperties
      }
      aria-labelledby={title ? "social-proof-heading" : undefined}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="text-center">
          {title ? (
            <div id="social-proof-heading" className="text-2xl font-bold text-[#0F172A] sm:text-3xl" role="heading" aria-level={2}>
              <SafeCmsHtml html={title} className="max-w-none [&_p]:m-0" />
            </div>
          ) : null}
          {subtitle ? (
            <div className="mx-auto mt-3 max-w-2xl text-[#64748B] [&_a]:text-[color:var(--section-accent)] [&_a]:underline">
              <SafeCmsHtml html={subtitle} className="max-w-none prose-p:my-2" />
            </div>
          ) : null}
        </header>

        <div className="relative mt-10 flex items-center justify-center overflow-hidden">
          <div
            className="flex w-full snap-x snap-mandatory items-center gap-6 overflow-x-auto scroll-smooth py-2 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {brandItems.map((item, i) => (
              <div
                key={`${item.company_name}-${i}`}
                className="flex h-[72px] w-[120px] min-w-[120px] shrink-0 snap-center items-center justify-center rounded-lg border border-[#E5E8F0] bg-[#FAFAFA] transition-colors hover:border-[#CBD5E1] hover:bg-white"
              >
                {item.logo ? (
                  <img
                    src={item.logo}
                    alt={cmsPlainTextForAttribute(item.image_alt) || item.company_name}
                    className="max-h-12 w-auto max-w-[90%] object-contain opacity-80 transition-opacity hover:opacity-100"
                    loading="lazy"
                  />
                ) : (
                  <span className="line-clamp-2 px-2 text-center text-xs font-medium text-[#94A3B8]">
                    {item.company_name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {hasSummary || showReviewCta ? (
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] px-6 py-5">
            {hasSummary ? (
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <GoogleGMark className="h-8 w-8" />
                  <span className="text-base font-semibold text-[#0F172A]">Google Rating</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {summaryRating !== null ? (
                    <span className="text-2xl font-bold text-[#0F172A]">{summaryRating.toFixed(1)}</span>
                  ) : null}
                  {summaryRating !== null ? (
                    <Stars rating={summaryRating} size="lg" starColor={colors.accent} />
                  ) : null}
                  {summaryCount !== null ? (
                    <span className="text-sm text-[#64748B]">{summaryCount.toLocaleString("en-US")} reviews</span>
                  ) : null}
                </div>
              </div>
            ) : null}
            {showReviewCta ? (
              <a
                href={googleReviewUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors hover:brightness-95 focus:outline focus:outline-2 focus:outline-offset-2"
                style={{
                  backgroundColor: colors.buttonBg,
                  color: colors.buttonText,
                  outlineColor: colors.accent,
                }}
              >
                {googleReviewLabel}
              </a>
            ) : null}
          </div>
        ) : null}

        {visible.length ? (
          <div className="relative mt-8">
            <div
              ref={testimonialRef}
              className="flex gap-6 overflow-x-auto scroll-smooth pb-2 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none" }}
            >
              {visible.map((t, idx) => (
                <TestimonialCard
                  key={`${cmsPlainTextForAttribute(t.name) || t.name}-${idx}`}
                  testimonial={t}
                  fallbackRating={summaryRating ?? 0}
                  summaryPresent={summaryRating !== null}
                  accentColor={colors.accent}
                />
              ))}
            </div>
            {visible.length > 1 ? (
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
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function TestimonialCard({
  testimonial: t,
  fallbackRating,
  summaryPresent,
  accentColor,
}: {
  testimonial: Testimonial;
  fallbackRating: number;
  summaryPresent: boolean;
  accentColor: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const fullReview = plainText(t.review);
  const needsTruncate = fullReview.length > REVIEW_TRUNCATE_LENGTH;
  const displayText = expanded || !needsTruncate
    ? fullReview
    : fullReview.slice(0, REVIEW_TRUNCATE_LENGTH) + "…";
  const rating =
    typeof t.rating === "number"
      ? t.rating
      : summaryPresent && fallbackRating > 0
        ? fallbackRating
        : 0;
  const name = cmsPlainTextForAttribute(t.name) || t.name;

  return (
    <div className="w-[300px] shrink-0 snap-start rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:w-[320px]">
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E5E7EB] text-sm font-semibold text-[#64748B]"
          aria-hidden
        >
          {(name || "?").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#0F172A]">{name}</p>
          <div className="mt-1 flex items-center gap-2">
            {rating > 0 ? <Stars rating={rating} starColor={accentColor} /> : null}
            {t.date ? <span className="text-xs text-[#64748B]">{t.date}</span> : null}
          </div>
        </div>
      </div>
      <p className="mt-3 text-[14px] leading-relaxed text-[#334155]">
        &ldquo;{displayText}&rdquo;
      </p>
      {needsTruncate && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-1 text-[13px] font-medium hover:underline focus:outline focus:outline-2 focus:outline-offset-1"
          style={{ color: accentColor, outlineColor: accentColor }}
        >
          Read more
        </button>
      ) : null}
    </div>
  );
}
