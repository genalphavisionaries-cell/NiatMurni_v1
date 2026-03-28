/** Shared nav link shape for CMS-driven header/footer (no legacy homepage-settings). */

export type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};
