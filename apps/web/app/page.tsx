export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { CmsHeader, CmsFooter, CmsHomepageRenderer, CmsDebugPanel } from "@/components/home";
import {
  fetchPublicCms,
  cmsString,
  EMPTY_FLOATING_MENU,
  emptyPublicCmsPayload,
  type PublicCmsPayload,
} from "@/lib/public-cms";
import { cmsFlatNavToLinks, buildPublicSiteContext } from "@/lib/merge-public-cms";
import { getCmsThemeStyleObject } from "@/lib/cms-theme-vars";
import PublicFloatingLayer from "@/components/public/PublicFloatingLayer";
import { defaultPublicSettings, fetchPublicSettings } from "@/lib/public-settings";

const DEFAULT_TITLE = "Niat Murni Academy";
const DEFAULT_DESC =
  "KKM Food Handling & Training — professional food safety courses for food handlers in Malaysia.";

export async function generateMetadata(): Promise<Metadata> {
  const cms = await fetchPublicCms();
  const effective = cms ?? emptyPublicCmsPayload();
  const title =
    cmsString(effective.seo.homepage_seo_title) ??
    cmsString(effective.seo.default_seo_title) ??
    DEFAULT_TITLE;
  const description =
    cmsString(effective.seo.homepage_seo_description) ??
    cmsString(effective.seo.default_seo_description) ??
    DEFAULT_DESC;
  const og = cmsString(effective.seo.homepage_og_image_url);
  const favicon = cmsString(effective.site.favicon_url);

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
  const cmsFromApi = await fetchPublicCms();
  const cms = cmsFromApi ?? emptyPublicCmsPayload();
  const hadApiFailure = cmsFromApi === null;

  // Temporary: verify CMS in Node SSR output (remove when pipeline is stable).
  console.log("SSR CMS DATA:", cms);

  const [pubSettled] = await Promise.allSettled([fetchPublicSettings()]);
  const pub = pubSettled.status === "fulfilled" ? pubSettled.value : null;
  const whatsapp = pub?.whatsapp ?? defaultPublicSettings().whatsapp;
  const floatingMenu = cms.floating_menu ?? EMPTY_FLOATING_MENU;

  const ctx = buildPublicSiteContext(cms);
  const isCmsDebug =
    process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_CMS_DEBUG === "true";
  const showCmsFallbackBanner = isCmsDebug && hadApiFailure;

  const displayName = ctx.siteName || cms.site.site_name || DEFAULT_TITLE;
  const cmsThemeVars = getCmsThemeStyleObject(cms);
  const mergedThemeVars = { ...ctx.themeVars, ...cmsThemeVars };

  return (
    <div style={mergedThemeVars as CSSProperties}>
      {showCmsFallbackBanner ? (
        <div className="fixed left-1/2 top-3 z-[9998] -translate-x-1/2 rounded-md border border-amber-500/80 bg-amber-900/85 px-3 py-1.5 text-xs font-semibold text-amber-100 shadow-lg backdrop-blur-sm">
          ⚠ CMS API unreachable — showing empty structure (not legacy homepage-settings)
        </div>
      ) : null}
      <CmsHeader
        siteName={displayName}
        logoUrl={ctx.logoUrl}
        navTree={ctx.headerNavTree}
        fallbackNav={ctx.fallbackHeaderNav}
        primaryCta={ctx.primaryCta}
      />
      <main>
        <CmsHomepageRenderer cms={cms} />
      </main>
      <CmsFooter
        siteName={displayName}
        logoUrl={ctx.logoUrl}
        footerNavColumns={ctx.cmsFooterColumns}
        footerBackgroundColor={cmsString(cms.theme.footer_background_color)}
        cmsFooter={cms.footer}
        cmsContact={cms.contact}
        cmsSocial={cms.social}
        legalLinks={cmsFlatNavToLinks(cms.navigation.footer_legal)}
        loginLinks={cmsFlatNavToLinks(cms.navigation.footer_login)}
      />
      <PublicFloatingLayer floatingMenu={floatingMenu} whatsapp={whatsapp} />
      <CmsDebugPanel cms={cms} />
    </div>
  );
}
