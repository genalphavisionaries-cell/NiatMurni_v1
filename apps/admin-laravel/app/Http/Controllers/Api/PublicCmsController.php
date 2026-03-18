<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomepageSection;
use App\Models\Setting;
use App\Models\SiteNavigationItem;
use App\Support\FrontendCmsSettingKeys;
use Illuminate\Http\JsonResponse;

/**
 * Structured public CMS payload for Next.js (Step 3).
 * Does not replace GET /api/homepage-settings (legacy HomepageSetting singleton).
 */
class PublicCmsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $s = fn (string $key): string => (string) (Setting::query()->where('key', $key)->value('value') ?? '');

        $site = [
            'site_name' => $s(FrontendCmsSettingKeys::SITE_NAME),
            'site_tagline' => $s(FrontendCmsSettingKeys::SITE_TAGLINE),
            'logo_url' => $s(FrontendCmsSettingKeys::LOGO_URL),
            'favicon_url' => $s(FrontendCmsSettingKeys::FAVICON_URL),
            'primary_cta_label' => $s(FrontendCmsSettingKeys::PRIMARY_CTA_LABEL),
            'primary_cta_url' => $s(FrontendCmsSettingKeys::PRIMARY_CTA_URL),
        ];

        $theme = [
            'primary_color' => $s(FrontendCmsSettingKeys::THEME_PRIMARY_COLOR),
            'secondary_color' => $s(FrontendCmsSettingKeys::THEME_SECONDARY_COLOR),
            'accent_color' => $s(FrontendCmsSettingKeys::THEME_ACCENT_COLOR),
            'background_color' => $s(FrontendCmsSettingKeys::THEME_BACKGROUND_COLOR),
            'text_color' => $s(FrontendCmsSettingKeys::THEME_TEXT_COLOR),
            'header_background_color' => $s(FrontendCmsSettingKeys::THEME_HEADER_BACKGROUND_COLOR),
            'footer_background_color' => $s(FrontendCmsSettingKeys::THEME_FOOTER_BACKGROUND_COLOR),
        ];

        $seo = [
            'homepage_seo_title' => $s(FrontendCmsSettingKeys::SEO_HOMEPAGE_TITLE),
            'homepage_seo_description' => $s(FrontendCmsSettingKeys::SEO_HOMEPAGE_DESCRIPTION),
            'homepage_og_image_url' => $s(FrontendCmsSettingKeys::SEO_HOMEPAGE_OG_IMAGE_URL),
            'default_seo_title' => $s(FrontendCmsSettingKeys::SEO_DEFAULT_TITLE),
            'default_seo_description' => $s(FrontendCmsSettingKeys::SEO_DEFAULT_DESCRIPTION),
        ];

        $showPayment = trim($s(FrontendCmsSettingKeys::FOOTER_SHOW_PAYMENT_CARD)) !== '0';

        $footer = [
            'description' => $s(FrontendCmsSettingKeys::FOOTER_DESCRIPTION),
            'bottom_text' => $s(FrontendCmsSettingKeys::FOOTER_BOTTOM_TEXT),
            'show_payment_card' => $showPayment,
            'payment_headline' => $s(FrontendCmsSettingKeys::FOOTER_PAYMENT_HEADLINE),
            'ssl_badge_url' => $s(FrontendCmsSettingKeys::FOOTER_SSL_BADGE_URL),
            'ssl_caption' => $s(FrontendCmsSettingKeys::FOOTER_SSL_CAPTION),
        ];

        $contact = [
            'email' => $s(FrontendCmsSettingKeys::CONTACT_EMAIL),
            'phone' => $s(FrontendCmsSettingKeys::CONTACT_PHONE),
            'address' => $s(FrontendCmsSettingKeys::CONTACT_ADDRESS),
        ];

        $social = [
            'facebook_url' => $s(FrontendCmsSettingKeys::SOCIAL_FACEBOOK_URL),
            'instagram_url' => $s(FrontendCmsSettingKeys::SOCIAL_INSTAGRAM_URL),
            'linkedin_url' => $s(FrontendCmsSettingKeys::SOCIAL_LINKEDIN_URL),
        ];

        return response()->json([
            'site' => $site,
            'theme' => $theme,
            'seo' => $seo,
            'footer' => $footer,
            'contact' => $contact,
            'social' => $social,
            'navigation' => [
                'header' => $this->buildNavTree(SiteNavigationItem::LOCATION_HEADER),
                'footer' => $this->buildNavTree(SiteNavigationItem::LOCATION_FOOTER),
                'footer_legal' => $this->buildFlatNavList(SiteNavigationItem::LOCATION_FOOTER_LEGAL),
                'footer_login' => $this->buildFlatNavList(SiteNavigationItem::LOCATION_FOOTER_LOGIN),
            ],
            'homepage_sections' => HomepageSection::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get()
                ->map(fn (HomepageSection $row) => [
                    'section_key' => $row->section_key,
                    'name' => $row->name,
                    'sort_order' => $row->sort_order,
                    'title' => $row->title,
                    'subtitle' => $row->subtitle,
                    'description' => $row->description,
                    'image_url' => $row->image_url,
                    'button_primary_label' => $row->button_primary_label,
                    'button_primary_url' => $row->button_primary_url,
                    'button_secondary_label' => $row->button_secondary_label,
                    'button_secondary_url' => $row->button_secondary_url,
                    'extra_data' => $row->extra_data,
                ])
                ->values()
                ->all(),
        ]);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function buildNavTree(string $location): array
    {
        $all = SiteNavigationItem::query()
            ->where('location', $location)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $byParent = $all->groupBy(fn (SiteNavigationItem $i) => $i->parent_id ?? 0);

        $build = function (?int $parentId) use (&$build, $byParent): array {
            $rows = $byParent->get($parentId ?? 0, collect());
            $out = [];
            foreach ($rows as $item) {
                $out[] = [
                    'id' => $item->id,
                    'label' => $item->label,
                    'url' => $item->url,
                    'open_in_new_tab' => (bool) $item->open_in_new_tab,
                    'is_button' => (bool) $item->is_button,
                    'children' => $build($item->id),
                ];
            }

            return $out;
        };

        return $build(null);
    }

    /**
     * Top-level links only (legal strip, login portals).
     *
     * @return array<int, array<string, mixed>>
     */
    private function buildFlatNavList(string $location): array
    {
        return SiteNavigationItem::query()
            ->where('location', $location)
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->whereNotNull('url')
            ->where('url', '!=', '')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (SiteNavigationItem $item) => [
                'id' => $item->id,
                'label' => $item->label,
                'url' => $item->url,
                'open_in_new_tab' => (bool) $item->open_in_new_tab,
                'is_button' => (bool) $item->is_button,
                'children' => [],
            ])
            ->values()
            ->all();
    }
}
