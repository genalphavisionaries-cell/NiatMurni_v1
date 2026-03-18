 "use client";

import type { PublicCmsHomepageSection } from "@/lib/public-cms";
import { cmsString } from "@/lib/public-cms";
import { extraString, parseJsonSafe, safeHref } from "../utils";
import { useEffect, useMemo, useState } from "react";

type Item = { title: string; description?: string };

function UspCard({ item }: { item: Item }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#92400E]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M20 6 9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#0F172A]">{item.title}</h3>
          {item.description ? (
            <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
              {item.description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function WhyChooseUsSection({ section }: { section: PublicCmsHomepageSection }) {
  const title = cmsString(section.title) ?? "Kenapa Kami";
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

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (bannerImages.length <= 1) return;
    const t = setInterval(() => {
      setActive((v) => (v + 1) % bannerImages.length);
    }, 6500);
    return () => clearInterval(t);
  }, [bannerImages.length]);

  if (!cmsString(title) && !visibleItems.length && !bannerImages.length) return null;

  return (
    <section id="why_choose_us" className="bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
              {title}
            </h2>
            {(desc1 || desc2) ? (
              <div className="mt-4 text-lg leading-relaxed text-[#64748B]">
                {desc1 ? <p>{desc1}</p> : null}
                {desc2 ? <p className="mt-2">{desc2}</p> : null}
              </div>
            ) : null}

            {visibleItems.length ? (
              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {visibleItems.map((it, idx) => (
                  <UspCard key={`${it.title}-${idx}`} item={it} />
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-slate-200 bg-white/70 p-3 shadow-sm">
              <div className="relative overflow-hidden rounded-2xl">
                {bannerImages[active] ? (
                  <>
                    <img
                      src={bannerImages[active]}
                      alt="Why us banner"
                      className="h-[420px] w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                  </>
                ) : (
                  <div className="h-[420px] w-full bg-gradient-to-br from-[#2563EB] to-[#1D4ED8]" />
                )}

                {bannerImages.length > 1 ? (
                  <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
                    {bannerImages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        aria-label={`Banner ${idx + 1}`}
                        onClick={() => setActive(idx)}
                        className={`h-2.5 w-2.5 rounded-full transition ${
                          idx === active ? "bg-[#EAB308]" : "bg-white/45 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

