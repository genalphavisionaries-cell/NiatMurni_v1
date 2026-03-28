import type { PublicCmsHomepageSection, PublicCmsTheme } from "./public-cms";

function trimColor(v: string | null | undefined): string | null {
  if (v == null) return null;
  const t = String(v).trim();
  return t.length ? t : null;
}

/**
 * Section-level colors override global theme (empty section values fall back to theme).
 */
export function getSectionColor(
  section: Pick<PublicCmsHomepageSection, "accent_color" | "button_color">,
  theme: PublicCmsTheme
): { accent: string; buttonBg: string; buttonText: string } {
  const primary = trimColor(theme.primary_color) ?? "#2563EB";
  const btnTheme = trimColor(theme.primary_button_color) ?? primary;
  const btnText = trimColor(theme.primary_button_text_color) ?? "#FFFFFF";
  return {
    accent: trimColor(section.accent_color) ?? primary,
    buttonBg: trimColor(section.button_color) ?? btnTheme,
    buttonText: btnText,
  };
}
