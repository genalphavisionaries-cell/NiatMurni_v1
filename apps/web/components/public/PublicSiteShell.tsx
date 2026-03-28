import type { CSSProperties, ReactNode } from "react";
import { CmsHeader, CmsFooter, Footer } from "@/components/home";
import { getHomepageSettings } from "@/lib/homepage-settings";
import { fetchPublicCms, cmsString, EMPTY_FLOATING_MENU } from "@/lib/public-cms";
import { cmsFlatNavToLinks, mergePublicCmsForHome } from "@/lib/merge-public-cms";
import PublicFloatingLayer from "@/components/public/PublicFloatingLayer";
import { defaultPublicSettings, fetchPublicSettings } from "@/lib/public-settings";

type Props = {
  children: ReactNode;
  /** Extra classes for the main content area (below site header) */
  mainClassName?: string;
};

/**
 * Shared CMS-driven public site chrome: theme CSS vars, header, footer.
 * Use on marketing/booking flows; not for /admin, /user, /tutor shells.
 */
export default async function PublicSiteShell({
  children,
  mainClassName = "min-h-[60vh] flex-1 bg-stone-50",
}: Props) {
  const [initialSettings, initialCms, pub] = await Promise.all([
    getHomepageSettings(),
    fetchPublicCms(),
    fetchPublicSettings(),
  ]);

  const ctx = mergePublicCmsForHome(initialSettings, initialCms);
  const whatsapp = pub?.whatsapp ?? defaultPublicSettings().whatsapp;
  const floatingMenu = initialCms?.floating_menu ?? EMPTY_FLOATING_MENU;

  return (
    <div className="flex min-h-screen flex-col" style={ctx.themeVars as CSSProperties}>
      <CmsHeader
        siteName={ctx.siteName}
        logoUrl={ctx.logoUrl}
        navTree={ctx.headerNavTree}
        fallbackNav={ctx.fallbackHeaderNav}
        primaryCta={ctx.primaryCta}
      />
      <main className={mainClassName}>{children}</main>
      {initialCms ? (
        <CmsFooter
          siteName={ctx.siteName}
          logoUrl={ctx.logoUrl}
          footerNavColumns={ctx.cmsFooterColumns}
          footerBackgroundColor={cmsString(initialCms.theme.footer_background_color)}
          cmsFooter={initialCms.footer}
          cmsContact={initialCms.contact}
          cmsSocial={initialCms.social}
          legalLinks={cmsFlatNavToLinks(initialCms.navigation.footer_legal)}
          loginLinks={cmsFlatNavToLinks(initialCms.navigation.footer_login)}
          paymentMethodIcons={initialSettings.paymentMethodIcons}
          legacyFooterSslBadgeUrl={initialSettings.footerSslBadgeUrl}
          legacyFooterDescription={initialSettings.footerDescription}
          legacyFooterBottom={initialSettings.footerBottom}
        />
      ) : (
        <Footer
          settings={{
            footerColumns: initialSettings.footerColumns,
            footerBottom: initialSettings.footerBottom,
            siteName: ctx.siteName,
            paymentMethodIcons: initialSettings.paymentMethodIcons,
            footerLogoUrl: initialSettings.footerLogoUrl,
            footerDescription: initialSettings.footerDescription,
            footerSslBadgeUrl: initialSettings.footerSslBadgeUrl,
          }}
          cmsFooterColumns={ctx.cmsFooterColumns}
          footerBackgroundColor={null}
          cmsGlobal={null}
        />
      )}
      <PublicFloatingLayer floatingMenu={floatingMenu} whatsapp={whatsapp} />
    </div>
  );
}
