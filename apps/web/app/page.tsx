import type { Metadata } from "next";
import type { CSSProperties } from "react";
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
} from "@/components/home";
import { getHomepageSettings } from "@/lib/homepage-settings";
import { fetchPublicCms, cmsString } from "@/lib/public-cms";
import { cmsFlatNavToLinks, mergePublicCmsForHome } from "@/lib/merge-public-cms";

const DEFAULT_TITLE = "Niat Murni Academy";
const DEFAULT_DESC =
  "KKM Food Handling & Training — professional food safety courses for food handlers in Malaysia.";

export async function generateMetadata(): Promise<Metadata> {
  const cms = await fetchPublicCms();
  const title =
    cmsString(cms?.seo.homepage_seo_title) ??
    cmsString(cms?.seo.default_seo_title) ??
    DEFAULT_TITLE;
  const description =
    cmsString(cms?.seo.homepage_seo_description) ??
    cmsString(cms?.seo.default_seo_description) ??
    DEFAULT_DESC;
  const og = cmsString(cms?.seo.homepage_og_image_url);
  const favicon = cmsString(cms?.site.favicon_url);

  return {
    title,
    description,
    icons: favicon ? { icon: favicon } : undefined,
    openGraph: {
      title,
      description,
      ...(og ? { images: [{ url: og }] } : {}),
    },
  };
}

export default async function HomePage() {
  const [settings, cms] = await Promise.all([
    getHomepageSettings(),
    fetchPublicCms(),
  ]);
  const ctx = mergePublicCmsForHome(settings, cms);

  const cmsKeys = new Set(
    (cms?.homepage_sections ?? []).map((s) => (s.section_key ?? "").trim().toLowerCase())
  );
  const useCmsRedesign =
    !!cms &&
    (cmsKeys.has("hero") ||
      cmsKeys.has("why_choose_us") ||
      cmsKeys.has("features") ||
      cmsKeys.has("testimonials") ||
      cmsKeys.has("faq") ||
      cmsKeys.has("cta"));

  // Legacy fallback: build a hero carousel-like section from homepage settings.
  // This removes the old booking panel and keeps the hero clean & consistent.
  const legacyHeroBg =
    settings.hero.backgroundImageUrl ?? "/images/food-handling-hero.jpg";
  const legacyHeroSlides = [
    legacyHeroBg,
    settings.mainBanners?.[0]?.imageUrl ?? legacyHeroBg,
    settings.mainBanners?.[1]?.imageUrl ?? legacyHeroBg,
  ].filter((v, idx, arr) => !!v && arr.indexOf(v) === idx);

  return (
    <div style={ctx.themeVars as CSSProperties}>
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
            {!cmsKeys.has("why_choose_us") && !cmsKeys.has("features") ? (
              <WhyChooseSection data={settings.whyChoose} />
            ) : null}
            {!cmsKeys.has("testimonials") ? (
              <SocialProofSection data={settings.socialProof} />
            ) : null}
            {!cmsKeys.has("programs") ? (
              <>
                <PromoStrip />
                <PromoGrid />
                <UpcomingClassesSection />
              </>
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
            />
            <WhyChooseSection data={settings.whyChoose} />
            <SocialProofSection data={settings.socialProof} />
            <PromoStrip />
            <PromoGrid />
            <UpcomingClassesSection />
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
    </div>
  );
}
