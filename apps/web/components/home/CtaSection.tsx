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
    <section className="bg-amber-500 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">{headline}</h2>
        <p className="mt-4 text-lg text-amber-100">{subtext}</p>
        <div className="mt-8">
          <Link
            href={ctaHref}
            className="inline-flex rounded-full bg-white px-8 py-4 text-base font-semibold text-amber-600 shadow-lg transition hover:bg-amber-50"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}
