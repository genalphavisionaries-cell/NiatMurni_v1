<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomepageSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class HomepageSettingsController extends Controller
{
    /**
     * Return homepage settings as JSON for the public website.
     * Resolves storage paths to full URLs using APP_URL.
     */
    public function __invoke(): JsonResponse
    {
        $setting = HomepageSetting::singleton();
        $baseUrl = rtrim(config('app.url'), '/');

        $resolve = function (?string $path) use ($baseUrl): ?string {
            if (empty($path)) {
                return null;
            }
            if (str_starts_with($path, 'http')) {
                return $path;
            }
            return $baseUrl . '/' . ltrim(Storage::url($path), '/');
        };

        $hero = $setting->hero ?? [];
        $whyChoose = $setting->why_choose ?? [];
        $socialProof = $setting->social_proof ?? [];
        $mainBanners = $setting->main_banners ?? [];

        $out = [
            'siteName' => $setting->site_name,
            'logoUrl' => $resolve($setting->logo_url),
            'logoAlt' => $setting->logo_alt ?? $setting->site_name,
            'headerNav' => $this->mapNavLinks($setting->header_nav ?? []),
            'footerColumns' => $this->mapFooterColumns($setting->footer_columns ?? []),
            'footerBottom' => $setting->footer_bottom,
            'footerLogoUrl' => $resolve($setting->footer_logo_url),
            'footerDescription' => $setting->footer_description,
            'footerSslBadgeUrl' => $resolve($setting->footer_ssl_badge_url),
            'hero' => [
                'headline' => $hero['headline'] ?? '',
                'subheadline' => $hero['subheadline'] ?? '',
                'ctaText' => $hero['ctaText'] ?? '',
                'ctaHref' => $hero['ctaHref'] ?? '',
                'backgroundImageUrl' => $resolve($hero['backgroundImageUrl'] ?? null),
                'overlayOpacity' => (float) ($hero['overlayOpacity'] ?? 0.4),
            ],
            'mainBanners' => $this->mapMainBanners($mainBanners, $resolve),
            'whyChoose' => [
                'title' => $whyChoose['title'] ?? '',
                'subtitle' => $whyChoose['subtitle'] ?? '',
                'image' => $resolve($whyChoose['image'] ?? null),
                'benefits' => $this->mapBenefits($whyChoose['benefits'] ?? []),
            ],
            'socialProof' => [
                'title' => $socialProof['title'] ?? '',
                'subtitle' => $socialProof['subtitle'] ?? '',
                'google_rating' => (float) ($socialProof['google_rating'] ?? 5),
                'review_count' => (int) ($socialProof['review_count'] ?? 0),
                'brand_logos' => $this->mapBrandLogos($socialProof['brand_logos'] ?? [], $resolve),
                'testimonials' => $this->mapTestimonials($socialProof['testimonials'] ?? [], $resolve),
            ],
        ];

        $icons = $setting->payment_method_icons ?? [];
        if (is_array($icons) && $icons !== []) {
            $out['paymentMethodIcons'] = [];
            foreach ($icons as $key => $path) {
                $out['paymentMethodIcons'][$key] = $resolve($path);
            }
        }

        return response()->json($out);
    }

    private function mapNavLinks(array $items): array
    {
        $out = [];
        foreach ($items as $item) {
            $out[] = [
                'label' => $item['label'] ?? '',
                'href' => $item['href'] ?? '',
                'external' => (bool) ($item['external'] ?? false),
            ];
        }
        return $out;
    }

    private function mapFooterColumns(array $columns): array
    {
        $out = [];
        foreach ($columns as $col) {
            $links = [];
            foreach ($col['links'] ?? [] as $link) {
                $links[] = [
                    'label' => $link['label'] ?? '',
                    'href' => $link['href'] ?? '',
                    'external' => (bool) ($link['external'] ?? false),
                ];
            }
            $out[] = [
                'heading' => $col['heading'] ?? '',
                'links' => $links,
            ];
        }
        return $out;
    }

    private function mapMainBanners(array $banners, callable $resolve): array
    {
        $out = [];
        foreach ($banners as $b) {
            $out[] = [
                'id' => $b['id'] ?? (string) \Illuminate\Support\Str::uuid(),
                'title' => $b['title'] ?? '',
                'description' => $b['description'] ?? '',
                'imageUrl' => $resolve($b['imageUrl'] ?? null),
                'ctaText' => $b['ctaText'] ?? '',
                'ctaHref' => $b['ctaHref'] ?? '',
                'variant' => $b['variant'] ?? 'default',
            ];
        }
        return $out;
    }

    private function mapBenefits(array $benefits): array
    {
        $out = [];
        foreach ($benefits as $b) {
            $out[] = [
                'icon' => $b['icon'] ?? '',
                'title' => $b['title'] ?? '',
                'description' => $b['description'] ?? '',
                'order' => (int) ($b['order'] ?? 0),
            ];
        }
        usort($out, fn ($a, $b) => $a['order'] <=> $b['order']);
        return $out;
    }

    private function mapBrandLogos(array $logos, callable $resolve): array
    {
        $out = [];
        foreach ($logos as $l) {
            $out[] = [
                'company_name' => $l['company_name'] ?? '',
                'logo' => $resolve($l['logo'] ?? null),
                'order' => (int) ($l['order'] ?? 0),
            ];
        }
        usort($out, fn ($a, $b) => $a['order'] <=> $b['order']);
        return $out;
    }

    private function mapTestimonials(array $items, callable $resolve): array
    {
        $out = [];
        foreach ($items as $t) {
            $out[] = [
                'name' => $t['name'] ?? '',
                'role' => $t['role'] ?? null,
                'rating' => (int) ($t['rating'] ?? 5),
                'review' => $t['review'] ?? '',
                'avatar' => $resolve($t['avatar'] ?? null),
                'order' => (int) ($t['order'] ?? 0),
            ];
        }
        usort($out, fn ($a, $b) => $a['order'] <=> $b['order']);
        return $out;
    }
}
