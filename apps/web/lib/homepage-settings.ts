/**
 * Homepage settings shape — to be loaded from admin API later (e.g. Homepage Settings in Filament).
 * All sections are optional; defaults used when missing.
 * Admin can customize: logo upload, header menu, footer columns/links, hero headline/banner, main banners.
 */

export type NavLink = {
  label: string;
  href: string;
  external?: boolean;
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
};
