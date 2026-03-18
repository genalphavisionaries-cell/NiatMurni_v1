/**
 * Public structured CMS from Laravel GET /api/public/cms.
 * Base URL: same as homepage settings (NEXT_PUBLIC_ADMIN_API_URL or NEXT_PUBLIC_LARAVEL_API_URL).
 */

const getApiBase = (): string => {
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
  };
}

export async function fetchPublicCms(): Promise<PublicCmsPayload | null> {
  const base = getApiBase();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/public/cms`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as PublicCmsPayload;
    if (!data?.site || !data?.navigation) return null;
    return normalizeCmsPayload(data);
  } catch {
    return null;
  }
}

/** Non-empty trimmed string */
export function cmsString(v: string | null | undefined): string | null {
  const t = (v ?? "").trim();
  return t.length ? t : null;
}
