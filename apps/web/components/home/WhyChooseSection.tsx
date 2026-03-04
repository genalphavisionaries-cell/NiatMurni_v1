"use client";

import type { WhyChooseBenefit, WhyChooseSettings } from "@/lib/homepage-settings";

type WhyChooseSectionProps = {
  data: WhyChooseSettings;
};

/** Icon name → SVG (admin selects icon name in CMS; add more as needed) */
const BENEFIT_ICONS: Record<string, React.ReactNode> = {
  clock: (
    <svg className="h-5 w-5 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  award: (
    <svg className="h-5 w-5 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  shield: (
    <svg className="h-5 w-5 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  monitor: (
    <svg className="h-5 w-5 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  certificate: (
    <svg className="h-5 w-5 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
};

function BenefitIcon({ name }: { name: string }) {
  return <>{BENEFIT_ICONS[name] ?? BENEFIT_ICONS.award}</>;
}

function BenefitCard({ benefit }: { benefit: WhyChooseBenefit }) {
  return (
    <div className="flex gap-4 rounded-[14px] bg-white p-[18px] shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px]"
        style={{ width: 44, height: 44, background: "#EFF6FF" }}
      >
        <BenefitIcon name={benefit.icon} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-[#0F172A]">{benefit.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-[#64748B]">{benefit.description}</p>
      </div>
    </div>
  );
}

export default function WhyChooseSection({ data }: WhyChooseSectionProps) {
  const { title, subtitle, image, benefits } = data;
  const sortedBenefits = [...benefits].sort((a, b) => a.order - b.order);

  return (
    <section
      className="py-20"
      style={{ background: "#F9FAFB", paddingTop: 80, paddingBottom: 80 }}
      aria-labelledby="why-choose-heading"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center lg:mb-12">
          <h2 id="why-choose-heading" className="text-2xl font-bold text-[#0F172A] sm:text-3xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mx-auto mt-3 max-w-2xl text-[#64748B] sm:text-lg">
              {subtitle}
            </p>
          )}
          <p className="mx-auto mt-1 text-sm text-[#94A3B8]">
            Dipercayai oleh ribuan pengusaha makanan di Malaysia
          </p>
        </header>

        <div className="grid grid-cols-1 gap-12 items-center lg:grid-cols-2 lg:gap-[48px]">
          {/* Left: benefit cards — on mobile show after image */}
          <div className="order-2 space-y-4 lg:order-1">
            {sortedBenefits.map((benefit, index) => (
              <BenefitCard key={`${benefit.title}-${index}`} benefit={benefit} />
            ))}
          </div>

          {/* Right: banner image */}
          <div className="order-1 lg:order-2">
            {image ? (
              <div
                className="relative overflow-hidden rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
                style={{ borderRadius: 20, boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt=""
                  className="w-full object-cover"
                  style={{ width: "100%", height: "auto", objectFit: "cover" }}
                  loading="lazy"
                />
              </div>
            ) : (
              <div
                className="flex aspect-[3/2] w-full items-center justify-center rounded-[20px] bg-[#E2E8F0] text-[#64748B]"
                style={{ borderRadius: 20, boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }}
              >
                <span className="text-sm">Banner image (upload in admin)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
