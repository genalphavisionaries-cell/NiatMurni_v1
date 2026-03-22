import type { PublicCmsHomepageSection } from "@/lib/public-cms";
import { cmsString } from "@/lib/public-cms";
import { extraString, parseJsonSafe } from "../utils";
import Link from "next/link";

type Testimonial = {
  name: string;
  review: string;
  rating?: number;
  date?: string;
};

function Stars({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
  const r = Math.min(5, Math.max(0, Math.round(rating)));
  const cls = size === "sm" ? "text-xs text-[#F59E0B]" : "text-sm text-[#F59E0B]";
  return (
    <span className={cls} aria-hidden>
      {"★".repeat(r)}{"☆".repeat(5 - r)}
    </span>
  );
}

/** Google source badge — pure HTML, no SVG paths, zero overlap risk */
function GoogleBadge({ variant = "card" }: { variant?: "card" | "bar" }) {
  if (variant === "bar") {
    return (
      <div className="flex items-center gap-2" aria-label="Google Reviews">
        <span
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#4285F4] text-[13px] font-bold text-white leading-none select-none"
          aria-hidden
        >
          G
        </span>
        <span className="text-sm font-semibold text-[#0F172A]">Google Reviews</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#4285F4] text-[9px] font-bold text-white leading-none select-none"
        aria-hidden
      >
        G
      </span>
      <span className="text-[11px] text-[#94A3B8]">Posted on Google</span>
    </div>
  );
}

/** Avatar circle — letter initial with a soft background */
function Avatar({ name }: { name: string }) {
  const letter = (name ?? "?").trim().slice(0, 1).toUpperCase();
  const COLORS = [
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-violet-100 text-violet-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
  ];
  const idx = letter.charCodeAt(0) % COLORS.length;
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${COLORS[idx]}`}
    >
      {letter}
    </div>
  );
}

export default function TestimonialsSection({ section }: { section: PublicCmsHomepageSection }) {
  const title = cmsString(section.title) ?? "Kepercayaan & Ulasan";
  const subtitle = cmsString(section.subtitle) ?? cmsString(section.description);

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

  const brands =
    parseJsonSafe<string[]>(extraString(section.extra_data, "brands_json")) ??
    ["Google Reviews", "KKM", "Dipercayai", "Kualiti", "Respons Pantas", "Seluruh Malaysia"];

  if (!cmsString(title) && !subtitle && !visible.length) return null;

  return (
    <section id="testimonials" className="bg-[#F8FAFC] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Section heading ── */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-3 text-base leading-relaxed text-[#64748B]">
              {subtitle}
            </p>
          ) : null}
        </div>

        {/* ── Google rating summary card ── */}
        <div className="mt-10 flex justify-center">
          <div className="flex w-full max-w-2xl flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm sm:flex-row sm:gap-6">

            {/* Google badge */}
            <GoogleBadge variant="bar" />

            {/* Divider */}
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            {/* Rating number + stars */}
            <div className="flex items-center gap-3">
              <span className="text-4xl font-extrabold leading-none text-[#0F172A]">
                {summaryRating.toFixed(1)}
              </span>
              <div className="flex flex-col">
                <Stars rating={summaryRating} />
                <span className="mt-0.5 text-[11px] text-[#64748B]">
                  {summaryCount.toLocaleString("en-US")} ulasan
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            {/* CTA */}
            <Link
              href="https://www.google.com/search?q=Niat+Murni+Academy+reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#2563EB] px-4 py-1.5 text-xs font-semibold text-[#2563EB] transition hover:bg-[#EFF6FF]"
            >
              Lihat Semua Ulasan
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* ── Brand trust marquee ── */}
        <div className="mt-6 overflow-hidden">
          <div
            className="flex gap-3 animate-[marquee_22s_linear_infinite]"
            style={{ width: "max-content" }}
          >
            {Array.from({ length: 2 }).flatMap((_, rep) =>
              brands.map((b, i) => (
                <div
                  key={`${rep}-${b}-${i}`}
                  className="flex h-9 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-xs font-medium text-[#475569] whitespace-nowrap shadow-sm"
                >
                  {b}
                </div>
              ))
            )}
          </div>
        </div>

        <style>{`
          @keyframes marquee {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>

        {/* ── Testimonial cards ── */}
        {visible.length ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.slice(0, 9).map((t, idx) => {
              const rating = typeof t.rating === "number" ? t.rating : summaryRating;
              return (
                <div
                  key={`${t.name}-${idx}`}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_4px_rgba(15,23,42,0.06)] transition hover:shadow-[0_4px_16px_rgba(15,23,42,0.10)]"
                >
                  {/* Row 1: avatar + name + date */}
                  <div className="flex items-start gap-3">
                    <Avatar name={t.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#0F172A]">{t.name}</p>
                      {t.date ? (
                        <p className="mt-0.5 text-[11px] text-[#94A3B8]">{t.date}</p>
                      ) : null}
                    </div>
                  </div>

                  {/* Row 2: stars */}
                  <div className="mt-3">
                    <Stars rating={rating} size="sm" />
                  </div>

                  {/* Row 3: review text */}
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-[#475569]">
                    &ldquo;{t.review}&rdquo;
                  </p>

                  {/* Row 4: source — pure HTML badge, zero overlap */}
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <GoogleBadge variant="card" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* ── Bottom CTA ── */}
        {visible.length ? (
          <div className="mt-10 flex justify-center">
            <Link
              href="/#classes"
              className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D4ED8]"
            >
              Daftar kelas seterusnya
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
