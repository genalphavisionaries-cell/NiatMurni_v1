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

    // D. Footer & global contact (public site)
    public const FOOTER_DESCRIPTION = 'cms_footer_description';
    public const FOOTER_BOTTOM_TEXT = 'cms_footer_bottom_text';
    public const CONTACT_EMAIL = 'cms_contact_email';
    public const CONTACT_PHONE = 'cms_contact_phone';
    public const CONTACT_ADDRESS = 'cms_contact_address';
    public const SOCIAL_FACEBOOK_URL = 'cms_social_facebook_url';
    public const SOCIAL_INSTAGRAM_URL = 'cms_social_instagram_url';
    public const SOCIAL_LINKEDIN_URL = 'cms_social_linkedin_url';

    // E. Footer trust / payment card (legacy 4-column footer + optional CmsFooter strip)
    public const FOOTER_SHOW_PAYMENT_CARD = 'cms_footer_show_payment_card';
    public const FOOTER_PAYMENT_HEADLINE = 'cms_footer_payment_headline';
    public const FOOTER_SSL_BADGE_URL = 'cms_footer_ssl_badge_url';
    public const FOOTER_SSL_CAPTION = 'cms_footer_ssl_caption';

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
            self::FOOTER_DESCRIPTION => 'Footer intro text',
            self::FOOTER_BOTTOM_TEXT => 'Footer copyright / bottom line',
            self::CONTACT_EMAIL => 'Contact email',
            self::CONTACT_PHONE => 'Contact phone',
            self::CONTACT_ADDRESS => 'Contact address',
            self::SOCIAL_FACEBOOK_URL => 'Facebook URL',
            self::SOCIAL_INSTAGRAM_URL => 'Instagram URL',
            self::SOCIAL_LINKEDIN_URL => 'LinkedIn URL',
            self::FOOTER_SHOW_PAYMENT_CARD => 'Show payment & trust card',
            self::FOOTER_PAYMENT_HEADLINE => 'Payment card headline',
            self::FOOTER_SSL_BADGE_URL => 'SSL / trust badge image URL',
            self::FOOTER_SSL_CAPTION => 'SSL caption under badge',
        ];
    }
}
