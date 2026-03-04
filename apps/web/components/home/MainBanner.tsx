import Link from "next/link";
import type { HomepageSettings } from "@/lib/homepage-settings";

type BannerProps = {
  banner: HomepageSettings["mainBanners"][number];
};

export default function MainBanner({ banner }: BannerProps) {
  const { title, description, imageUrl, ctaText, ctaHref, variant } = banner;
  const isReverse = variant === "reverse";

  return (
    <section
      className={`grid min-h-[340px] grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:shadow-card-hover lg:grid-cols-2 lg:min-h-0 ${
        isReverse ? "" : ""
      }`}
    >
      <div
        className={`flex flex-col justify-center px-8 py-12 sm:px-12 sm:py-14 ${
          isReverse ? "lg:order-2" : ""
        }`}
      >
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h2>
        <p className="mt-4 leading-relaxed text-slate-600">{description}</p>
        <div className="mt-8">
          <Link
            href={ctaHref}
            className="inline-flex rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-600 active:scale-[0.98]"
          >
            {ctaText}
          </Link>
        </div>
      </div>
      <div
        className={`relative min-h-[220px] bg-slate-100 lg:min-h-0 ${
          isReverse ? "lg:order-1" : ""
        }`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100">
            <span className="text-7xl opacity-20" aria-hidden>
              📋
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
