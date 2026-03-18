import type { CSSProperties, ReactNode } from "react";
import { CmsHeader, CmsFooter, Footer } from "@/components/home";
import { getHomepageSettings } from "@/lib/homepage-settings";
import { fetchPublicCms, cmsString } from "@/lib/public-cms";
import { cmsFlatNavToLinks, mergePublicCmsForHome } from "@/lib/merge-public-cms";

type Props = {
  children: ReactNode;
  /** Extra classes for the main content area (below site header) */
  mainClassName?: string;
};

/**
 * Shared CMS-driven public site chrome: theme CSS vars, header, footer.
 * Use on marketing/booking flows; not for /admin, /participant, /tutor shells.
 */
export default async function PublicSiteShell({
  children,
  mainClassName = "min-h-[60vh] flex-1 bg-stone-50",
}: Props) {
  const [settings, cms] = await Promise.all([
    getHomepageSettings(),
    fetchPublicCms(),
  ]);
  const ctx = mergePublicCmsForHome(settings, cms);

  return (
    <div
      className="flex min-h-screen flex-col"
      style={ctx.themeVars as CSSProperties}
    >
      <CmsHeader
        siteName={ctx.siteName}
        logoUrl={ctx.logoUrl}
        navTree={ctx.headerNavTree}
        fallbackNav={ctx.fallbackHeaderNav}
        primaryCta={ctx.primaryCta}
      />
      <main className={mainClassName}>{children}</main>
      {cms ? (
        <CmsFooter
          siteName={ctx.siteName}
          logoUrl={ctx.logoUrl}
          footerNavColumns={ctx.cmsFooterColumns}
          footerBackgroundColor={cmsString(cms.theme.footer_background_color)}
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
      ) : (
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
          footerBackgroundColor={null}
          cmsGlobal={null}
        />
      )}
    </div>
  );
}
