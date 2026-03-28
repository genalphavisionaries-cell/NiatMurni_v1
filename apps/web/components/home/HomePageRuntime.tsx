"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Footer,
  HeroLayout,
  PromoStrip,
  PromoGrid,
  UpcomingClassesSection,
  WhyChooseSection,
  SocialProofSection,
  CmsHeader,
  CmsFooter,
  CmsHomepageRenderer,
  CmsDebugPanel,
} from "@/components/home";
import {
  defaultHomepageSettings,
  getHomepageSettings,
  type HomepageSettings,
} from "@/lib/homepage-settings";
import { fetchPublicCms, cmsString, EMPTY_THEME, type PublicCmsPayload } from "@/lib/public-cms";
import { cmsFlatNavToLinks, mergePublicCmsForHome } from "@/lib/merge-public-cms";
import { getCmsThemeStyleObject } from "@/lib/cms-theme-vars";
import PublicFloatingLayer from "@/components/public/PublicFloatingLayer";

type HomePageRuntimeProps = {
  initialSettings: HomepageSettings;
  initialCms: PublicCmsPayload | null;
};

export default function HomePageRuntime({
  initialSettings,
  initialCms,
}: HomePageRuntimeProps) {
  const [settings, setSettings] = useState<HomepageSettings>(initialSettings ?? defaultHomepageSettings);
  const [cms, setCms] = useState<PublicCmsPayload | null>(initialCms);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [settingsSettled, cmsSettled] = await Promise.allSettled([
        getHomepageSettings(),
        fetchPublicCms(),
      ]);
      if (cancelled) return;
      if (settingsSettled.status === "fulfilled") {
        setSettings(settingsSettled.value);
      }
      if (cmsSettled.status === "fulfilled") {
        setCms(cmsSettled.value);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ctx = mergePublicCmsForHome(settings, cms);
  const isCmsDebug =
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_CMS_DEBUG === "true";
  const showCmsFallbackBanner = isCmsDebug && cms === null;

  const cmsKeys = useMemo(
    () => new Set((cms?.homepage_sections ?? []).map((s) => (s.section_key ?? "").trim().toLowerCase())),
    [cms]
  );
  const useCmsRedesign =
    !!cms &&
    (cmsKeys.has("hero") ||
      cmsKeys.has("why_choose_us") ||
      cmsKeys.has("usp") ||
      cmsKeys.has("features") ||
      cmsKeys.has("testimonials") ||
      cmsKeys.has("trust") ||
      cmsKeys.has("cta") ||
      cmsKeys.has("promo") ||
      cmsKeys.has("classes"));

  // Legacy fallback: build a hero carousel-like section from homepage settings.
  // This removes the old booking panel and keeps the hero clean & consistent.
  const legacyHeroBg =
    settings.hero.backgroundImageUrl ?? "/images/food-handling-hero.svg";
  const legacyHeroSlides = [
    legacyHeroBg,
    settings.mainBanners?.[0]?.imageUrl ?? legacyHeroBg,
    settings.mainBanners?.[1]?.imageUrl ?? legacyHeroBg,
  ].filter((v, idx, arr) => !!v && arr.indexOf(v) === idx);

  const cmsThemeVars = getCmsThemeStyleObject(cms);
  const mergedThemeVars = { ...ctx.themeVars, ...cmsThemeVars };

  return (
    <div style={mergedThemeVars as CSSProperties}>
      {showCmsFallbackBanner ? (
        <div className="fixed left-1/2 top-3 z-[9998] -translate-x-1/2 rounded-md border border-amber-500/80 bg-amber-900/85 px-3 py-1.5 text-xs font-semibold text-amber-100 shadow-lg backdrop-blur-sm">
          ⚠ CMS not loaded — using fallback
        </div>
      ) : null}
      {useCmsRedesign && cms ? (
        <>
          <CmsHeader
            siteName={ctx.siteName}
            logoUrl={ctx.logoUrl}
            navTree={ctx.headerNavTree}
            fallbackNav={ctx.fallbackHeaderNav}
            primaryCta={ctx.primaryCta}
          />
          <main>
            <CmsHomepageRenderer cms={cms} legacy={settings} />

            {/* Fallback fill-ins if CMS omits key blocks */}
            {!cmsKeys.has("why_choose_us") && !cmsKeys.has("usp") && !cmsKeys.has("features") ? (
              <WhyChooseSection data={settings.whyChoose} />
            ) : null}
            {!cmsKeys.has("testimonials") && !cmsKeys.has("trust") ? (
              <SocialProofSection data={settings.socialProof} />
            ) : null}
          </main>
          <CmsFooter
            siteName={ctx.siteName}
            logoUrl={ctx.logoUrl}
            footerNavColumns={ctx.cmsFooterColumns}
            footerBackgroundColor={cmsString(cms?.theme.footer_background_color)}
            cmsFooter={cms.footer}
            cmsContact={cms.contact}
            cmsSocial={cms.social}
            legalLinks={cmsFlatNavToLinks(cms.navigation.footer_legal)}
            loginLinks={cmsFlatNavToLinks(cms.navigation.footer_login)}
            paymentMethodIcons={settings.paymentMethodIcons}
            legacyFooterSslBadgeUrl={settings.footerSslBadgeUrl}
            legacyFooterDescription={settings.footerDescription}
            legacyFooterBottom={settings.footerBottom}
          />
        </>
      ) : (
        <>
          <main>
            <HeroLayout
              siteName={ctx.siteName}
              logoUrl={ctx.logoUrl}
              navTree={ctx.headerNavTree}
              fallbackNav={ctx.fallbackHeaderNav}
              primaryCta={ctx.primaryCta}
              heroTitle={settings.hero.headline}
              heroSubtitle={settings.hero.subheadline}
              heroPrimaryLabel={settings.hero.ctaText}
              heroPrimaryUrl={settings.hero.ctaHref}
              heroSecondaryLabel={settings.mainBanners?.[0]?.ctaText ?? "Lihat Kelas"}
              heroSecondaryUrl={settings.mainBanners?.[0]?.ctaHref ?? "#classes"}
              heroBackgroundUrls={legacyHeroSlides}
              heroOverlayOpacity={settings.hero.overlayOpacity}
              theme={cms?.theme ?? EMPTY_THEME}
            />
            <WhyChooseSection data={settings.whyChoose} />
            <UpcomingClassesSection
              theme={cms?.theme ?? EMPTY_THEME}
              section={
                cms?.homepage_sections?.find(
                  (s) => (s.section_key ?? "").trim().toLowerCase() === "classes"
                ) ?? null
              }
            />
            <SocialProofSection data={settings.socialProof} />
            <PromoStrip />
            <PromoGrid />
          </main>
          <Footer
            settings={{
              footerColumns: settings.footerColumns,
              footerBottom: settings.footerBottom,
              siteName: ctx.siteName,
              paymentMethodIcons: settings.paymentMethodIcons,
              footerLogoUrl: settings.footerLogoUrl,
              footerDescription: settings.footerDescription,
              footerSslBadgeUrl: settings.footerSslBadgeUrl,
            }}
            cmsFooterColumns={ctx.cmsFooterColumns}
            footerBackgroundColor={cmsString(cms?.theme.footer_background_color)}
            cmsGlobal={
              cms
                ? {
                    footer: cms.footer,
                    contact: cms.contact,
                    social: cms.social,
                    legalLinks: cmsFlatNavToLinks(cms.navigation.footer_legal),
                    loginLinks: cmsFlatNavToLinks(cms.navigation.footer_login),
                  }
                : null
            }
          />
        </>
      )}
      <PublicFloatingLayer />
      {cms ? <CmsDebugPanel cms={cms} /> : null}
    </div>
  );
}
