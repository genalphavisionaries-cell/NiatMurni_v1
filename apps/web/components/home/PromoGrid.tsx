"use client";

import Link from "next/link";

/** Promo tiles — demo data for appearance; admin can drive from settings (image, title, link) later. */
const demoPromos = [
  {
    id: "1",
    title: "Limited-time offer",
    subtitle: "Early bird rates for March batch",
    imageUrl: null as string | null,
    linkUrl: "#classes",
    ctaText: "Book now",
  },
  {
    id: "2",
    title: "Corporate packages",
    subtitle: "Group training for your team",
    imageUrl: null as string | null,
    linkUrl: "#contact",
    ctaText: "Get a quote",
  },
  {
    id: "3",
    title: "New schedule",
    subtitle: "Weekend & evening classes",
    imageUrl: null as string | null,
    linkUrl: "#classes",
    ctaText: "View schedule",
  },
];

type PromoTile = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  linkUrl: string;
  ctaText: string;
};

type PromoGridProps = {
  promos?: PromoTile[];
};

export default function PromoGrid({ promos = demoPromos }: PromoGridProps) {
  return (
    <section className="bg-white py-16 sm:py-20" aria-label="Promotions">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Offers & updates
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            Stay ahead with flexible options and special rates.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {promos.map((promo) => (
            <Link
              key={promo.id}
              href={promo.linkUrl}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:shadow-card-hover"
            >
              <div className="relative aspect-[16/10] bg-slate-100">
                {promo.imageUrl ? (
                  <img
                    src={promo.imageUrl}
                    alt=""
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100">
                    <span className="text-5xl opacity-30">✨</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900">{promo.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{promo.subtitle}</p>
                <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary-600 group-hover:text-primary-700">
                  {promo.ctaText}
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
