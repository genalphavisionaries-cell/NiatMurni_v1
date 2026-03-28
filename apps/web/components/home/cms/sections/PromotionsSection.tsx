import type { CSSProperties } from "react";
import type { PublicCmsHomepageSection, PublicCmsTheme } from "@/lib/public-cms";
import { cmsString } from "@/lib/public-cms";
import { getSectionColor } from "@/lib/cms-section-colors";
import { cmsPlainTextForAttribute } from "@/lib/sanitize-cms-html";
import { extraString, parseJsonSafe, safeHref } from "../utils";
import Link from "next/link";
import { SafeCmsHtml } from "../SafeCmsHtml";

type PromoItem = {
  image_url?: string;
  title?: string;
  description?: string;
  button_label?: string;
  button_url?: string;
};

const DEFAULT_PROMOS: PromoItem[] = [
  {
    title: "Sijil Sah KKM",
    description: "Daftar sekarang untuk latihan pengendalian makanan yang diakreditkan.",
    button_label: "Book now",
    button_url: "/#classes",
  },
  {
    title: "Pilihan Online & Fizikal",
    description: "Pilih mod delivery yang sesuai dengan jadual anda.",
    button_label: "Get a quote",
    button_url: "/#contact",
  },
  {
    title: "Kelas Cepat & Mudah",
    description: "Proses pendaftaran ringkas dan respons pantas.",
    button_label: "View schedule",
    button_url: "/#classes",
  },
];

export default function PromotionsSection({
  section,
  theme,
}: {
  section: PublicCmsHomepageSection;
  theme: PublicCmsTheme;
}) {
  const colors = getSectionColor(section, theme);
  const topBanner = cmsString(section.subtitle) ?? extraString(section.extra_data, "banner_text") ?? "Promosi Terhad";
  const title = cmsString(section.title) ?? "Cadangan Promosi";
  const description = cmsString(section.description) ?? extraString(section.extra_data, "description_2");

  const promos =
    parseJsonSafe<PromoItem[]>(extraString(section.extra_data, "promos_json")) ??
    DEFAULT_PROMOS;

  const visible = promos.filter((p) => cmsString(p.title) || cmsString(p.description)).slice(0, 3);
  const stripImage = safeHref(section.image_url) ?? safeHref(visible[0]?.image_url ?? null);
  const stripLink = safeHref(visible[0]?.button_url ?? "/#classes") ?? "/#classes";

  return (
    <>
      <section className="px-4 py-6 sm:px-6 lg:px-8" aria-label="Promotion">
        <div className="mx-auto max-w-7xl">
          <Link
            href={stripLink}
            className="block w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card"
          >
            <div className="aspect-[3/1] min-h-[100px] max-h-[200px] w-full overflow-hidden sm:max-h-[160px]">
              {stripImage ? (
                <img
                  src={stripImage}
                  alt={cmsPlainTextForAttribute(topBanner) || "Promotion"}
                  className="h-full w-full object-cover object-center"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full min-h-[120px] items-center justify-center bg-gradient-to-r from-slate-200/40 to-slate-100/50 text-slate-600">
                  <span className="text-sm font-medium">
                    {cmsPlainTextForAttribute(topBanner) || "Promo banner slot — upload in admin"}
                  </span>
                </div>
              )}
            </div>
          </Link>
        </div>
      </section>

      <section
        id="promotions"
        className="bg-white py-12 sm:py-14"
        aria-label="Promotions"
        style={{ ["--section-accent" as string]: colors.accent } as CSSProperties}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div
              className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl [&_a]:text-[color:var(--section-accent)] [&_a]:underline"
              role="heading"
              aria-level={2}
            >
              <SafeCmsHtml html={title} className="max-w-none [&_p]:m-0" />
            </div>
            {description ? (
              <div className="mx-auto mt-2 max-w-xl text-sm text-slate-600 [&_a]:text-[color:var(--section-accent)] [&_a]:underline">
                <SafeCmsHtml html={description} className="max-w-none prose-p:my-1" />
              </div>
            ) : null}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p, idx) => {
              const img = cmsString(p.image_url) ?? "";
              const btnLabel = cmsString(p.button_label) ?? "Daftar Sekarang";
              const btnUrl = safeHref(p.button_url ?? "/#classes") ?? "/#classes";
              const pTitle = cmsString(p.title) ?? `Promo ${idx + 1}`;
              const pDesc = cmsString(p.description) ?? "";

              return (
                <Link
                  key={`${pTitle}-${idx}`}
                  href={btnUrl}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card transition hover:shadow-card-hover"
                >
                  <div className="relative aspect-[16/10] bg-slate-100">
                    {img ? (
                      <img
                        src={img}
                        alt={cmsPlainTextForAttribute(pTitle) || "Promotion"}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50">
                        <span className="text-4xl opacity-30">✨</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                  </div>

                  <div className="p-5">
                    <div className="text-base font-semibold text-slate-900 [&_a]:text-[color:var(--section-accent)] [&_a]:underline">
                      <SafeCmsHtml html={pTitle} className="max-w-none [&_p]:m-0" />
                    </div>
                    {pDesc ? (
                      <div className="mt-1 text-sm text-slate-600 [&_a]:text-[color:var(--section-accent)] [&_a]:underline">
                        <SafeCmsHtml html={pDesc} className="max-w-none prose-p:my-1" />
                      </div>
                    ) : null}
                    <span
                      className="mt-3 inline-flex items-center text-sm font-semibold transition group-hover:opacity-90"
                      style={{ color: colors.accent }}
                    >
                      <SafeCmsHtml as="span" html={btnLabel} className="[&_p]:m-0 [&_p]:inline" />
                      <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
