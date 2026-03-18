import type { PublicCmsHomepageSection } from "@/lib/public-cms";
import { cmsString } from "@/lib/public-cms";
import { extraString, parseJsonSafe } from "../utils";

type FaqItem = { question: string; answer: string };

export default function FaqSection({ section }: { section: PublicCmsHomepageSection }) {
  const title = cmsString(section.title) ?? "FAQ";
  const subtitle = cmsString(section.subtitle) ?? cmsString(section.description);
  const items = parseJsonSafe<FaqItem[]>(extraString(section.extra_data, "items_json")) ?? [];
  const visible = items.filter((i) => cmsString(i?.question) && cmsString(i?.answer));

  if (!cmsString(title) && !subtitle && !visible.length) return null;

  return (
    <section id="faq" className="bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
          {subtitle ? (
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">{subtitle}</p>
          ) : null}
        </div>

        {visible.length ? (
          <div className="mt-10 space-y-3">
            {visible.slice(0, 12).map((i, idx) => (
              <details
                key={`${i.question}-${idx}`}
                className="group rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-card"
              >
                <summary className="cursor-pointer list-none font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    <span>{i.question}</span>
                    <span className="text-slate-400 transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <div className="mt-3 text-sm leading-relaxed text-slate-600">{i.answer}</div>
              </details>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

