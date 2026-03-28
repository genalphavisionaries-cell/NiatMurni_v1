import type { PublicCmsHomepageSection } from "@/lib/public-cms";
import { cmsString } from "@/lib/public-cms";
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
  },
  {
    title: "Pilihan Online & Fizikal",
    description: "Pilih mod delivery yang sesuai dengan jadual anda.",
  },
  {
    title: "Kelas Cepat & Mudah",
    description: "Proses pendaftaran ringkas dan respons pantas.",
  },
];

function PlaceholderPromoImage({ index }: { index: number }) {
  const gradients = [
    "from-[#2563EB] to-[#1D4ED8]",
    "from-[#EAB308] to-[#F59E0B]",
    "from-[#10B981] to-[#059669]",
  ];
  const g = gradients[index % gradients.length];
  return (
    <div
      className={`relative h-36 overflow-hidden rounded-2xl bg-gradient-to-br ${g}`}
      aria-hidden
    >
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_30%_20%,white,transparent_55%)]" />
      <div className="absolute inset-0 flex items-center justify-center text-white/90 font-bold text-4xl">
        {index + 1}
      </div>
    </div>
  );
}

export default function PromotionsSection({
  section,
}: {
  section: PublicCmsHomepageSection;
}) {
  const topBanner = cmsString(section.subtitle) ?? extraString(section.extra_data, "banner_text") ?? "Promosi Terhad";
  const title = cmsString(section.title) ?? "Cadangan Promosi";
  const description = cmsString(section.description) ?? extraString(section.extra_data, "description_2");

  const promos =
    parseJsonSafe<PromoItem[]>(extraString(section.extra_data, "promos_json")) ??
    DEFAULT_PROMOS;

  const visible = promos.filter((p) => cmsString(p.title) || cmsString(p.description)).slice(0, 3);

  return (
    <section id="promotions" className="bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="inline-flex max-w-full items-center rounded-full bg-[#FEF3C7] px-4 py-2 text-sm font-semibold text-[#92400E] [&_a]:text-[#92400E] [&_a]:underline">
            <SafeCmsHtml html={topBanner} className="max-w-none [&_p]:m-0 [&_p]:inline" />
          </div>
          <div
            className="mt-4 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl [&_a]:text-[#2563EB] [&_a]:underline"
            role="heading"
            aria-level={2}
          >
            <SafeCmsHtml html={title} className="max-w-none [&_p]:m-0" />
          </div>
          {description ? (
            <div className="mt-4 max-w-2xl text-lg leading-relaxed text-[#64748B] [&_a]:text-[#2563EB]">
              <SafeCmsHtml html={description} className="max-w-none prose-p:my-2" />
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {visible.map((p, idx) => {
            const img = cmsString(p.image_url) ?? "";
            const btnLabel = cmsString(p.button_label) ?? "Daftar Sekarang";
            const btnUrl = safeHref(p.button_url ?? "/#classes") ?? "/#classes";
            const pTitle = cmsString(p.title) ?? `Promo ${idx + 1}`;
            const pDesc = cmsString(p.description) ?? "";

            return (
              <div
                key={`${pTitle}-${idx}`}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                {img ? (
                  <div className="h-36 overflow-hidden rounded-2xl">
                    <img
                      src={img}
                      alt={cmsPlainTextForAttribute(pTitle) || `Promo ${idx + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <PlaceholderPromoImage index={idx} />
                )}

                <div className="mt-5 text-xl font-semibold tracking-tight text-[#0F172A]">
                  <SafeCmsHtml html={pTitle} className="max-w-none [&_p]:m-0" />
                </div>
                {pDesc ? (
                  <div className="mt-2 min-h-[3.5rem] text-sm leading-relaxed text-[#64748B] [&_a]:text-[#2563EB]">
                    <SafeCmsHtml html={pDesc} className="max-w-none prose-p:my-1" />
                  </div>
                ) : null}

                <div className="mt-6">
                  <Link
                    href={btnUrl}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D4ED8]"
                  >
                    <SafeCmsHtml as="span" html={btnLabel} className="[&_p]:m-0 [&_p]:inline" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

