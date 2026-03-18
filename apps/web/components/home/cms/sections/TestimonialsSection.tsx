import type { PublicCmsHomepageSection } from "@/lib/public-cms";
import { cmsString } from "@/lib/public-cms";
import { extraString, parseJsonSafe } from "../utils";

type Testimonial = {
  name: string;
  review: string;
  rating?: number;
  date?: string;
};

function Stars({ rating }: { rating: number }) {
  const r = Math.min(5, Math.max(0, Math.round(rating)));
  return <span className="text-sm text-amber-500" aria-hidden>{`★`.repeat(r)}</span>;
}

export default function TestimonialsSection({ section }: { section: PublicCmsHomepageSection }) {
  const title = cmsString(section.title) ?? "Testimonials";
  const subtitle = cmsString(section.subtitle) ?? cmsString(section.description);
  const items = parseJsonSafe<Testimonial[]>(extraString(section.extra_data, "items_json")) ?? [];
  const visible = items.filter((t) => cmsString(t?.name) && cmsString(t?.review));

  if (!cmsString(title) && !subtitle && !visible.length) return null;

  return (
    <section id="testimonials" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
          {subtitle ? (
            <p className="mt-4 text-lg leading-relaxed text-slate-600">{subtitle}</p>
          ) : null}
        </div>

        {visible.length ? (
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {visible.slice(0, 9).map((t, idx) => (
              <div key={`${t.name}-${idx}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{t.name}</p>
                    {t.date ? <p className="mt-1 text-xs text-slate-500">{t.date}</p> : null}
                  </div>
                  {typeof t.rating === "number" ? <Stars rating={t.rating} /> : null}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  &ldquo;{t.review}&rdquo;
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

