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
  card_color?: string;
  image_alt?: string;
};

export default function PromotionsSection({
  section,
  theme,
}: {
  section: PublicCmsHomepageSection;
  theme: PublicCmsTheme;
}) {
  const colors = getSectionColor(section, theme);
  const topBanner =
    cmsString(section.subtitle) ?? cmsString(extraString(section.extra_data, "banner_text"));
  const title = cmsString(section.title);
  const description =
    cmsString(section.description) ?? cmsString(extraString(section.extra_data, "description_2"));

  const promos = parseJsonSafe<PromoItem[]>(extraString(section.extra_data, "promos_json")) ?? [];
  const bannerImages = parseJsonSafe<string[]>(
    extraString(section.extra_data, "banner_images_json")
  ) ?? [];

  const visible = promos.filter((p: PromoItem) => cmsString(p.title) || cmsString(p.description)).slice(0, 3);
  const stripImage =
    safeHref(section.image_url) ??
    safeHref(bannerImages[0] ?? null) ??
    safeHref(visible[0]?.image_url ?? null);
  const stripLink =
    safeHref(visible[0]?.button_url) ??
    safeHref(section.button_primary_url) ??
    "#";

  return (
    <>
      <section className="px-4 py-6 sm:px-6 lg:px-8" aria-label="Promotion">
        <div className="mx-auto max-w-7xl">
          <Link
            href={stripLink || "#"}
            className="block w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card"
          >
            <div className="aspect-[3/1] min-h-[100px] max-h-[200px] w-full overflow-hidden sm:max-h-[160px]">
              {stripImage ? (
                <img
                  src={stripImage}
                  alt={cmsPlainTextForAttribute(topBanner) || ""}
                  className="h-full w-full object-cover object-center"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full min-h-[120px] items-center justify-center bg-gradient-to-r from-slate-200/40 to-slate-100/50 text-slate-600">
                  <span className="text-sm font-medium">
                    {cmsPlainTextForAttribute(topBanner) || ""}
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
            {title ? (
              <div
                className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl [&_a]:text-[color:var(--section-accent)] [&_a]:underline"
                role="heading"
                aria-level={2}
              >
                <SafeCmsHtml html={title} className="max-w-none [&_p]:m-0" />
              </div>
            ) : null}
            {description ? (
              <div className="mx-auto mt-2 max-w-xl text-sm text-slate-600 [&_a]:text-[color:var(--section-accent)] [&_a]:underline">
                <SafeCmsHtml html={description} className="max-w-none prose-p:my-1" />
              </div>
            ) : null}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p: PromoItem, idx: number) => {
              const img = cmsString(p.image_url) ?? "";
              const btnLabel = cmsString(p.button_label) ?? "";
              const btnUrl = safeHref(p.button_url) ?? "#";
              const pTitle = cmsString(p.title) ?? "";
              const pDesc = cmsString(p.description) ?? "";
              const cardColor = cmsString(p.card_color);
              const imgAlt = cmsString(p.image_alt);

              return (
                <Link
                  key={`promo-${idx}-${cmsPlainTextForAttribute(pTitle) || "card"}`}
                  href={btnUrl}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card transition hover:shadow-card-hover"
                  style={
                    cardColor ? ({ borderColor: cardColor } as CSSProperties) : undefined
                  }
                >
                  <div className="relative aspect-[16/10] bg-slate-100">
                    {img ? (
                      <img
                        src={img}
                        alt={cmsPlainTextForAttribute(imgAlt) || cmsPlainTextForAttribute(pTitle) || ""}
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
                    {btnLabel ? (
                      <span
                        className="mt-3 inline-flex items-center text-sm font-semibold transition group-hover:opacity-90"
                        style={{ color: colors.accent }}
                      >
                        <SafeCmsHtml as="span" html={btnLabel} className="[&_p]:m-0 [&_p]:inline" />
                        <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    ) : null}
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
