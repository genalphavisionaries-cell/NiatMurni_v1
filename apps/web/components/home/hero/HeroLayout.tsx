"use client";

import { useState } from "react";
import HeroHeader from "./HeroHeader";
import HeroSlider from "./HeroSlider";
import BookingBannerPanel from "./BookingBannerPanel";

type HeroLayoutProps = {
  siteName?: string;
  logoUrl?: string | null;
};

export default function HeroLayout({ siteName, logoUrl }: HeroLayoutProps) {
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  return (
    <section
      className="hero-container relative min-h-screen w-full overflow-hidden max-lg:flex max-lg:flex-col"
      aria-label="Hero"
    >
      <HeroHeader siteName={siteName} logoUrl={logoUrl} />

      <div
        className="grid flex-1 grid-cols-1 max-lg:flex max-lg:flex-col max-lg:gap-0"
        style={{
          gridTemplateColumns: panelCollapsed ? "48px 1fr" : "420px 1fr",
          gap: 40,
          padding: "120px 60px 60px",
        }}
      >
        {/* Left column: booking panel */}
        <div className="relative z-[1] max-lg:order-2 max-lg:px-4 max-lg:pb-8 max-lg:pt-4">
          <BookingBannerPanel
            collapsed={panelCollapsed}
            onCollapsedChange={setPanelCollapsed}
          />
        </div>

        {/* Right column: hero background */}
        <div className="relative z-0 min-h-[50vh] max-lg:order-1 max-lg:min-h-[40vh]">
          <div
            className="hero-bg-image absolute inset-0 z-0"
            style={{
              backgroundImage: "url(/images/food-handling-hero.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            aria-hidden
          />
          <HeroSlider />
        </div>
      </div>
    </section>
  );
}
