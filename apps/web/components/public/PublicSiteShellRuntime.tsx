"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import { CmsHeader, CmsFooter, Footer } from "@/components/home";
import { getHomepageSettings, type HomepageSettings } from "@/lib/homepage-settings";
import { fetchPublicCms, cmsString, type PublicCmsPayload } from "@/lib/public-cms";
import { cmsFlatNavToLinks, mergePublicCmsForHome } from "@/lib/merge-public-cms";
import PublicFloatingLayer from "@/components/public/PublicFloatingLayer";

type Props = {
  children: ReactNode;
  mainClassName?: string;
  initialSettings: HomepageSettings;
  initialCms: PublicCmsPayload | null;
};

export default function PublicSiteShellRuntime({
  children,
  mainClassName = "min-h-[60vh] flex-1 bg-stone-50",
  initialSettings,
  initialCms,
}: Props) {
  const [settings, setSettings] = useState<HomepageSettings>(initialSettings);
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
      <PublicFloatingLayer />
    </div>
  );
}
