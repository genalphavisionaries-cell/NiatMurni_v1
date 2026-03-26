/**
 * Public structured CMS from Laravel GET /api/public/cms.
 * Base URL: same as homepage settings (NEXT_PUBLIC_ADMIN_API_URL or NEXT_PUBLIC_LARAVEL_API_URL).
 */

export const getPublicApiBase = (): string => {
  const env =
    process.env.NEXT_PUBLIC_ADMIN_API_URL ||
    process.env.NEXT_PUBLIC_LARAVEL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL;
  if (env?.trim() && (env.startsWith("http://") || env.startsWith("https://"))) {
    return env.replace(/\/$/, "");
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

export type PublicCmsPayload = {
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
  homepage_sections: PublicCmsHomepageSection[];
  floating_menu: PublicCmsFloatingMenu;
};

type LegacyCmsItem = {
  title?: string;
  subtitle?: string;
  link_url?: string | null;
  icon_url?: string | null;
};

type LegacyCmsSection = {
  title?: string | null;
  subtitle?: string | null;
  content?: Record<string, unknown> | null;
  items?: Record<string, LegacyCmsItem[]> | null;
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
  site: {
    site_name: "",
    site_tagline: "",
    logo_url: "",
    favicon_url: "",
    primary_cta_label: "",
    primary_cta_url: "",
  },
  theme: {
    primary_color: "",
    secondary_color: "",
    accent_color: "",
    background_color: "",
    text_color: "",
    header_background_color: "",
    footer_background_color: "",
  },
  seo: {
    homepage_seo_title: "",
    homepage_seo_description: "",
    homepage_og_image_url: "",
    default_seo_title: "",
    default_seo_description: "",
  },
  ...defaultFooterContactSocial(),
  navigation: { header: [], footer: [], footer_legal: [], footer_login: [] },
  homepage_sections: [],
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

function normalizeCmsPayload(data: PublicCmsPayload): PublicCmsPayload {
  const showPay = (data.footer as { show_payment_card?: unknown } | undefined)?.show_payment_card;
  const showPaymentCard =
    showPay === false ||
    showPay === 0 ||
    String(showPay ?? "").trim() === "0" ||
    String(showPay ?? "").toLowerCase() === "false"
      ? false
      : true;

  return {
    ...data,
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

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

function asArray<T = unknown>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function fromLegacyCmsEnvelope(raw: unknown): PublicCmsPayload | null {
  const envelope = asRecord(raw);
  const data = asRecord(envelope.data ?? envelope);
  const hasLegacySections =
    "hero" in data ||
    "header" in data ||
    "footer" in data ||
    "floating_menu" in data;

  if (!hasLegacySections) return null;

  const hero = asRecord((data.hero as LegacyCmsSection | undefined)?.content);
  const usp = asRecord((data.usp as LegacyCmsSection | undefined)?.content);
  const trust = asRecord((data.trust as LegacyCmsSection | undefined)?.content);
  const promo = asRecord((data.promo as LegacyCmsSection | undefined)?.content);
  const headerSection = (data.header as LegacyCmsSection | undefined) ?? {};
  const footerSection = (data.footer as LegacyCmsSection | undefined) ?? {};
  const floatingSection = (data.floating_menu as LegacyCmsSection | undefined) ?? {};

  const headerItems = asArray<LegacyCmsItem>(headerSection.items?.menu_item);
  const quickLinks = asArray<LegacyCmsItem>(footerSection.items?.quick_link);
  const legalLinks = asArray<LegacyCmsItem>(footerSection.items?.legal_link);
  const loginLinks = asArray<LegacyCmsItem>(footerSection.items?.footer_button);
  const floatingItems = asArray<LegacyCmsItem>(floatingSection.items?.quick_link);
  const floatingContent = asRecord(floatingSection.content);

  return normalizeCmsPayload({
    ...emptyPayload(),
    site: {
      ...emptyPayload().site,
      logo_url: String((asRecord(headerSection.content).logo_url ?? "") || ""),
      site_name: "",
      primary_cta_label: String((asRecord(headerSection.content).cta as Record<string, unknown> | undefined)?.label ?? ""),
      primary_cta_url: String((asRecord(headerSection.content).cta as Record<string, unknown> | undefined)?.url ?? ""),
      favicon_url: "",
      site_tagline: "",
    },
    contact: {
      ...emptyPayload().contact,
      email: String((asRecord(footerSection.content).contact as Record<string, unknown> | undefined)?.email ?? ""),
      phone: String((asRecord(footerSection.content).contact as Record<string, unknown> | undefined)?.phone ?? ""),
      address: String((asRecord(footerSection.content).contact as Record<string, unknown> | undefined)?.address ?? ""),
    },
    homepage_sections: [
      {
        section_key: "hero",
        name: "Hero",
        sort_order: 1,
        title: typeof hero.headline === "string" ? hero.headline : null,
        subtitle: typeof hero.subheadline === "string" ? hero.subheadline : null,
        description: null,
        image_url: null,
        button_primary_label: null,
        button_primary_url: null,
        button_secondary_label: null,
        button_secondary_url: null,
        extra_data: null,
      },
      {
        section_key: "why_choose_us",
        name: "Why Choose Us",
        sort_order: 2,
        title: typeof usp.title === "string" ? usp.title : null,
        subtitle: null,
        description: typeof usp.description === "string" ? usp.description : null,
        image_url: null,
        button_primary_label: null,
        button_primary_url: null,
        button_secondary_label: null,
        button_secondary_url: null,
        extra_data: null,
      },
      {
        section_key: "testimonials",
        name: "Testimonials",
        sort_order: 3,
        title: typeof trust.title === "string" ? trust.title : null,
        subtitle: null,
        description: typeof trust.subtitle === "string" ? trust.subtitle : null,
        image_url: null,
        button_primary_label: null,
        button_primary_url: null,
        button_secondary_label: null,
        button_secondary_url: null,
        extra_data: null,
      },
      {
        section_key: "cta",
        name: "Promotions",
        sort_order: 4,
        title: typeof promo.title === "string" ? promo.title : null,
        subtitle: null,
        description: typeof promo.description === "string" ? promo.description : null,
        image_url: null,
        button_primary_label: null,
        button_primary_url: null,
        button_secondary_label: null,
        button_secondary_url: null,
        extra_data: null,
      },
    ],
    navigation: {
      header: headerItems.map((item, idx) => ({
        id: idx + 1,
        label: String(item.title ?? ""),
        url: item.link_url ? String(item.link_url) : null,
        open_in_new_tab: false,
        is_button: false,
        children: [],
      })),
      footer: quickLinks.map((item, idx) => ({
        id: idx + 1,
        label: String(item.title ?? ""),
        url: item.link_url ? String(item.link_url) : null,
        open_in_new_tab: false,
        is_button: false,
        children: [],
      })),
      footer_legal: legalLinks.map((item, idx) => ({
        id: idx + 1,
        label: String(item.title ?? ""),
        url: item.link_url ? String(item.link_url) : null,
        open_in_new_tab: false,
        is_button: false,
        children: [],
      })),
      footer_login: loginLinks.map((item, idx) => ({
        id: idx + 1,
        label: String(item.title ?? ""),
        url: item.link_url ? String(item.link_url) : null,
        open_in_new_tab: false,
        is_button: false,
        children: [],
      })),
    },
    floating_menu: {
      enabled: !!floatingContent.enabled,
      items: floatingItems.map((item, idx) => ({
        label: String(item.subtitle ?? item.title ?? `Item ${idx + 1}`),
        url: item.link_url == null || item.link_url === "" ? null : String(item.link_url),
        icon: item.icon_url ? String(item.icon_url) : undefined,
        action: idx === 3 ? "whatsapp" : "link",
      })),
    },
  });
}

export async function fetchPublicCms(): Promise<PublicCmsPayload | null> {
  const base = getPublicApiBase();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/public/cms`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const raw = (await res.json()) as unknown;
    const wrapped = asRecord(raw);
    const candidate = asRecord(wrapped.data ?? wrapped);

    if (candidate.site && candidate.navigation) {
      return normalizeCmsPayload(candidate as unknown as PublicCmsPayload);
    }

    const mappedLegacy = fromLegacyCmsEnvelope(raw);
    if (mappedLegacy) return mappedLegacy;
    return null;
  } catch {
    return null;
  }
}

/** Non-empty trimmed string */
export function cmsString(v: string | null | undefined): string | null {
  const t = (v ?? "").trim();
  return t.length ? t : null;
}
