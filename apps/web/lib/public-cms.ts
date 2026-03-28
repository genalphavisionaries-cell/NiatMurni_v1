/**
 * Public structured CMS from Laravel GET /api/public/cms.
 * Base URL: {@link getApiBase} (NEXT_PUBLIC_API_BASE_URL or NEXT_PUBLIC_API_URL).
 */

import { apiUrl, getApiBase } from "./config";
import { validateCmsPayload, type ValidationResult } from "./cms-validation";

export type { ValidationResult } from "./cms-validation";

export const getPublicApiBase = (): string => {
  const base = getApiBase();
  if (base && (base.startsWith("http://") || base.startsWith("https://"))) {
    return base;
  }
  return "";
};

export type PublicCmsNavItem = {
  id: number;
  label: string;
  url: string | null;
  open_in_new_tab: boolean;
  is_button: boolean;
  children: PublicCmsNavItem[];
};

export type PublicCmsSite = {
  site_name: string;
  site_tagline: string;
  logo_url: string;
  favicon_url: string;
  primary_cta_label: string;
  primary_cta_url: string;
};

export type PublicCmsTheme = {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  header_background_color: string;
  footer_background_color: string;
  // Button-specific colors
  primary_button_color: string;
  primary_button_text_color: string;
  secondary_button_color: string;
  secondary_button_text_color: string;
  secondary_button_border_color: string;
};

export type PublicCmsSeo = {
  homepage_seo_title: string;
  homepage_seo_description: string;
  homepage_og_image_url: string;
  default_seo_title: string;
  default_seo_description: string;
};

/** Footer copy + contact/social + payment/trust (Steps 5–6 CMS) */
export type PublicCmsFooterBlock = {
  description: string;
  bottom_text: string;
  /** When false, hide the white payment-methods card (Step 6) */
  show_payment_card: boolean;
  payment_headline: string;
  ssl_badge_url: string;
  ssl_caption: string;
};

export type PublicCmsContactBlock = {
  email: string;
  phone: string;
  address: string;
};

export type PublicCmsSocialBlock = {
  facebook_url: string;
  instagram_url: string;
  linkedin_url: string;
};

export type PublicCmsHomepageSection = {
  section_key: string;
  name: string;
  sort_order: number;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  button_primary_label: string | null;
  button_primary_url: string | null;
  button_secondary_label: string | null;
  button_secondary_url: string | null;
  /** Section accent (headings, links, borders); falls back to theme.primary_color when empty */
  accent_color?: string | null;
  /** Primary button background for this section; falls back to theme.primary_button_color */
  button_color?: string | null;
  extra_data: Record<string, string> | null;
};

/** Bottom pill nav: first three items use `url`; fourth triggers WhatsApp via `action: "whatsapp"`. */
export type PublicCmsFloatingMenuItem = {
  label: string;
  url: string | null;
  /** Optional icon hint: home, book, mail, chat, link, whatsapp */
  icon?: string;
  action?: "whatsapp" | "link";
};

export type PublicCmsFloatingMenu = {
  enabled: boolean;
  items: PublicCmsFloatingMenuItem[];
};

export const EMPTY_FLOATING_MENU: PublicCmsFloatingMenu = { enabled: false, items: [] };

export type PublicCmsHeaderColors = {
  background: string;
  border: string;
  menu_background: string;
  menu_text: string;
  menu_hover_background: string;
  menu_hover_text: string;
  sticky_background: string;
  sticky_text: string;
  sticky_hover_background: string;
  sticky_hover_text: string;
};

export type PublicCmsFooterColors = {
  background: string;
  text: string;
  link_text: string;
  link_hover: string;
  heading: string;
  button_background: string;
  button_text: string;
  button_border: string;
  button_hover: string;
};

export type PublicCmsPayload = {
  /** Payload format version for future compatibility */
  version?: string;
  site: PublicCmsSite;
  theme: PublicCmsTheme;
  seo: PublicCmsSeo;
  footer: PublicCmsFooterBlock;
  contact: PublicCmsContactBlock;
  social: PublicCmsSocialBlock;
  navigation: {
    header: PublicCmsNavItem[];
    footer: PublicCmsNavItem[];
    /** Flat list: footer legal strip (Step 6) */
    footer_legal: PublicCmsNavItem[];
    /** Flat list: login portal buttons (Step 6) */
    footer_login: PublicCmsNavItem[];
  };
  /** Professional header color customization */
  header_colors?: PublicCmsHeaderColors;
  /** Professional footer color customization */
  footer_colors?: PublicCmsFooterColors;
  homepage_sections: PublicCmsHomepageSection[];
  /** First hero row from `homepage_sections` (filled by `normalizeCmsPayload`). */
  hero?: PublicCmsHomepageSection | null;
  /** CMS payload generation timestamp (Laravel `now()`). */
  last_updated?: string | null;
  floating_menu: PublicCmsFloatingMenu;
  /** Allow unknown fields for future version compatibility */
  [key: string]: unknown;
};

/** Default theme when API omits fields (used by section color fallbacks). */
export const EMPTY_THEME: PublicCmsTheme = {
  primary_color: "#2563EB",
  secondary_color: "#64748B",
  accent_color: "#F59E0B",
  background_color: "#FFFFFF",
  text_color: "#0F172A",
  header_background_color: "#FFFFFF", 
  footer_background_color: "#0F172A",
  primary_button_color: "#2563EB",
  primary_button_text_color: "#FFFFFF",
  secondary_button_color: "transparent",
  secondary_button_text_color: "#2563EB",
  secondary_button_border_color: "#2563EB",
};

const defaultFooterContactSocial = (): {
  footer: PublicCmsFooterBlock;
  contact: PublicCmsContactBlock;
  social: PublicCmsSocialBlock;
} => ({
  footer: {
    description: "",
    bottom_text: "",
    show_payment_card: true,
    payment_headline: "",
    ssl_badge_url: "",
    ssl_caption: "",
  },
  contact: { email: "", phone: "", address: "" },
  social: { facebook_url: "", instagram_url: "", linkedin_url: "" },
});

const emptyPayload = (): PublicCmsPayload => ({
  version: "1.0",
  site: {
    site_name: "",
    site_tagline: "",
    logo_url: "",
    favicon_url: "",
    primary_cta_label: "",
    primary_cta_url: "",
  },
  theme: { ...EMPTY_THEME },
  seo: {
    homepage_seo_title: "",
    homepage_seo_description: "",
    homepage_og_image_url: "",
    default_seo_title: "",
    default_seo_description: "",
  },
  ...defaultFooterContactSocial(),
  navigation: { header: [], footer: [], footer_legal: [], footer_login: [] },
  header_colors: {
    background: '#FFFFFF',
    border: '#E5E7EB',
    menu_background: 'transparent',
    menu_text: '#0F172A',
    menu_hover_background: '#F8FAFC',
    menu_hover_text: '#2563EB',
    sticky_background: '#FFFFFF',
    sticky_text: '#0F172A',
    sticky_hover_background: '#F8FAFC',
    sticky_hover_text: '#2563EB',
  },
  footer_colors: {
    background: '#0F172A',
    text: '#E5E7EB',
    link_text: '#CBD5E1',
    link_hover: '#FFFFFF',
    heading: '#FFFFFF',
    button_background: 'transparent',
    button_text: '#FFFFFF',
    button_border: '#334155',
    button_hover: 'rgba(255,255,255,0.1)',
  },
  homepage_sections: [],
  hero: null,
  last_updated: null,
  floating_menu: { enabled: false, items: [] },
});

function normalizeNavItem(raw: Partial<PublicCmsNavItem> & Record<string, unknown>): PublicCmsNavItem {
  const children = Array.isArray(raw.children)
    ? (raw.children as Partial<PublicCmsNavItem>[]).map((c) => normalizeNavItem(c))
    : [];
  return {
    id: typeof raw.id === "number" ? raw.id : Number(raw.id) || 0,
    label: String(raw.label ?? ""),
    url: raw.url == null || raw.url === "" ? null : String(raw.url),
    open_in_new_tab: !!raw.open_in_new_tab,
    is_button: !!raw.is_button,
    children,
  };
}

function normalizeHomepageSectionKey(k: string | null | undefined): string {
  return (k ?? "").trim().toLowerCase();
}

function pickFirstHeroSection(sections: PublicCmsHomepageSection[]): PublicCmsHomepageSection | null {
  const heroes = sections.filter((s) => normalizeHomepageSectionKey(s.section_key) === "hero");
  if (!heroes.length) return null;
  heroes.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  return heroes[0] ?? null;
}

function normalizeFloatingMenu(raw: PublicCmsPayload["floating_menu"] | undefined): PublicCmsFloatingMenu {
  const enabled = !!raw?.enabled;
  const items = Array.isArray(raw?.items)
    ? raw.items.map((it) => ({
        label: String((it as PublicCmsFloatingMenuItem).label ?? ""),
        url:
          (it as PublicCmsFloatingMenuItem).url == null || (it as PublicCmsFloatingMenuItem).url === ""
            ? null
            : String((it as PublicCmsFloatingMenuItem).url),
        icon: (it as PublicCmsFloatingMenuItem).icon != null ? String((it as PublicCmsFloatingMenuItem).icon) : undefined,
        action:
          (it as PublicCmsFloatingMenuItem).action === "whatsapp"
            ? ("whatsapp" as const)
            : ("link" as const),
      }))
    : [];
  return { enabled, items };
}

function pickSectionColorField(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

function normalizeHomepageSectionColors(s: PublicCmsHomepageSection): PublicCmsHomepageSection {
  const raw = s as PublicCmsHomepageSection & Record<string, unknown>;
  return {
    ...s,
    accent_color: pickSectionColorField(raw.accent_color),
    button_color: pickSectionColorField(raw.button_color),
  };
}

function normalizeCmsPayload(data: PublicCmsPayload): PublicCmsPayload {
  const showPay = (data.footer as { show_payment_card?: unknown } | undefined)?.show_payment_card;
  const showPaymentCard =
    showPay === false ||
    showPay === 0 ||
    String(showPay ?? "").trim() === "0" ||
    String(showPay ?? "").toLowerCase() === "false"
      ? false
      : true;

  const theme = data.theme ?? EMPTY_THEME;
  const sections = (data.homepage_sections ?? []).map(normalizeHomepageSectionColors);
  const heroRaw = data.hero ?? pickFirstHeroSection(sections);
  const hero = heroRaw ? normalizeHomepageSectionColors(heroRaw) : null;
  const lastUpdated = typeof data.last_updated === "string" && data.last_updated && data.last_updated.trim()
    ? data.last_updated
    : null;

  return {
    ...data,
    homepage_sections: sections,
    hero: hero ?? pickFirstHeroSection(sections),
    last_updated: lastUpdated,
    theme: {
      primary_color: theme.primary_color ?? EMPTY_THEME.primary_color,
      secondary_color: theme.secondary_color ?? EMPTY_THEME.secondary_color,
      accent_color: theme.accent_color ?? EMPTY_THEME.accent_color,
      background_color: theme.background_color ?? EMPTY_THEME.background_color,
      text_color: theme.text_color ?? EMPTY_THEME.text_color,
      header_background_color: theme.header_background_color ?? EMPTY_THEME.header_background_color,
      footer_background_color: theme.footer_background_color ?? EMPTY_THEME.footer_background_color,
      primary_button_color: (theme as any).primary_button_color ?? EMPTY_THEME.primary_button_color,
      primary_button_text_color: (theme as any).primary_button_text_color ?? EMPTY_THEME.primary_button_text_color,
      secondary_button_color: (theme as any).secondary_button_color ?? EMPTY_THEME.secondary_button_color,
      secondary_button_text_color: (theme as any).secondary_button_text_color ?? EMPTY_THEME.secondary_button_text_color,
      secondary_button_border_color: (theme as any).secondary_button_border_color ?? EMPTY_THEME.secondary_button_border_color,
    },
    footer: {
      description: data.footer?.description ?? "",
      bottom_text: data.footer?.bottom_text ?? "",
      show_payment_card: showPaymentCard,
      payment_headline: data.footer?.payment_headline ?? "",
      ssl_badge_url: data.footer?.ssl_badge_url ?? "",
      ssl_caption: data.footer?.ssl_caption ?? "",
    },
    contact: {
      email: data.contact?.email ?? "",
      phone: data.contact?.phone ?? "",
      address: data.contact?.address ?? "",
    },
    social: {
      facebook_url: data.social?.facebook_url ?? "",
      instagram_url: data.social?.instagram_url ?? "",
      linkedin_url: data.social?.linkedin_url ?? "",
    },
    navigation: {
      header: (data.navigation?.header ?? []).map((n) => normalizeNavItem(n)),
      footer: (data.navigation?.footer ?? []).map((n) => normalizeNavItem(n)),
      footer_legal: (data.navigation?.footer_legal ?? []).map((n) => normalizeNavItem(n)),
      footer_login: (data.navigation?.footer_login ?? []).map((n) => normalizeNavItem(n)),
    },
    floating_menu: normalizeFloatingMenu(data.floating_menu),
  };
}

export async function fetchPublicCms(): Promise<PublicCmsPayload | null> {
  const validation = await fetchPublicCmsWithValidation();
  return validation?.payload ?? null;
}

export async function fetchPublicCmsWithValidation(): Promise<ValidationResult | null> {
  const url = apiUrl("/api/public/cms");
  if (!url) return validateCmsPayload(null);

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return validateCmsPayload(null);
    
    const raw = (await res.json()) as PublicCmsPayload & { data?: PublicCmsPayload };
    // Laravel may return the payload at the root, or wrapped in { data } (legacy).
    const data = raw?.site && raw?.navigation ? raw : raw?.data;
    if (!data?.site || !data?.navigation) return validateCmsPayload(null);
    
    const normalized = normalizeCmsPayload(data);
    return validateCmsPayload(normalized);
  } catch {
    return validateCmsPayload(null);
  }
}

/** Non-empty trimmed string */
export function cmsString(v: string | null | undefined): string | null {
  const t = (v ?? "").trim();
  return t.length ? t : null;
}
