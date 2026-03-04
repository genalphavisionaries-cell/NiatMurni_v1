import Link from "next/link";

type CtaSectionProps = {
  headline?: string;
  subtext?: string;
  ctaText?: string;
  ctaHref?: string;
};

export default function CtaSection({
  headline = "Ready to get certified?",
  subtext = "Join hundreds of food handlers who have completed our KKM-recognised programme.",
  ctaText = "View upcoming classes",
  ctaHref = "#classes",
}: CtaSectionProps) {
  return (
    <section className="relative overflow-hidden bg-slate-900 py-20 sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(234,179,8,0.15),transparent)]" />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {headline}
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-slate-300">{subtext}</p>
        <div className="mt-10">
          <Link
            href={ctaHref}
            className="inline-flex rounded-xl bg-primary-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-slate-900 active:scale-[0.98]"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}
