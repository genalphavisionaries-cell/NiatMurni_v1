"use client";

import HeroHeader from "./HeroHeader";
import HeroSlider from "./HeroSlider";
import BookingBannerPanel from "./BookingBannerPanel";

type HeroLayoutProps = {
  siteName?: string;
};

export default function HeroLayout({ siteName }: HeroLayoutProps) {
  return (
    <section
      className="hero-container relative flex min-h-screen w-full flex-col overflow-hidden max-lg:pl-0"
      aria-label="Hero"
    >
      <HeroHeader siteName={siteName} />

      {/* Slider: full width background; on mobile flex-1 so panel can stack below */}
      <div className="relative min-h-[50vh] flex-1">
        <HeroSlider />
      </div>

      {/* Floating on desktop; stacked below slider on mobile */}
      <BookingBannerPanel />
    </section>
  );
}
