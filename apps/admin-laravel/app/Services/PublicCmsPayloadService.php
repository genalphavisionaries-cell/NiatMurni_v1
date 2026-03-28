<?php

namespace App\Services;

/**
 * Maps relational CMS output ({@see CmsService::mapToFrontend()}) into the
 * {@see PublicCmsPayload} shape consumed by the Next.js public site
 * (homepage_sections + site/navigation/footer/...).
 */
class PublicCmsPayloadService
{
    public function __construct(
        private readonly CmsService $cms,
        private readonly SettingService $settings
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function build(): array
    {
        $h = $this->cms->getHomepage();

        $siteName = (string) $this->settings->get('branding', 'public_site_name', config('app.name'));

        $primaryColor = $this->themeColorSetting('primary_color', '#2563EB');
        $secondaryColor = $this->themeColorSetting('secondary_color', '#64748B');
        $accentColor = $this->themeColorSetting('accent_color', '#F59E0B');

        $header = is_array($h['header'] ?? null) ? $h['header'] : [];
        $footer = is_array($h['footer'] ?? null) ? $h['footer'] : [];

        $headerContent = is_array($header['content'] ?? null) ? $header['content'] : [];
        $footerContentBrand = is_array($footer['content']['brand'] ?? null) ? $footer['content']['brand'] : [];

        $logoUrl = (string) ($headerContent['logo_url'] ?? '');
        $cta = is_array($headerContent['cta'] ?? null) ? $headerContent['cta'] : [];

        $site = [
            'site_name' => $siteName,
            'site_tagline' => '',
            'logo_url' => $logoUrl,
            'favicon_url' => '',
            'primary_cta_label' => (string) ($cta['label'] ?? ''),
            'primary_cta_url' => (string) ($cta['url'] ?? ''),
        ];

        $primaryBtn = $this->themeColorSetting('primary_button_color', $primaryColor);
        $primaryBtnText = $this->themeColorSetting('primary_button_text_color', '#FFFFFF');

        $theme = [
            'primary_color' => $primaryColor,
            'secondary_color' => $secondaryColor,
            'primary_button_color' => $primaryBtn,
            'primary_button_text_color' => $primaryBtnText,
            'accent_color' => $accentColor,
            'background_color' => $this->themeColorSetting('background_color', '#FFFFFF'),
            'text_color' => $this->themeColorSetting('text_color', '#0F172A'),
            'header_background_color' => $this->themeColorSetting('header_background_color', '#FFFFFF'),
            'footer_background_color' => $this->themeColorSetting('footer_background_color', '#0F172A'),
            'secondary_button_color' => $this->themeColorSetting('secondary_button_color', 'transparent'),
            'secondary_button_text_color' => $this->themeColorSetting('secondary_button_text_color', $primaryColor),
            'secondary_button_border_color' => $this->themeColorSetting('secondary_button_border_color', $primaryColor),
        ];

        $seo = [
            'homepage_seo_title' => '',
            'homepage_seo_description' => '',
            'homepage_og_image_url' => '',
            'default_seo_title' => $siteName,
            'default_seo_description' => '',
        ];

        $footerBlock = [
            'description' => (string) ($footerContentBrand['description'] ?? ''),
            'bottom_text' => (string) ($footer['content']['bottom']['copyright'] ?? ''),
            'show_payment_card' => true,
            'payment_headline' => (string) ($footer['content']['payment']['title'] ?? ''),
            'ssl_badge_url' => (string) ($footer['content']['bottom']['ssl_badge_url'] ?? ''),
            'ssl_caption' => '',
        ];

        $contact = [
            'email' => '',
            'phone' => '',
            'address' => '',
        ];

        $social = [
            'facebook_url' => '',
            'instagram_url' => '',
            'linkedin_url' => '',
        ];

        $navigation = $this->buildNavigation($header, $footer);
        $headerColors = $this->extractHeaderColors($header);
        $footerColors = $this->extractFooterColors($footer);

        $homepageSections = [];
        $hero = $this->mapHeroSection(is_array($h['hero'] ?? null) ? $h['hero'] : []);
        if ($hero !== null) {
            $homepageSections[] = $hero;
        }
        $why = $this->mapWhyChooseSection($this->pickHomepageSection($h, 'why_choose_us', 'usp'));
        if ($why !== null) {
            $homepageSections[] = $why;
        }
        $classesSection = $this->mapClassesSection(is_array($h['classes'] ?? null) ? $h['classes'] : []);
        if ($classesSection !== null) {
            $homepageSections[] = $classesSection;
        }
        $testimonials = $this->mapTestimonialsSection($this->pickHomepageSection($h, 'testimonials', 'trust'));
        if ($testimonials !== null) {
            $homepageSections[] = $testimonials;
        }
        $ctaSection = $this->mapCtaSection($this->pickHomepageSection($h, 'cta', 'promo'));
        if ($ctaSection !== null) {
            $homepageSections[] = $ctaSection;
        }

        $floating = $this->mapFloatingMenu(is_array($h['floating_menu'] ?? null) ? $h['floating_menu'] : []);

        return [
            'version' => '1.0',
            'site' => $site,
            'theme' => $theme,
            'seo' => $seo,
            'footer' => $footerBlock,
            'contact' => $contact,
            'social' => $social,
            'navigation' => $navigation,
            'header_colors' => $headerColors,
            'footer_colors' => $footerColors,
            'homepage_sections' => $homepageSections,
            'last_updated' => date('c'),
            'floating_menu' => $floating,
        ];
    }

    /**
     * @param  array<string, mixed>  $header
     * @param  array<string, mixed>  $footer
     * @return array{header: array<int, mixed>, footer: array<int, mixed>, footer_legal: array<int, mixed>, footer_login: array<int, mixed>}
     */
    private function buildNavigation(array $header, array $footer): array
    {
        $id = 1;
        $nextId = static function () use (&$id): int {
            return $id++;
        };

        $menuItems = $header['items']['menu_item'] ?? [];
        $headerNav = [];
        if (is_array($menuItems)) {
            foreach ($menuItems as $row) {
                if (! is_array($row)) {
                    continue;
                }
                $headerNav[] = [
                    'id' => $nextId(),
                    'label' => (string) ($row['title'] ?? ''),
                    'url' => $row['link_url'] ?? null,
                    'open_in_new_tab' => ($row['extra']['nav_type'] ?? '') === 'external',
                    'is_button' => false,
                    'children' => [],
                ];
            }
        }

        $footerRoots = [];
        $quick = $footer['items']['quick_link'] ?? [];
        $quickLinks = [];
        if (is_array($quick)) {
            foreach ($quick as $row) {
                if (! is_array($row)) {
                    continue;
                }
                $quickLinks[] = [
                    'id' => $nextId(),
                    'label' => (string) ($row['title'] ?? ''),
                    'url' => $row['link_url'] ?? null,
                    'open_in_new_tab' => false,
                    'is_button' => false,
                    'children' => [],
                ];
            }
        }
        if ($quickLinks !== []) {
            $footerRoots[] = [
                'id' => $nextId(),
                'label' => 'Quick links',
                'url' => null,
                'open_in_new_tab' => false,
                'is_button' => false,
                'children' => $quickLinks,
            ];
        }

        $legal = $footer['items']['legal_link'] ?? [];
        $footerLegal = [];
        if (is_array($legal)) {
            foreach ($legal as $row) {
                if (! is_array($row)) {
                    continue;
                }
                $footerLegal[] = [
                    'id' => $nextId(),
                    'label' => (string) ($row['title'] ?? ''),
                    'url' => $row['link_url'] ?? null,
                    'open_in_new_tab' => false,
                    'is_button' => false,
                    'children' => [],
                ];
            }
        }

        $login = $footer['items']['footer_button'] ?? [];
        $footerLogin = [];
        if (is_array($login)) {
            foreach ($login as $row) {
                if (! is_array($row)) {
                    continue;
                }
                $footerLogin[] = [
                    'id' => $nextId(),
                    'label' => (string) ($row['title'] ?? ''),
                    'url' => $row['link_url'] ?? null,
                    'open_in_new_tab' => false,
                    'is_button' => true,
                    'children' => [],
                ];
            }
        }

        return [
            'header' => $headerNav,
            'footer' => $footerRoots,
            'footer_legal' => $footerLegal,
            'footer_login' => $footerLogin,
        ];
    }

    /**
     * @param  array<string, mixed>  $hero
     * @return array<string, mixed>|null
     */
    private function mapHeroSection(array $hero): ?array
    {
        $content = is_array($hero['content'] ?? null) ? $hero['content'] : [];
        $headline = (string) ($content['headline'] ?? '');
        $sub = (string) ($content['subheadline'] ?? '');
        $urls = $content['background_urls'] ?? [];
        if (! is_array($urls)) {
            $urls = [];
        }
        $urls = array_values(array_filter(array_map('trim', $urls), fn ($u) => $u !== ''));

        $buttons = $content['buttons'] ?? [];
        if (! is_array($buttons)) {
            $buttons = [];
        }
        $b0 = is_array($buttons[0] ?? null) ? $buttons[0] : [];
        $b1 = is_array($buttons[1] ?? null) ? $buttons[1] : [];

        if ($this->isEffectivelyEmpty($headline) && $this->isEffectivelyEmpty($sub) && $urls === [] && $buttons === []) {
            return null;
        }

        $slides = [];
        foreach ($urls as $u) {
            $slides[] = [
                'desktop_image_url' => $u,
                'mobile_image_url' => $u,
                'title' => $headline,
                'subtitle' => $sub,
                'button_primary_label' => (string) ($b0['label'] ?? ''),
                'button_primary_url' => (string) ($b0['url'] ?? ''),
                'button_secondary_label' => (string) ($b1['label'] ?? ''),
                'button_secondary_url' => (string) ($b1['url'] ?? ''),
            ];
        }

        $extra = [
            'overlay_opacity' => '0.25',
        ];
        if ($slides !== []) {
            $extra['slides_json'] = json_encode($slides);
        }

        $colors = $this->sectionColorFields($content);

        return [
            'section_key' => 'hero',
            'name' => 'Hero',
            'sort_order' => 0,
            'title' => ! $this->isEffectivelyEmpty($headline) ? $headline : null,
            'subtitle' => ! $this->isEffectivelyEmpty($sub) ? $sub : null,
            'description' => null,
            'image_url' => $urls[0] ?? null,
            'button_primary_label' => ($b0['label'] ?? '') !== '' ? (string) $b0['label'] : null,
            'button_primary_url' => ($b0['url'] ?? '') !== '' ? (string) $b0['url'] : null,
            'button_secondary_label' => ($b1['label'] ?? '') !== '' ? (string) $b1['label'] : null,
            'button_secondary_url' => ($b1['url'] ?? '') !== '' ? (string) $b1['url'] : null,
            'accent_color' => $colors['accent_color'],
            'button_color' => $colors['button_color'],
            'extra_data' => $extra,
        ];
    }

    /**
     * Homepage section why_choose_us (legacy DB/cache key "usp" handled in {@see pickHomepageSection()}).
     *
     * @param  array<string, mixed>  $usp
     * @return array<string, mixed>|null
     */
    private function mapWhyChooseSection(array $usp): ?array
    {
        $content = is_array($usp['content'] ?? null) ? $usp['content'] : [];
        $title = (string) ($content['title'] ?? '');
        $desc = (string) ($content['description'] ?? '');

        $points = $usp['items']['usp'] ?? [];
        $items = [];
        if (is_array($points)) {
            foreach ($points as $row) {
                if (! is_array($row)) {
                    continue;
                }
                $extra = is_array($row['extra'] ?? null) ? $row['extra'] : [];
                $items[] = [
                    'title' => (string) ($row['title'] ?? ''),
                    'description' => (string) ($row['description'] ?? ''),
                    'icon' => (string) ($row['icon_url'] ?? ''),
                    'background_color' => (string) ($extra['background_color'] ?? ''),
                ];
            }
        }

        $sideUrls = $content['side_images_urls'] ?? [];
        if (! is_array($sideUrls)) {
            $sideUrls = [];
        }
        $sideUrls = array_values(array_filter(array_map('trim', $sideUrls), fn ($u) => $u !== ''));

        if ($this->isEffectivelyEmpty($title) && $this->isEffectivelyEmpty($desc) && $items === [] && $sideUrls === []) {
            return null;
        }

        $extra = [];
        if ($items !== []) {
            $extra['items_json'] = json_encode($items);
        }
        if ($sideUrls !== []) {
            $extra['banner_images_json'] = json_encode($sideUrls);
        }

        $colors = $this->sectionColorFields($content);

        return [
            'section_key' => 'why_choose_us',
            'name' => 'Why choose us',
            'sort_order' => 1,
            'title' => ! $this->isEffectivelyEmpty($title) ? $title : null,
            'subtitle' => null,
            'description' => ! $this->isEffectivelyEmpty($desc) ? $desc : null,
            'image_url' => $sideUrls[0] ?? null,
            'button_primary_label' => null,
            'button_primary_url' => null,
            'button_secondary_label' => null,
            'button_secondary_url' => null,
            'accent_color' => $colors['accent_color'],
            'button_color' => $colors['button_color'],
            'extra_data' => $extra !== [] ? $extra : null,
        ];
    }

    /**
     * @param  array<string, mixed>  $trust
     * @return array<string, mixed>|null
     */
    private function mapTestimonialsSection(array $trust): ?array
    {
        $testimonials = $trust['testimonials'] ?? [];
        if (! is_array($testimonials)) {
            $testimonials = [];
        }

        $items = [];
        foreach ($testimonials as $row) {
            if (! is_array($row)) {
                continue;
            }
            $items[] = [
                'name' => (string) ($row['name'] ?? ''),
                'review' => (string) ($row['content'] ?? ''),
                'rating' => (int) ($row['rating'] ?? 5),
                'date' => '',
            ];
        }

        $logos = $trust['items']['logo'] ?? [];
        $brands = [];
        if (is_array($logos)) {
        foreach ($logos as $row) {
            if (! is_array($row)) {
                continue;
            }
            $t = is_string($row['title'] ?? null) ? trim($row['title']) : '';
            if ($t !== '') {
                $brands[] = [
                    'company_name' => $t,
                    'logo' => is_string($row['image_url'] ?? null) ? (trim($row['image_url']) ?: null) : null,
                ];
            }
        }
        }

        $content = is_array($trust['content'] ?? null) ? $trust['content'] : [];
        $gr = is_array($content['google_rating'] ?? null) ? $content['google_rating'] : [];
        $googleBlurb = (string) ($gr['text'] ?? '');
        $googleButtonLabel = (string) ($gr['button_label'] ?? '');
        $googleButtonUrl = (string) ($gr['button_url'] ?? '');
        $sectionHeading = (string) ($trust['title'] ?? '');

        $heading = ! $this->isEffectivelyEmpty($sectionHeading) ? $sectionHeading : (! $this->isEffectivelyEmpty($googleBlurb) ? $googleBlurb : '');
        if ($this->isEffectivelyEmpty($heading) && $items === [] && $brands === []) {
            return null;
        }

        $extra = [];
        if ($items !== []) {
            $extra['items_json'] = json_encode($items);
        }
        if ($brands !== []) {
            $extra['brands_json'] = json_encode($brands);
        }
        $extra['review_summary_json'] = json_encode(['rating' => 4.9, 'count' => 1300]);

        $colors = $this->sectionColorFields($content);

        $displayTitle = ! $this->isEffectivelyEmpty($heading) ? $heading : 'Apa Kata Peserta Kami';
        $displaySubtitle = (! $this->isEffectivelyEmpty($sectionHeading) && ! $this->isEffectivelyEmpty($googleBlurb) && 
            (is_string($sectionHeading) ? trim($sectionHeading) : '') !== (is_string($googleBlurb) ? trim($googleBlurb) : ''))
            ? $googleBlurb
            : null;

        return [
            'section_key' => 'testimonials',
            'name' => 'Testimonials',
            'sort_order' => 3,
            'title' => $displayTitle,
            'subtitle' => $displaySubtitle,
            'description' => null,
            'image_url' => null,
            'button_primary_label' => ! $this->isEffectivelyEmpty($googleButtonLabel) ? $googleButtonLabel : null,
            'button_primary_url' => ! $this->isEffectivelyEmpty($googleButtonUrl) ? $googleButtonUrl : null,
            'button_secondary_label' => null,
            'button_secondary_url' => null,
            'accent_color' => $colors['accent_color'],
            'button_color' => $colors['button_color'],
            'extra_data' => $extra,
        ];
    }

    /**
     * Upcoming classes strip (accent / button colors from CMS classes section).
     *
     * @param  array<string, mixed>  $classes  Output of {@see CmsService::mapSection()} for key "classes"
     * @return array<string, mixed>|null
     */
    private function mapClassesSection(array $classes): ?array
    {
        if ($classes === []) {
            return null;
        }

        $content = is_array($classes['content'] ?? null) ? $classes['content'] : [];
        $title = (string) ($content['title'] ?? '');
        $desc = (string) ($content['description'] ?? '');
        $buttonText = (string) ($content['button_text'] ?? '');
        $buttonUrl = (string) ($content['button_url'] ?? '');
        $colors = $this->sectionColorFields($content);
        $hasCopy = ! $this->isEffectivelyEmpty($title) || ! $this->isEffectivelyEmpty($desc);
        $hasButtonCta = ! $this->isEffectivelyEmpty($buttonText) || ! $this->isEffectivelyEmpty($buttonUrl);
        $hasColors = $colors['accent_color'] !== null || $colors['button_color'] !== null;
        if (! $hasCopy && ! $hasColors && ! $hasButtonCta) {
            return null;
        }

        return [
            'section_key' => 'classes',
            'name' => 'Classes',
            'sort_order' => 2,
            'title' => ! $this->isEffectivelyEmpty($title) ? $title : null,
            'subtitle' => null,
            'description' => ! $this->isEffectivelyEmpty($desc) ? $desc : null,
            'image_url' => null,
            'button_primary_label' => ! $this->isEffectivelyEmpty($buttonText) ? $buttonText : null,
            'button_primary_url' => ! $this->isEffectivelyEmpty($buttonUrl) ? $buttonUrl : null,
            'button_secondary_label' => null,
            'button_secondary_url' => null,
            'accent_color' => $colors['accent_color'],
            'button_color' => $colors['button_color'],
            'extra_data' => null,
        ];
    }

    /**
     * Homepage section cta / promotions block ({@see PromotionsSection}). Legacy key "promo" in {@see pickHomepageSection()}.
     *
     * @param  array<string, mixed>  $promo
     * @return array<string, mixed>|null
     */
    private function mapCtaSection(array $promo): ?array
    {
        $content = is_array($promo['content'] ?? null) ? $promo['content'] : [];
        $sectionTitle = (string) ($content['title'] ?? '');
        $sectionDesc = (string) ($content['description'] ?? '');
        $bannerUrls = $content['banner_urls'] ?? [];
        if (! is_array($bannerUrls)) {
            $bannerUrls = [];
        }
        $bannerUrls = array_values(array_filter(array_map('trim', $bannerUrls), fn ($u) => $u !== ''));

        $cards = $promo['items']['promo_card'] ?? [];
        $promos = [];
        if (is_array($cards)) {
            foreach ($cards as $row) {
                if (! is_array($row)) {
                    continue;
                }
                $extra = is_array($row['extra'] ?? null) ? $row['extra'] : [];
                $promos[] = [
                    'image_url' => (string) ($row['image_url'] ?? ''),
                    'title' => (string) ($row['title'] ?? ''),
                    'description' => (string) ($row['description'] ?? ''),
                    'button_label' => (string) ($extra['button_label'] ?? ''),
                    'button_url' => (string) ($row['link_url'] ?? ''),
                ];
            }
        }

        if ($this->isEffectivelyEmpty($sectionTitle) && $this->isEffectivelyEmpty($sectionDesc) && $promos === []) {
            return null;
        }

        $ribbon = 'Promosi Terhad';
        if (! $this->isEffectivelyEmpty($sectionDesc)) {
            $d = is_string($sectionDesc) ? trim($sectionDesc) : '';
            $ribbon = mb_strlen($d) > 80 ? mb_substr($d, 0, 77).'...' : $d;
        }

        $extra = [
            'promos_json' => json_encode($promos),
            'banner_text' => $ribbon,
        ];
        if ($bannerUrls !== []) {
            $extra['banner_images_json'] = json_encode($bannerUrls);
        }

        $colors = $this->sectionColorFields($content);

        return [
            'section_key' => 'cta',
            'name' => 'Promotions',
            'sort_order' => 4,
            'title' => ! $this->isEffectivelyEmpty($sectionTitle) ? $sectionTitle : null,
            'subtitle' => $ribbon,
            'description' => ! $this->isEffectivelyEmpty($sectionDesc) ? $sectionDesc : null,
            'image_url' => $bannerUrls[0] ?? null,
            'button_primary_label' => null,
            'button_primary_url' => null,
            'button_secondary_label' => null,
            'button_secondary_url' => null,
            'accent_color' => $colors['accent_color'],
            'button_color' => $colors['button_color'],
            'extra_data' => $extra,
        ];
    }

    /**
     * @param  array<string, mixed>  $floating
     * @return array{enabled: bool, items: array<int, array<string, mixed>>}
     */
    private function mapFloatingMenu(array $floating): array
    {
        $content = is_array($floating['content'] ?? null) ? $floating['content'] : [];
        $enabled = (bool) ($content['enabled'] ?? false);
        $rawItems = $floating['items']['quick_link'] ?? [];
        $items = [];
        if (is_array($rawItems)) {
            foreach ($rawItems as $row) {
                if (! is_array($row)) {
                    continue;
                }
                $items[] = [
                    'label' => (string) ($row['subtitle'] ?? ''),
                    'url' => $row['link_url'] ?? null,
                    'icon' => 'link',
                    'action' => 'link',
                ];
            }
        }

        return ['enabled' => $enabled, 'items' => $items];
    }

    /**
     * @param  array<string, mixed>  $homepage
     * @return array<string, mixed>
     */
    private function pickHomepageSection(array $homepage, string $key, string $legacyKey): array
    {
        foreach ([$key, $legacyKey] as $k) {
            if (! array_key_exists($k, $homepage) || ! is_array($homepage[$k])) {
                continue;
            }
            $block = $homepage[$k];
            // mapSection() returns [] when empty; [] must not win over a populated legacy slot
            if ($block !== []) {
                return $block;
            }
        }

        return [];
    }

    /** Normalised hex (or empty) from platform branding settings. */
    private function themeColorSetting(string $key, string $defaultHex): string
    {
        $raw = $this->settings->get('branding', $key, $defaultHex);
        $s = is_string($raw) ? trim($raw) : '';
        if ($s === '') {
            return $defaultHex;
        }
        if (preg_match('/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/', $s)) {
            return strlen($s) === 4 ? $this->expandHex3($s) : $s;
        }

        return $defaultHex;
    }

    private function expandHex3(string $hex): string
    {
        $h = substr($hex, 1);

        return '#'.$h[0].$h[0].$h[1].$h[1].$h[2].$h[2];
    }

    /**
     * Section-level colours from relational `content_json` (optional overrides for public site).
     *
     * @param  array<string, mixed>  $content
     * @return array{accent_color: ?string, button_color: ?string}
     */
    private function sectionColorFields(array $content): array
    {
        $accent = isset($content['accent_color']) ? trim((string) $content['accent_color']) : '';
        $button = isset($content['button_color']) ? trim((string) $content['button_color']) : '';

        return [
            'accent_color' => $accent !== '' ? $accent : null,
            'button_color' => $button !== '' ? $button : null,
        ];
    }

    /** Whether HTML has no visible text (used for section emptiness checks only). */
    private function isEffectivelyEmpty(string $s): bool
    {
        $t = trim(html_entity_decode(strip_tags($s), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
        $t = preg_replace('/\s+/u', ' ', $t) ?? $t;

        return $t === '';
    }

    /**
     * Extract header colors for frontend CSS variables.
     */
    private function extractHeaderColors(array $header): array
    {
        $content = is_array($header['content'] ?? null) ? $header['content'] : [];
        $colors = is_array($content['colors'] ?? null) ? $content['colors'] : [];
        
        return [
            'background' => $this->validateHexColor($colors['background'] ?? '', '#FFFFFF'),
            'border' => $this->validateHexColor($colors['border'] ?? '', '#E5E7EB'),
            'menu_background' => $this->validateHexColor($colors['menu_background'] ?? '', 'transparent'),
            'menu_text' => $this->validateHexColor($colors['menu_text'] ?? '', '#0F172A'),
            'menu_hover_background' => $this->validateHexColor($colors['menu_hover_background'] ?? '', '#F8FAFC'),
            'menu_hover_text' => $this->validateHexColor($colors['menu_hover_text'] ?? '', '#2563EB'),
            'sticky_background' => $this->validateHexColor($colors['sticky_background'] ?? '', '#FFFFFF'),
            'sticky_text' => $this->validateHexColor($colors['sticky_text'] ?? '', '#0F172A'),
            'sticky_hover_background' => $this->validateHexColor($colors['sticky_hover_background'] ?? '', '#F8FAFC'),
            'sticky_hover_text' => $this->validateHexColor($colors['sticky_hover_text'] ?? '', '#2563EB'),
        ];
    }

    /**
     * Extract footer colors for frontend CSS variables.
     */
    private function extractFooterColors(array $footer): array
    {
        $content = is_array($footer['content'] ?? null) ? $footer['content'] : [];
        $colors = is_array($content['colors'] ?? null) ? $content['colors'] : [];
        
        return [
            'background' => $this->validateHexColor($colors['background'] ?? '', '#0F172A'),
            'text' => $this->validateHexColor($colors['text'] ?? '', '#E5E7EB'),
            'link_text' => $this->validateHexColor($colors['link_text'] ?? '', '#CBD5E1'),
            'link_hover' => $this->validateHexColor($colors['link_hover'] ?? '', '#FFFFFF'),
            'heading' => $this->validateHexColor($colors['heading'] ?? '', '#FFFFFF'),
            'button_background' => $this->validateHexColor($colors['button_background'] ?? '', 'transparent'),
            'button_text' => $this->validateHexColor($colors['button_text'] ?? '', '#FFFFFF'),
            'button_border' => $this->validateHexColor($colors['button_border'] ?? '', '#334155'),
            'button_hover' => $this->validateHexColor($colors['button_hover'] ?? '', 'rgba(255,255,255,0.1)'),
        ];
    }

    /**
     * Validate hex color or return default.
     */
    private function validateHexColor($color, string $default): string
    {
        $color = is_string($color) ? trim($color) : '';
        
        // Allow transparent and rgba values
        if ($color === 'transparent' || str_starts_with($color, 'rgba(')) {
            return $color;
        }
        
        // Validate hex color format
        if (preg_match('/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/', $color)) {
            return strlen($color) === 4 ? $this->expandHex3($color) : $color;
        }
        
        return $default;
    }
}
