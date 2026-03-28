"use client";

import type { CSSProperties } from "react";
import type { PublicCmsHomepageSection, PublicCmsTheme } from "@/lib/public-cms";
import { cmsString } from "@/lib/public-cms";
import { getSectionColor } from "@/lib/cms-section-colors";
import { extraString, parseJsonSafe, safeHref } from "../utils";
import { safeTrim } from "@/lib/safe-string-utils";
import { useMemo } from "react";
import { SafeCmsHtml } from "../SafeCmsHtml";
import { cmsPlainTextForAttribute } from "@/lib/sanitize-cms-html";

type Item = {
  title: string;
  description?: string;
  icon?: string;
  background_color?: string;
  icon_alt?: string;
};

function iconSvg(path: React.ReactNode, accent: string) {
  return (
    <svg className="h-5 w-5" style={{ color: accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      {path}
    </svg>
  );
}

function benefitIcons(accent: string): Record<string, React.ReactNode> {
  return {
  clock: iconSvg(
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
      accent
    ),
  award: iconSvg(
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />,
      accent
    ),
  shield: iconSvg(
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
      accent
    ),
  monitor: iconSvg(
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
      accent
    ),
  certificate: iconSvg(
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />,
      accent
    ),
  };
}

function BenefitIcon({
  name,
  icons,
  alt,
}: {
  name?: string;
  icons: Record<string, React.ReactNode>;
  alt?: string | null;
}) {
  const iconUrl = safeHref(name ?? null);
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={cmsPlainTextForAttribute(alt) || ""}
        className="h-5 w-5 object-contain"
        loading="lazy"
      />
    );
  }
  return <>{icons[name ?? ""] ?? icons.award}</>;
}

function UspCard({ item, icons }: { item: Item; icons: Record<string, React.ReactNode> }) {
  const cardBg = safeTrim(item.background_color ?? "") || "#F3F4F6";
  return (
    <div className="flex gap-4 rounded-[14px] bg-white p-[18px] shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px]"
        style={{ width: 44, height: 44, backgroundColor: cardBg }}
      >
        <BenefitIcon name={item.icon} icons={icons} alt={item.icon_alt} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-[#0F172A] [&_a]:text-[color:var(--section-accent)] [&_a]:underline">
          <SafeCmsHtml html={item.title} className="max-w-none [&_p]:m-0" />
        </div>
        {item.description ? (
          <div className="mt-1 text-sm leading-relaxed text-[#64748B] [&_a]:text-[color:var(--section-accent)] [&_a]:underline">
            <SafeCmsHtml html={item.description} className="max-w-none prose-p:my-1" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function WhyChooseUsSection({
  section,
  theme,
}: {
  section: PublicCmsHomepageSection;
  theme: PublicCmsTheme;
}) {
  const colors = getSectionColor(section, theme);
  const benefitIconSet = useMemo(() => benefitIcons(colors.accent), [colors.accent]);
  const title = cmsString(section.title);
  const desc1 = cmsString(section.subtitle);
  const desc2 = cmsString(section.description);

  const items =
    parseJsonSafe<Item[]>(extraString(section.extra_data, "items_json")) ?? [];

  const visibleItems = items
    .filter((i) => cmsString(i?.title))
    .slice(0, 4);

  const bannerImages = useMemo(() => {
    const parsed = parseJsonSafe<string[]>(extraString(section.extra_data, "banner_images_json"));
    const urls = (parsed ?? [])
      .map((u) => safeHref(u))
      .filter((u): u is string => !!u);
    const fallback = safeHref(section.image_url);
    return urls.length ? urls : fallback ? [fallback] : [];
  }, [section.image_url, section.extra_data]);

  if (!title && !visibleItems.length && !bannerImages.length) return null;

  return (
    <section
      id="why_choose_us"
      className="py-20"
      style={
        {
          background: "#F9FAFB",
          paddingTop: 80,
          paddingBottom: 80,
          ["--section-accent" as string]: colors.accent,
        } as CSSProperties
      }
      aria-labelledby={title ? "why-choose-heading" : undefined}
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center lg:mb-12">
          {title ? (
            <div id="why-choose-heading" className="text-2xl font-bold text-[#0F172A] sm:text-3xl" role="heading" aria-level={2}>
              <SafeCmsHtml html={title} className="max-w-none [&_p]:m-0" />
            </div>
          ) : null}
          {(desc1 || desc2) ? (
            <div className="mx-auto mt-3 max-w-2xl text-[#64748B] sm:text-lg [&_a]:text-[color:var(--section-accent)] [&_a]:underline">
              {desc1 ? <SafeCmsHtml html={desc1} className="max-w-none prose-p:my-2" /> : null}
              {desc2 ? <SafeCmsHtml html={desc2} className="mt-2 max-w-none prose-p:my-2" /> : null}
            </div>
          ) : null}
        </header>

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-[48px]">
          <div className="order-2 space-y-4 lg:order-1">
            {visibleItems.map((it, idx) => (
              <UspCard key={`${it.title}-${idx}`} item={it} icons={benefitIconSet} />
            ))}
          </div>

          <div className="order-1 lg:order-2">
            {bannerImages[0] ? (
              <div
                className="relative overflow-hidden rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
                style={{ borderRadius: 20, boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }}
              >
                <div className="aspect-[3/2] w-full">
                  <img
                    src={bannerImages[0]}
                    alt="Why us banner"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            ) : (
              <div
                className="flex aspect-[3/2] w-full items-center justify-center rounded-[20px] bg-[#E2E8F0] text-[#64748B]"
                style={{ borderRadius: 20, boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }}
              >
                <span className="text-sm">Banner image (upload in admin)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
