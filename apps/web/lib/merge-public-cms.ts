import type { NavLink, HomepageSettings } from "@/lib/homepage-settings";
import type { PublicCmsNavItem, PublicCmsPayload } from "@/lib/public-cms";
import { cmsString } from "@/lib/public-cms";

export type MergedHomePageContext = {
  settings: HomepageSettings;
  cms: PublicCmsPayload | null;
  /** Display site name */
  siteName: string;
  logoUrl: string | null;
  /** Header nav: CMS tree if any active header items, else null (use settings.headerNav) */
  headerNavTree: PublicCmsNavItem[] | null;
  /** When CMS header empty, use this flat list from settings */
  fallbackHeaderNav: NavLink[];
  primaryCta: { label: string; url: string };
  /** CSS variables for theme (only keys with values) */
  themeVars: Record<string, string>;
  /** Footer columns from CMS footer nav, or null to keep settings-driven columns only */
  cmsFooterColumns: { heading: string; links: NavLink[] }[] | null;
};

function navItemToLink(n: PublicCmsNavItem): NavLink | null {
  const href = cmsString(n.url);
  if (!href) return null;
  return {
    label: n.label,
    href: href.startsWith("http") ? href : href.startsWith("/") ? href : `/${href.replace(/^\//, "")}`,
    external: n.open_in_new_tab,
  };
}

/** Build footer columns from CMS footer tree */
export function footerColumnsFromCms(footerRoots: PublicCmsNavItem[]): { heading: string; links: NavLink[] }[] {
  if (!footerRoots.length) return [];
  const columns: { heading: string; links: NavLink[] }[] = [];
  const flat: NavLink[] = [];

  for (const node of footerRoots) {
    if (node.children?.length) {
      const links: NavLink[] = [];
      for (const c of node.children) {
        const l = navItemToLink(c);
        if (l) links.push(l);
      }
      if (links.length) {
        columns.push({ heading: node.label || "Links", links });
      }
    } else {
      const l = navItemToLink(node);
      if (l) flat.push(l);
    }
  }
  if (flat.length) {
    columns.push({ heading: "Links", links: flat });
  }
  return columns;
}

/** Flat CMS nav (footer_legal / footer_login) → links for footer UI */
export function cmsFlatNavToLinks(items: PublicCmsNavItem[] | undefined): NavLink[] {
  if (!items?.length) return [];
  return items.map((n) => navItemToLink(n)).filter((l): l is NavLink => l !== null);
}

export function mergePublicCmsForHome(
  settings: HomepageSettings,
  cms: PublicCmsPayload | null
): MergedHomePageContext {
  const siteName =
    cmsString(cms?.site.site_name) ?? settings.siteName;
  const logoUrl =
    cmsString(cms?.site.logo_url) ?? settings.logoUrl;

  const headerRoots = cms?.navigation?.header?.filter(Boolean) ?? [];
  const hasCmsHeader = headerRoots.some(
    (n) => navItemToLink(n) || (n.children?.length && n.children.some((c) => navItemToLink(c)))
  );

  const primaryCta =
    cmsString(cms?.site.primary_cta_label) && cmsString(cms?.site.primary_cta_url)
      ? {
          label: cmsString(cms?.site.primary_cta_label)!,
          url: cmsString(cms?.site.primary_cta_url)!,
        }
      : { label: "Register", url: "/#classes" };

  const themeVars: Record<string, string> = {};
  if (cms?.theme) {
    const t = cms.theme;
    const set = (k: string, v: string) => {
      const x = cmsString(v);
      if (x) themeVars[k] = x;
    };
    set("--cms-primary", t.primary_color);
    set("--cms-secondary", t.secondary_color);
    set("--cms-accent", t.accent_color);
    set("--cms-bg", t.background_color);
    set("--cms-text", t.text_color);
    set("--cms-header-bg", t.header_background_color);
    set("--cms-footer-bg", t.footer_background_color);
  }

  const footerCols = cms?.navigation?.footer?.length
    ? footerColumnsFromCms(cms.navigation.footer)
    : [];
  const cmsFooterColumns = footerCols.length ? footerCols : null;

  return {
    settings,
    cms,
    siteName,
    logoUrl,
    headerNavTree: hasCmsHeader ? headerRoots : null,
    fallbackHeaderNav: settings.headerNav,
    primaryCta,
    themeVars,
    cmsFooterColumns,
  };
}
