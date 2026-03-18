import type { PublicCmsHomepageSection } from "@/lib/public-cms";
import { cmsString } from "@/lib/public-cms";
import { extraString, parseJsonSafe } from "../utils";

type Item = { title: string; description?: string };

function Card({ item }: { item: Item }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
      {item.description ? (
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
      ) : null}
    </div>
  );
}

export default function WhyChooseUsSection({ section }: { section: PublicCmsHomepageSection }) {
  const title = cmsString(section.title) ?? "Why choose us";
  const subtitle = cmsString(section.subtitle) ?? cmsString(section.description);
  const items =
    parseJsonSafe<Item[]>(extraString(section.extra_data, "items_json")) ??
    (subtitle ? [] : []);

  const visibleItems = items.filter((i) => cmsString(i?.title));

  if (!cmsString(title) && !subtitle && !visibleItems.length) return null;

  return (
    <section id="why_choose_us" className="bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
          {subtitle ? (
            <p className="mt-4 text-lg leading-relaxed text-slate-600">{subtitle}</p>
          ) : null}
        </div>

        {visibleItems.length ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.slice(0, 9).map((it, idx) => (
              <Card key={`${it.title}-${idx}`} item={it} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

