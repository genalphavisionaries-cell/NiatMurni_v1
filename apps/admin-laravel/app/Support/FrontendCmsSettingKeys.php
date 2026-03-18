<?php

namespace App\Support;

/**
 * Keys stored in the `settings` table (App\Models\Setting) for global public-site CMS.
 * Values are plain strings (URLs, hex colors, SEO text). Empty string = unset until admin fills in.
 *
 * @see Database\Seeders\FrontendCmsFoundationSeeder
 */
final class FrontendCmsSettingKeys
{
    // A. Global site identity
    public const SITE_NAME = 'cms_site_name';
    public const SITE_TAGLINE = 'cms_site_tagline';
    public const LOGO_URL = 'cms_logo_url';
    public const FAVICON_URL = 'cms_favicon_url';
    public const PRIMARY_CTA_LABEL = 'cms_primary_cta_label';
    public const PRIMARY_CTA_URL = 'cms_primary_cta_url';

    // B. Theme / brand (hex or CSS color strings)
    public const THEME_PRIMARY_COLOR = 'cms_theme_primary_color';
    public const THEME_SECONDARY_COLOR = 'cms_theme_secondary_color';
    public const THEME_ACCENT_COLOR = 'cms_theme_accent_color';
    public const THEME_BACKGROUND_COLOR = 'cms_theme_background_color';
    public const THEME_TEXT_COLOR = 'cms_theme_text_color';
    public const THEME_HEADER_BACKGROUND_COLOR = 'cms_theme_header_background_color';
    public const THEME_FOOTER_BACKGROUND_COLOR = 'cms_theme_footer_background_color';

    // C. SEO
    public const SEO_HOMEPAGE_TITLE = 'cms_seo_homepage_title';
    public const SEO_HOMEPAGE_DESCRIPTION = 'cms_seo_homepage_description';
    public const SEO_HOMEPAGE_OG_IMAGE_URL = 'cms_seo_homepage_og_image_url';
    public const SEO_DEFAULT_TITLE = 'cms_seo_default_title';
    public const SEO_DEFAULT_DESCRIPTION = 'cms_seo_default_description';

    /**
     * @return array<string, string> key => human label
     */
    public static function all(): array
    {
        return [
            self::SITE_NAME => 'Site name',
            self::SITE_TAGLINE => 'Site tagline',
            self::LOGO_URL => 'Logo URL',
            self::FAVICON_URL => 'Favicon URL',
            self::PRIMARY_CTA_LABEL => 'Primary CTA label',
            self::PRIMARY_CTA_URL => 'Primary CTA URL',
            self::THEME_PRIMARY_COLOR => 'Primary brand color',
            self::THEME_SECONDARY_COLOR => 'Secondary brand color',
            self::THEME_ACCENT_COLOR => 'Accent color',
            self::THEME_BACKGROUND_COLOR => 'Page background color',
            self::THEME_TEXT_COLOR => 'Body text color',
            self::THEME_HEADER_BACKGROUND_COLOR => 'Header background color',
            self::THEME_FOOTER_BACKGROUND_COLOR => 'Footer background color',
            self::SEO_HOMEPAGE_TITLE => 'Homepage SEO title',
            self::SEO_HOMEPAGE_DESCRIPTION => 'Homepage meta description',
            self::SEO_HOMEPAGE_OG_IMAGE_URL => 'Homepage OG image URL',
            self::SEO_DEFAULT_TITLE => 'Default site SEO title',
            self::SEO_DEFAULT_DESCRIPTION => 'Default site meta description',
        ];
    }
}
