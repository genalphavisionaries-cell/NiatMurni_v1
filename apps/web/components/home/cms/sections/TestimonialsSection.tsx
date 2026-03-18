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

function Stars({ rating }: { rating: number }) {
  const r = Math.min(5, Math.max(0, Math.round(rating)));
  return (
    <span className="text-sm text-[#F59E0B]" aria-hidden>
      {"★".repeat(r)}
    </span>
  );
}

export default function TestimonialsSection({ section }: { section: PublicCmsHomepageSection }) {
  const title = cmsString(section.title) ?? "Kepercayaan & Ulasan";
  const subtitle = cmsString(section.subtitle) ?? cmsString(section.description);

  const items =
    parseJsonSafe<Testimonial[]>(extraString(section.extra_data, "items_json")) ?? [];
  const visible = items.filter((t) => cmsString(t?.name) && cmsString(t?.review));

  type Summary = { rating?: number; count?: number; };
  const summaryJson = parseJsonSafe<Summary>(extraString(section.extra_data, "review_summary_json"));
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
    ["Google Reviews", "KKM", "Trusted", "Quality", "Fast Response", "Nationwide"];

  if (!cmsString(title) && !subtitle && !visible.length) return null;

  return (
    <section id="testimonials" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-4 text-lg leading-relaxed text-[#64748B]">
              {subtitle}
            </p>
          ) : null}
        </div>

        {/* Brand logo carousel + review summary */}
        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-slate-200 bg-[#F8FAFC] p-5">
              <p className="text-sm font-semibold text-[#0F172A]">Jenama Terpercaya</p>
              <div className="mt-4 overflow-hidden">
                <div className="flex gap-4 animate-[marquee_18s_linear_infinite]" style={{ width: "max-content" }}>
                  {Array.from({ length: 2 }).flatMap((_, rep) =>
                    brands.map((b, i) => (
                      <div
                        key={`${rep}-${b}-${i}`}
                        className="flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#0F172A] whitespace-nowrap"
                      >
                        {b}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <style>{`
                @keyframes marquee {
                  0% {
                    transform: translateX(0);
                  }
                  100% {
                    transform: translateX(-50%);
                  }
                }
              `}</style>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">Ringkasan Ulasan</p>
                  <p className="mt-1 text-sm text-[#64748B]">
                    Berdasarkan {summaryCount.toLocaleString("en-US")} ulasan
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-4xl font-extrabold text-[#0F172A] leading-none">
                    {summaryRating.toFixed(1)}
                  </div>
                  <div>
                    <Stars rating={summaryRating} />
                    <p className="mt-1 text-xs font-medium text-[#64748B]">Google-style reviews</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-[#F8FAFC] p-4">
                <p className="text-sm font-semibold text-[#0F172A]">Apa yang pelanggan suka</p>
                <ul className="mt-2 space-y-2 text-sm text-[#64748B]">
                  <li>✓ Proses daftar yang mudah & cepat</li>
                  <li>✓ Penyampaian kelas jelas dan praktikal</li>
                  <li>✓ Masa pemprosesan sijil yang pantas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {visible.length ? (
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {visible.slice(0, 9).map((t, idx) => {
              const avatarLetter = (t.name ?? "?").trim().slice(0, 1).toUpperCase();
              const rating = typeof t.rating === "number" ? t.rating : summaryRating;
              return (
                <div
                  key={`${t.name}-${idx}`}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F8FAFC] border border-slate-200 text-sm font-bold text-[#0F172A]">
                        {avatarLetter}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#0F172A]">{t.name}</p>
                        {t.date ? <p className="mt-1 text-xs text-[#64748B]">{t.date}</p> : null}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <Stars rating={rating} />
                      <span className="mt-1 text-[11px] font-semibold text-[#2563EB]">Verified</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-[#64748B]">
                    &ldquo;{t.review}&rdquo;
                  </p>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Lightweight bottom action to drive conversions if testimonials load */}
        {visible.length ? (
          <div className="mt-10 flex justify-center">
            <Link
              href="/#classes"
              className="inline-flex items-center justify-center rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D4ED8]"
            >
              Daftar kelas seterusnya →
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

