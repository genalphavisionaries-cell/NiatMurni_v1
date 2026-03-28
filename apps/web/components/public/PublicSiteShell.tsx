import type { CSSProperties, ReactNode } from "react";
import { CmsHeader, CmsFooter } from "@/components/home";
import { fetchPublicCms, cmsString, EMPTY_FLOATING_MENU, emptyPublicCmsPayload } from "@/lib/public-cms";
import { cmsFlatNavToLinks, buildPublicSiteContext } from "@/lib/merge-public-cms";
import PublicFloatingLayer from "@/components/public/PublicFloatingLayer";
import { defaultPublicSettings, fetchPublicSettings } from "@/lib/public-settings";

type Props = {
  children: ReactNode;
  /** Extra classes for the main content area (below site header) */
  mainClassName?: string;
};

/**
 * Shared CMS-driven public site chrome: theme CSS vars, header, footer.
 * Data source: GET /api/public/cms only.
 */
export default async function PublicSiteShell({
  children,
  mainClassName = "min-h-[60vh] flex-1 bg-stone-50",
}: Props) {
  const [cmsRaw, pub] = await Promise.all([fetchPublicCms(), fetchPublicSettings()]);
  const cms = cmsRaw ?? emptyPublicCmsPayload();
  const ctx = buildPublicSiteContext(cms);
  const whatsapp = pub?.whatsapp ?? defaultPublicSettings().whatsapp;
  const floatingMenu = cms.floating_menu ?? EMPTY_FLOATING_MENU;

  return (
    <div className="flex min-h-screen flex-col" style={ctx.themeVars as CSSProperties}>
      <CmsHeader
        siteName={ctx.siteName || cms.site.site_name || "Niat Murni Academy"}
        logoUrl={ctx.logoUrl}
        navTree={ctx.headerNavTree}
        fallbackNav={ctx.fallbackHeaderNav}
        primaryCta={ctx.primaryCta}
      />
      <main className={mainClassName}>{children}</main>
      <CmsFooter
        siteName={ctx.siteName || cms.site.site_name || "Niat Murni Academy"}
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
    </div>
  );
}
