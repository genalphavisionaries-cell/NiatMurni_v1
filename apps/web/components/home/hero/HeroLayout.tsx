"use client";

import { useState } from "react";
import HeroHeader from "./HeroHeader";
import HeroSlider from "./HeroSlider";
import BookingBannerPanel from "./BookingBannerPanel";

type HeroLayoutProps = {
  siteName?: string;
  logoUrl?: string | null;
};

const HERO_HEIGHT = 720;

export default function HeroLayout({ siteName, logoUrl }: HeroLayoutProps) {
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  return (
    <div className="relative w-full">
      {/* Full-width hero section: slider + overlay + header + floating panel (desktop) */}
      <section
        className="hero-section relative w-full overflow-hidden"
        style={{ height: HERO_HEIGHT }}
        aria-label="Hero"
      >
        {/* Slider: full bleed background, z-index 1 */}
        <div className="absolute inset-0 z-[1]">
          <HeroSlider />
        </div>

        {/* Dark overlay */}
        <div
          className="hero-overlay absolute inset-0 z-[2]"
          style={{ background: "rgba(0,0,0,0.25)" }}
          aria-hidden
        />

        {/* Header: on top of hero, z-index 20 */}
        <HeroHeader siteName={siteName} logoUrl={logoUrl} />

        {/* Floating booking panel (desktop/tablet): overlay left side, z-index 10 */}
        <div
          className="absolute top-[140px] z-10 hidden lg:block"
          style={{
            left: 80,
            width: panelCollapsed ? 56 : undefined,
          }}
        >
          <div className={panelCollapsed ? "w-[56px]" : "w-[420px] md:w-[380px]"}>
            <BookingBannerPanel
              collapsed={panelCollapsed}
              onCollapsedChange={setPanelCollapsed}
            />
          </div>
        </div>
      </section>

      {/* Mobile: booking panel as full-width block below hero */}
      <div className="w-full px-4 py-6 lg:hidden">
        <BookingBannerPanel
          collapsed={panelCollapsed}
          onCollapsedChange={setPanelCollapsed}
        />
      </div>
    </div>
  );
}
