import type { NavLink } from "@/lib/site-nav";
import type { PublicCmsNavItem, PublicCmsPayload } from "@/lib/public-cms";
import { cmsString } from "@/lib/public-cms";
import { generateCmsThemeVars } from "@/lib/cms-theme-vars";

export type { NavLink } from "@/lib/site-nav";

/** Public chrome derived only from `GET /api/public/cms` (no legacy merge). */
export type PublicSiteCmsContext = {
  cms: PublicCmsPayload | null;
  siteName: string;
  logoUrl: string | null;
  headerNavTree: PublicCmsNavItem[] | null;
  /** Empty when CMS header has items; no legacy flat nav. */
  fallbackHeaderNav: NavLink[];
  primaryCta: { label: string; url: string };
  themeVars: Record<string, string>;
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

export function buildPublicSiteContext(cms: PublicCmsPayload | null): PublicSiteCmsContext {
  const siteName = cmsString(cms?.site.site_name) ?? "";
  const logoUrl = cmsString(cms?.site.logo_url);

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

  const themeVars: Record<string, string> = generateCmsThemeVars(cms);

  const footerCols = cms?.navigation?.footer?.length
    ? footerColumnsFromCms(cms.navigation.footer)
    : [];
  const cmsFooterColumns = footerCols.length ? footerCols : null;

  return {
    cms,
    siteName,
    logoUrl,
    headerNavTree: hasCmsHeader ? headerRoots : null,
    fallbackHeaderNav: [],
    primaryCta,
    themeVars,
    cmsFooterColumns,
  };
}
