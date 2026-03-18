"use client";

import { useMemo } from "react";
import HeroHeader from "./HeroHeader";
import HeroSlider from "./HeroSlider";
import type { NavLink } from "@/lib/homepage-settings";
import type { PublicCmsNavItem } from "@/lib/public-cms";
import type { PublicCmsHomepageSection, PublicCmsSite } from "@/lib/public-cms";
import HeroSection from "../cms/sections/HeroSection";

type HeroLayoutProps = {
  siteName?: string;
  logoUrl?: string | null;
  navTree?: PublicCmsNavItem[] | null;
  fallbackNav?: NavLink[];
  primaryCta?: { label: string; url: string };
  /** Legacy hero content for the fallback branch */
  heroTitle?: string;
  heroSubtitle?: string;
  heroPrimaryLabel?: string;
  heroPrimaryUrl?: string;
  heroSecondaryLabel?: string;
  heroSecondaryUrl?: string;
  heroBackgroundUrls?: string[];
  heroOverlayOpacity?: number;
};

const HERO_HEIGHT = 720;

export default function HeroLayout({
  siteName,
  logoUrl,
  navTree,
  fallbackNav,
  primaryCta,
  heroTitle,
  heroSubtitle,
  heroPrimaryLabel,
  heroPrimaryUrl,
  heroSecondaryLabel,
  heroSecondaryUrl,
  heroBackgroundUrls,
  heroOverlayOpacity,
}: HeroLayoutProps) {
  const slides = useMemo(() => {
    const fallback = heroBackgroundUrls?.filter(Boolean) ?? [];
    if (fallback.length) return fallback;
    return ["/images/food-handling-hero.jpg"];
  }, [heroBackgroundUrls]);

  const heroSection: PublicCmsHomepageSection = useMemo(() => {
    const primaryUrl = heroPrimaryUrl ?? primaryCta?.url ?? "/#classes";
    const primaryLabel = heroPrimaryLabel ?? primaryCta?.label ?? "Register";
    const secondaryUrl = heroSecondaryUrl ?? "/#classes";
    const secondaryLabel = heroSecondaryLabel ?? "Lihat Kelas";

    const bg = slides[0] ?? "/images/food-handling-hero.jpg";
    const extra = {
      overlay_opacity: String(heroOverlayOpacity ?? 0.25),
      slides_json: JSON.stringify(
        slides.slice(0, 3).map((img) => ({
          desktop_image_url: img,
          mobile_image_url: img,
        }))
      ),
    };

    return {
      section_key: "hero",
      name: "Hero",
      sort_order: 0,
      title: heroTitle ?? siteName ?? "Niat Murni Academy",
      subtitle: heroSubtitle ?? "KKM-recognised training for food handlers — online or in person.",
      description: null,
      image_url: bg,
      button_primary_label: primaryLabel,
      button_primary_url: primaryUrl,
      button_secondary_label: secondaryLabel,
      button_secondary_url: secondaryUrl,
      extra_data: extra,
    };
  }, [
    heroPrimaryLabel,
    heroPrimaryUrl,
    heroSecondaryLabel,
    heroSecondaryUrl,
    heroOverlayOpacity,
    heroSubtitle,
    heroTitle,
    primaryCta?.label,
    primaryCta?.url,
    siteName,
    slides,
  ]);

  const heroSite: PublicCmsSite = useMemo(() => {
    return {
      site_name: siteName ?? "Niat Murni Academy",
      site_tagline: heroSubtitle ?? "",
      logo_url: logoUrl ?? "",
      favicon_url: "",
      primary_cta_label: heroPrimaryLabel ?? primaryCta?.label ?? "Register",
      primary_cta_url: heroPrimaryUrl ?? primaryCta?.url ?? "/#classes",
    };
  }, [heroPrimaryLabel, heroPrimaryUrl, heroSubtitle, logoUrl, primaryCta?.label, primaryCta?.url, siteName]);

  return (
    <div className="relative w-full">
      {/* Legacy fallback hero: use the same clean hero section UX as CMS */}
      <HeroSection section={heroSection} site={heroSite} />
      {/* Header sits on top of the hero background */}
      <HeroHeader
        siteName={siteName}
        logoUrl={logoUrl}
        navTree={navTree}
        fallbackNav={fallbackNav}
        primaryCta={primaryCta}
      />
      {/* Keep background slider component import referenced to avoid unused-removal surprises */}
      <div className="hidden">
        <HeroSlider />
      </div>
    </div>
  );
}
