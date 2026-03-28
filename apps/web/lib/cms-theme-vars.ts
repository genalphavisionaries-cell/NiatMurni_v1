/**
 * Generate CSS variables from CMS theme and color configuration
 */

import type { PublicCmsPayload, PublicCmsTheme, PublicCmsHeaderColors, PublicCmsFooterColors } from "./public-cms";

export function generateCmsThemeVars(cms: PublicCmsPayload | null): Record<string, string> {
  if (!cms) {
    return getDefaultThemeVars();
  }

  const theme = cms.theme;
  const headerColors = cms.header_colors;
  const footerColors = cms.footer_colors;

  return {
    // Base theme colors
    '--cms-primary': theme.primary_color || '#2563EB',
    '--cms-secondary': theme.secondary_color || '#64748B',
    '--cms-accent': theme.accent_color || '#F59E0B',
    '--cms-background': theme.background_color || '#FFFFFF',
    '--cms-text': theme.text_color || '#0F172A',

    // Button colors
    '--cms-btn-primary-bg': theme.primary_button_color || theme.primary_color || '#2563EB',
    '--cms-btn-primary-text': theme.primary_button_text_color || '#FFFFFF',
    '--cms-btn-secondary-bg': theme.secondary_button_color || 'transparent',
    '--cms-btn-secondary-text': theme.secondary_button_text_color || theme.primary_color || '#2563EB',
    '--cms-btn-secondary-border': theme.secondary_button_border_color || theme.primary_color || '#2563EB',

    // Header colors
    '--cms-header-bg': headerColors?.background || '#FFFFFF',
    '--cms-header-border': headerColors?.border || '#E5E7EB',
    '--cms-header-menu-bg': headerColors?.menu_background || 'transparent',
    '--cms-header-menu-text': headerColors?.menu_text || '#0F172A',
    '--cms-header-menu-hover-bg': headerColors?.menu_hover_background || '#F8FAFC',
    '--cms-header-menu-hover-text': headerColors?.menu_hover_text || '#2563EB',
    
    // Header sticky state colors  
    '--cms-header-sticky-bg': headerColors?.sticky_background || '#FFFFFF',
    '--cms-header-sticky-text': headerColors?.sticky_text || '#0F172A',
    '--cms-header-sticky-hover-bg': headerColors?.sticky_hover_background || '#F8FAFC',
    '--cms-header-sticky-hover-text': headerColors?.sticky_hover_text || '#2563EB',

    // Footer colors
    '--cms-footer-bg': footerColors?.background || '#0F172A',
    '--cms-footer-text': footerColors?.text || '#E5E7EB',
    '--cms-footer-link': footerColors?.link_text || '#CBD5E1',
    '--cms-footer-link-hover': footerColors?.link_hover || '#FFFFFF',
    '--cms-footer-heading': footerColors?.heading || '#FFFFFF',
    '--cms-footer-btn-bg': footerColors?.button_background || 'transparent',
    '--cms-footer-btn-text': footerColors?.button_text || '#FFFFFF',
    '--cms-footer-btn-border': footerColors?.button_border || '#334155',
    '--cms-footer-btn-hover': footerColors?.button_hover || 'rgba(255,255,255,0.1)',
  };
}

export function getDefaultThemeVars(): Record<string, string> {
  return {
    // Base theme
    '--cms-primary': '#2563EB',
    '--cms-secondary': '#64748B', 
    '--cms-accent': '#F59E0B',
    '--cms-background': '#FFFFFF',
    '--cms-text': '#0F172A',

    // Buttons
    '--cms-btn-primary-bg': '#2563EB',
    '--cms-btn-primary-text': '#FFFFFF',
    '--cms-btn-secondary-bg': 'transparent',
    '--cms-btn-secondary-text': '#2563EB',
    '--cms-btn-secondary-border': '#2563EB',

    // Header
    '--cms-header-bg': '#FFFFFF',
    '--cms-header-border': '#E5E7EB',
    '--cms-header-menu-bg': 'transparent',
    '--cms-header-menu-text': '#0F172A',
    '--cms-header-menu-hover-bg': '#F8FAFC',
    '--cms-header-menu-hover-text': '#2563EB',
    '--cms-header-sticky-bg': '#FFFFFF',
    '--cms-header-sticky-text': '#0F172A',
    '--cms-header-sticky-hover-bg': '#F8FAFC',
    '--cms-header-sticky-hover-text': '#2563EB',

    // Footer
    '--cms-footer-bg': '#0F172A',
    '--cms-footer-text': '#E5E7EB',
    '--cms-footer-link': '#CBD5E1',
    '--cms-footer-link-hover': '#FFFFFF',
    '--cms-footer-heading': '#FFFFFF',
    '--cms-footer-btn-bg': 'transparent',
    '--cms-footer-btn-text': '#FFFFFF',
    '--cms-footer-btn-border': '#334155',
    '--cms-footer-btn-hover': 'rgba(255,255,255,0.1)',
  };
}

/**
 * Apply CMS theme variables to document root
 */
export function applyCmsThemeVars(cms: PublicCmsPayload | null): void {
  if (typeof document === 'undefined') return; // SSR guard

  const vars = generateCmsThemeVars(cms);
  const root = document.documentElement;

  Object.entries(vars).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}

/**
 * Get inline style object for SSR-compatible theme application
 */
export function getCmsThemeStyleObject(cms: PublicCmsPayload | null): Record<string, string> {
  return generateCmsThemeVars(cms);
}