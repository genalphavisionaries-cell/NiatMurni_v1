"use client";

import type { PublicCmsHomepageSection } from "@/lib/public-cms";
import { cmsString } from "@/lib/public-cms";
import { cmsPlainTextForAttribute } from "@/lib/sanitize-cms-html";
import { extraString, parseJsonSafe } from "../utils";
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
};

const GOOGLE_REVIEW_URL = "https://www.google.com/search?q=Niat+Murni+Academy+reviews";
const REVIEW_TRUNCATE_LENGTH = 120;

function Stars({ rating, size = "md" }: { rating: number; size?: "md" | "lg" }) {
  const r = Math.min(5, Math.max(0, Math.round(rating)));
  const cls = size === "lg" ? "text-xl text-[#EAB308]" : "text-sm text-[#EAB308]";
  return (
    <span className={cls} aria-hidden>
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
      const name = item.trim();
      if (name) out.push({ company_name: name, logo: null });
      continue;
    }
    if (item && typeof item === "object") {
      // New format: array of objects with company_name and logo
      const o = item as Record<string, unknown>;
      const company_name = String(o.company_name ?? o.title ?? o.name ?? "").trim();
      if (!company_name) continue;
      const logo = String(o.logo ?? o.image_url ?? "").trim() || null;
      out.push({ company_name, logo });
    }
  }
  return out;
}

export default function TestimonialsSection({ section }: { section: PublicCmsHomepageSection }) {
  const title = cmsString(section.title) ?? "Kepercayaan & Ulasan Peserta";
  const subtitle = cmsString(section.subtitle) ?? cmsString(section.description) ?? "";
  const testimonialRef = useRef<HTMLDivElement>(null);

  const items =
    parseJsonSafe<Testimonial[]>(extraString(section.extra_data, "items_json")) ?? [];
  const visible = items.filter((t) => cmsString(t?.name) && cmsString(t?.review));

  type Summary = { rating?: number; count?: number };
  const summaryJson = parseJsonSafe<Summary>(
    extraString(section.extra_data, "review_summary_json")
  );
  const summaryRating =
    typeof summaryJson?.rating === "number" && summaryJson.rating > 0
      ? summaryJson.rating
      : 4.8;
  const summaryCount =
    typeof summaryJson?.count === "number" && summaryJson.count > 0
      ? summaryJson.count
      : 2500;

  const brandsParsed = parseJsonSafe<unknown[]>(extraString(section.extra_data, "brands_json")) ?? [];
  const brands = normalizeBrands(brandsParsed);
  const brandItems = brands.length
    ? brands
    : [
        { company_name: "Google Reviews", logo: null },
        { company_name: "KKM", logo: null },
        { company_name: "Dipercayai", logo: null },
        { company_name: "Kualiti", logo: null },
        { company_name: "Respons Pantas", logo: null },
      ];

  const scrollTestimonials = () => {
    if (testimonialRef.current) {
      testimonialRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  if (!cmsString(title) && !subtitle && !visible.length && !brandItems.length) return null;

  return (
    <section
      id="testimonials"
      className="bg-[#F8FAFC] py-20"
      style={{ paddingTop: 80, paddingBottom: 80 }}
      aria-labelledby="social-proof-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="text-center">
          <div id="social-proof-heading" className="text-2xl font-bold text-[#0F172A] sm:text-3xl" role="heading" aria-level={2}>
            <SafeCmsHtml html={title} className="max-w-none [&_p]:m-0" />
          </div>
          {subtitle ? (
            <div className="mx-auto mt-3 max-w-2xl text-[#64748B] [&_a]:text-[#2563EB] [&_a]:underline">
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
                    alt={item.company_name}
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

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] px-6 py-5">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <GoogleGMark className="h-8 w-8" />
              <span className="text-base font-semibold text-[#0F172A]">Google Rating</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-[#0F172A]">{summaryRating.toFixed(1)}</span>
              <Stars rating={summaryRating} size="lg" />
              <span className="text-sm text-[#64748B]">{summaryCount.toLocaleString("en-US")} reviews</span>
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
                  fallbackRating={summaryRating}
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
}: {
  testimonial: Testimonial;
  fallbackRating: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const fullReview = plainText(t.review);
  const needsTruncate = fullReview.length > REVIEW_TRUNCATE_LENGTH;
  const displayText = expanded || !needsTruncate
    ? fullReview
    : fullReview.slice(0, REVIEW_TRUNCATE_LENGTH) + "…";
  const rating = typeof t.rating === "number" ? t.rating : fallbackRating;
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
            <Stars rating={rating} />
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
          className="mt-1 text-[13px] font-medium text-[#2563EB] hover:underline focus:outline focus:outline-2 focus:outline-[#2563EB] focus:outline-offset-1"
        >
          Read more
        </button>
      ) : null}
    </div>
  );
}
