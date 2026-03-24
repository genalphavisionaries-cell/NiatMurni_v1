<?php

namespace App\Services;

use App\Models\CmsItem;
use App\Models\CmsPage;
use App\Models\CmsSection;
use App\Models\CmsTestimonial;
use Illuminate\Support\Facades\Cache;

/**
 * Public homepage CMS: cms_pages → cms_sections → cms_items (+ cms_testimonials for trust).
 *
 * Example payload shape (keys omitted when empty):
 * {
 *   "header": {"title":null,"subtitle":null,"content":{...},"items":{"menu_item":[...]}},
 *   "hero": {"content":{...},"items":[]},
 *   "trust": {"content":{...},"items":{"logo":[...]},"testimonials":[...]}
 * }
 */
class CmsService
{
    public const CACHE_KEY = 'cms_homepage';

    public const CACHE_TTL_SECONDS = 300;

    /**
     * Cached homepage payload for the public API.
     *
     * @return array<string, mixed>
     */
    public function getHomepage(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL_SECONDS, function () {
            return $this->mapToFrontend();
        });
    }

    public function forgetCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * @return array<string, mixed>
     */
    public function mapToFrontend(): array
    {
        $page = CmsPage::query()
            ->where('slug', 'homepage')
            ->where('is_active', true)
            ->first();

        if ($page === null) {
            return $this->emptyKeys();
        }

        $sections = $page->sections()
            ->where('is_active', true)
            ->with(['items' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get()
            ->keyBy('section_key');

        $keys = ['header', 'hero', 'usp', 'classes', 'trust', 'promo', 'footer', 'floating_menu'];
        $out = [];
        foreach ($keys as $key) {
            if ($key === 'trust') {
                continue;
            }
            $section = $sections->get($key);
            $out[$key] = $this->mapSection($section, $key);
        }

        $out['trust'] = $this->mergeTrustTestimonials(
            $this->mapSection($sections->get('trust'), 'trust')
        );

        return $out;
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private function emptyKeys(): array
    {
        return [
            'header' => [],
            'hero' => [],
            'usp' => [],
            'classes' => [],
            'trust' => [],
            'promo' => [],
            'footer' => [],
            'floating_menu' => [],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function mapSection(?CmsSection $section, string $expectedKey): array
    {
        if ($section === null || $section->section_key !== $expectedKey) {
            return [];
        }

        $content = $section->content_json ?? [];
        if (! is_array($content)) {
            $content = [];
        }

        $itemsByType = [];
        foreach ($section->items as $item) {
            $type = (string) $item->type;
            $itemsByType[$type][] = $this->mapItem($item);
        }

        $payload = [
            'section_key' => $section->section_key,
            'title' => $section->title,
            'subtitle' => $section->subtitle,
            'content' => $content,
            'items' => $itemsByType,
        ];

        return $this->hideIfEmpty($payload);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function hideIfEmpty(array $payload): array
    {
        $hasTitle = filled($payload['title'] ?? null) || filled($payload['subtitle'] ?? null);
        $hasContent = ($payload['content'] ?? []) !== [];
        $hasItems = ($payload['items'] ?? []) !== [];

        if (! $hasTitle && ! $hasContent && ! $hasItems) {
            return [];
        }

        return $payload;
    }

    /**
     * @return array<string, mixed>
     */
    private function mapItem(CmsItem $item): array
    {
        $extra = $item->extra_json ?? [];
        if (! is_array($extra)) {
            $extra = [];
        }

        return array_filter([
            'type' => $item->type,
            'title' => $item->title,
            'subtitle' => $item->subtitle,
            'description' => $item->description,
            'image_url' => $item->image_url,
            'icon_url' => $item->icon_url,
            'link_url' => $item->link_url,
            'extra' => $extra,
            'sort_order' => $item->sort_order,
        ], fn ($v) => $v !== null && $v !== '' && $v !== []);
    }

    /**
     * @param  array<string, mixed>  $trust
     * @return array<string, mixed>
     */
    private function mergeTrustTestimonials(array $trust): array
    {
        $list = CmsTestimonial::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (CmsTestimonial $t) => [
                'name' => $t->name,
                'image_url' => $t->image_url,
                'rating' => min(5, max(1, (int) $t->rating)),
                'content' => $t->content,
                'sort_order' => $t->sort_order,
            ])
            ->values()
            ->all();

        if ($list !== []) {
            $trust['testimonials'] = $list;
        }

        if ($trust === []) {
            return [];
        }

        return $trust;
    }
}
