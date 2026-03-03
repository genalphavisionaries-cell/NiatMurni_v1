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
      className={`grid min-h-[320px] grid-cols-1 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm lg:grid-cols-2 lg:min-h-0 ${
        isReverse ? "" : ""
      }`}
    >
      <div
        className={`flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12 ${
          isReverse ? "lg:order-2" : ""
        }`}
      >
        <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">{title}</h2>
        <p className="mt-4 text-stone-600">{description}</p>
        <div className="mt-6">
          <Link
            href={ctaHref}
            className="inline-flex rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"
          >
            {ctaText}
          </Link>
        </div>
      </div>
      <div
        className={`relative min-h-[200px] bg-stone-200 lg:min-h-0 ${
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
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-stone-100">
            <span className="text-6xl opacity-30" aria-hidden>
              📋
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
