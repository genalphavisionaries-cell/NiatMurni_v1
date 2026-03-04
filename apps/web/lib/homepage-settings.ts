/**
 * Homepage settings shape — to be loaded from admin API when NEXT_PUBLIC_ADMIN_API_URL is set.
 * All sections are optional; defaults used when missing.
 */

export type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

/** CMS: homepage_why_choose — benefit item editable in admin */
export type WhyChooseBenefit = {
  icon: string;
  title: string;
  description: string;
  order: number;
};

/** CMS: homepage_why_choose — section editable in admin */
export type WhyChooseSettings = {
  title: string;
  subtitle: string;
  image: string | null;
  benefits: WhyChooseBenefit[];
};

/** CMS: homepage_social_proof — brand logo item */
export type SocialProofBrandLogo = {
  logo: string | null;
  company_name: string;
  order: number;
};

/** CMS: homepage_social_proof — testimonial item */
export type SocialProofTestimonial = {
  name: string;
  role?: string;
  /** Optional display date (e.g. "February 11" or "March 11, 2021") */
  date?: string;
  rating: number;
  review: string;
  avatar: string | null;
  order: number;
};

/** CMS: homepage_social_proof — section editable in admin */
export type SocialProofSettings = {
  title: string;
  subtitle: string;
  google_rating: number;
  review_count: number;
  brand_logos: SocialProofBrandLogo[];
  testimonials: SocialProofTestimonial[];
};

export type HomepageSettings = {
  siteName: string;
  logoUrl: string | null;
  logoAlt: string;
  headerNav: NavLink[];
  footerColumns: {
    heading: string;
    links: NavLink[];
  }[];
  footerBottom: string;
  footerLogoUrl: string | null;
  footerDescription: string;
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaHref: string;
    backgroundImageUrl: string | null;
    overlayOpacity: number;
  };
  mainBanners: {
    id: string;
    title: string;
    description: string;
    imageUrl: string | null;
    ctaText: string;
    ctaHref: string;
    variant: "default" | "reverse";
  }[];
  whyChoose: WhyChooseSettings;
  socialProof: SocialProofSettings;
  paymentMethodIcons?: Record<string, string>;
  footerSslBadgeUrl?: string | null;
};

const defaultNav: NavLink[] = [
  { label: "Programs", href: "#programs" },
  { label: "Upcoming Classes", href: "#classes" },
  { label: "Register", href: "#register" },
  { label: "Contact", href: "#contact" },
];

const defaultFooterColumns = [
  {
    heading: "Programs",
    links: [
      { label: "KKM Food Handling", href: "/#programs" },
      { label: "Upcoming Classes", href: "/#classes" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/#about" },
      { label: "Contact", href: "/#contact" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "View My Booking", href: "/booking/1" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
];

export const defaultHomepageSettings: HomepageSettings = {
  siteName: "Niat Murni Academy",
  logoUrl: null,
  logoAlt: "Niat Murni Academy",
  headerNav: defaultNav,
  footerColumns: defaultFooterColumns,
  footerBottom: "© Niat Murni Academy. All rights reserved.",
  footerLogoUrl: null,
  footerDescription:
    "Penyedia latihan kursus pengendalian makanan untuk pengusaha makanan di seluruh Malaysia.",
  hero: {
    headline: "Professional Food Safety Training",
    subheadline:
      "KKM-recognised courses for food handlers. Get certified with industry-leading training—online or in person.",
    ctaText: "View Upcoming Classes",
    ctaHref: "#classes",
    backgroundImageUrl: null,
    overlayOpacity: 0.4,
  },
  mainBanners: [
    {
      id: "1",
      title: "KKM Food Handler Certification",
      description:
        "Meet regulatory requirements with our accredited food safety programme. Designed for food businesses and individuals who need recognised certification.",
      imageUrl: null,
      ctaText: "Register Now",
      ctaHref: "#classes",
      variant: "default",
    },
    {
      id: "2",
      title: "Flexible Learning Options",
      description:
        "Choose online or physical classes. We run sessions in multiple languages to suit your team and schedule.",
      imageUrl: null,
      ctaText: "See Schedule",
      ctaHref: "#classes",
      variant: "reverse",
    },
  ],
  whyChoose: {
    title: "Kenapa Pilih Kursus Oleh Niat Murni",
    subtitle: "Latihan pengendalian makanan yang mudah, cepat dan sah di Malaysia",
    image: null,
    benefits: [
      { icon: "monitor", title: "Kelas Online Mudah", description: "Belajar dari mana sahaja melalui Zoom.", order: 1 },
      { icon: "clock", title: "Hanya 3 Jam Kursus", description: "Latihan ringkas tetapi lengkap.", order: 2 },
      { icon: "award", title: "Sijil Sah KKM", description: "Digunakan untuk lesen perniagaan makanan.", order: 3 },
      { icon: "shield", title: "Sah Seumur Hidup", description: "Tidak perlu memperbaharui sijil.", order: 4 },
    ],
  },
  socialProof: {
    title: "Antara Syarikat Yang Pernah Menghadiri Kursus Kami",
    subtitle: "Dipercayai oleh pengusaha makanan dan organisasi di seluruh Malaysia.",
    google_rating: 5,
    review_count: 1300,
    brand_logos: [
      { logo: null, company_name: "KFC", order: 1 },
      { logo: null, company_name: "Subway", order: 2 },
      { logo: null, company_name: "DailyFresh", order: 3 },
      { logo: null, company_name: "PERKESO", order: 4 },
      { logo: null, company_name: "GIATMARA", order: 5 },
      { logo: null, company_name: "Richiamo Coffee", order: 6 },
      { logo: null, company_name: "Sushi+", order: 7 },
      { logo: null, company_name: "Golden Mah", order: 8 },
    ],
    testimonials: [
      {
        name: "Ika Azlan",
        role: "Pengusaha Restoran",
        date: "Februari 2025",
        rating: 5,
        review: "Terbaik dan sangat mudah faham. Kursus online sangat jelas dan cikgu sangat membantu.",
        avatar: null,
        order: 1,
      },
      {
        name: "Nona AB",
        date: "Mac 2025",
        rating: 5,
        review: "Alhamdulillah kelas sangat berbaloi. Tak mengantuk walaupun online.",
        avatar: null,
        order: 2,
      },
    ],
  },
};

const ADMIN_API = process.env.NEXT_PUBLIC_ADMIN_API_URL;

function deepMerge<T extends object>(defaults: T, overrides: Partial<T> | null | undefined): T {
  if (overrides == null || typeof overrides !== "object") return defaults;
  const out = { ...defaults };
  for (const key of Object.keys(overrides) as (keyof T)[]) {
    const d = (defaults as Record<string, unknown>)[key as string];
    const o = (overrides as Record<string, unknown>)[key as string];
    if (o != null && typeof o === "object" && !Array.isArray(o) && typeof d === "object" && d != null && !Array.isArray(d)) {
      (out as Record<string, unknown>)[key as string] = deepMerge(d as object, o as object);
    } else if (o !== undefined) {
      (out as Record<string, unknown>)[key as string] = o;
    }
  }
  return out;
}

/**
 * Fetch homepage settings from admin API when NEXT_PUBLIC_ADMIN_API_URL is set.
 * Falls back to defaultHomepageSettings on failure or when env is not set.
 */
export async function getHomepageSettings(): Promise<HomepageSettings> {
  if (!ADMIN_API?.trim()) return defaultHomepageSettings;
  try {
    const res = await fetch(`${ADMIN_API.replace(/\/$/, "")}/api/homepage-settings`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return defaultHomepageSettings;
    const data = (await res.json()) as Partial<HomepageSettings>;
    return deepMerge(defaultHomepageSettings, data);
  } catch {
    return defaultHomepageSettings;
  }
}
