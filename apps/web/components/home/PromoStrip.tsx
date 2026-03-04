"use client";

import Link from "next/link";

/** Optional full-width promo banner — admin can set image + link in Homepage Settings later. */
type PromoStripProps = {
  imageUrl?: string | null;
  linkUrl?: string;
  alt?: string;
};

export default function PromoStrip({ imageUrl, linkUrl, alt = "Promotion" }: PromoStripProps) {
  const hasContent = imageUrl || linkUrl;
  const content = imageUrl ? (
    <img
      src={imageUrl}
      alt={alt}
      className="h-full w-full object-cover object-center"
    />
  ) : (
    <div className="flex h-full min-h-[120px] items-center justify-center bg-gradient-to-r from-primary-500/10 to-primary-600/10 text-slate-600">
      <span className="text-sm font-medium">
        {hasContent ? "Banner" : "Promo banner slot — upload in admin"}
      </span>
    </div>
  );

  const wrapperClass = "block w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card";
  if (linkUrl) {
    return (
      <section className="px-4 py-6 sm:px-6 lg:px-8" aria-label="Promotion">
        <div className="mx-auto max-w-7xl">
          <Link href={linkUrl} className={wrapperClass}>
            <div className="aspect-[3/1] min-h-[100px] max-h-[200px] w-full overflow-hidden sm:max-h-[160px]">
              {content}
            </div>
          </Link>
        </div>
      </section>
    );
  }
  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8" aria-label="Promotion">
      <div className="mx-auto max-w-7xl">
        <div className={wrapperClass}>
          <div className="aspect-[3/1] min-h-[100px] max-h-[200px] w-full overflow-hidden sm:max-h-[160px]">
            {content}
          </div>
        </div>
      </div>
    </section>
  );
}
