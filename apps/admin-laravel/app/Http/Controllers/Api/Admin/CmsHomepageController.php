<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CmsItem;
use App\Models\CmsPage;
use App\Models\CmsSection;
use App\Services\CmsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Throwable;

class CmsHomepageController extends Controller
{
    public function show(): JsonResponse
    {
        $page = CmsPage::query()->firstOrCreate(
            ['slug' => 'homepage'],
            ['title' => 'Homepage', 'is_active' => true],
        );

        $sections = $page->sections()
            ->with(['items' => fn ($q) => $q->orderBy('sort_order')])
            ->get()
            ->keyBy('section_key');

        return response()->json([
            'data' => [
                'hero' => $this->readHero($sections->get('hero')),
                'why_choose_us' => $this->readUsp($this->sectionFromCollection($sections, 'why_choose_us', 'usp')),
                'classes' => $this->readClasses($sections->get('classes')),
                'testimonials' => $this->readTrust($this->sectionFromCollection($sections, 'testimonials', 'trust')),
                'cta' => $this->readPromo($this->sectionFromCollection($sections, 'cta', 'promo')),
                'header' => $this->readHeader($sections->get('header')),
                'footer' => $this->readFooter($sections->get('footer')),
                'floating_menu' => $this->readFloating($sections->get('floating_menu')),
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $page = CmsPage::query()->firstOrCreate(
            ['slug' => 'homepage'],
            ['title' => 'Homepage', 'is_active' => true],
        );

        try {
            DB::transaction(function () use ($page, $request) {
                if ($request->has('hero')) {
                    $this->persistHero($page, $this->inputArray($request, 'hero'));
                }
                if ($request->has('why_choose_us')) {
                    $this->persistUsp($page, $this->inputArray($request, 'why_choose_us'));
                } elseif ($request->has('usp')) {
                    $this->persistUsp($page, $this->inputArray($request, 'usp'));
                }
                if ($request->has('classes')) {
                    $this->persistClasses($page, $this->inputArray($request, 'classes'));
                }
                if ($request->has('testimonials')) {
                    $this->persistTrust($page, $this->inputArray($request, 'testimonials'));
                } elseif ($request->has('trust')) {
                    $this->persistTrust($page, $this->inputArray($request, 'trust'));
                }
                if ($request->has('cta')) {
                    $this->persistPromo($page, $this->inputArray($request, 'cta'));
                } elseif ($request->has('promo')) {
                    $this->persistPromo($page, $this->inputArray($request, 'promo'));
                }
                if ($request->has('header')) {
                    $this->persistHeader($page, $this->inputArray($request, 'header'));
                }
                if ($request->has('footer')) {
                    $this->persistFooter($page, $this->inputArray($request, 'footer'));
                }
                if ($request->has('floating_menu')) {
                    $this->persistFloating($page, $this->inputArray($request, 'floating_menu'));
                }
            });
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Failed to save homepage CMS data.',
            ], 422);
        }

        app(CmsService::class)->forgetCache();

        return response()->json(['message' => 'Homepage saved.']);
    }

    // ─── Section helpers ──────────────────────────────────────────────────

    private function section(CmsPage $page, string $key): CmsSection
    {
        return $page->sections()->firstOrCreate(
            ['section_key' => $key],
            ['title' => ucfirst(str_replace('_', ' ', $key)), 'content_json' => [], 'is_active' => true, 'sort_order' => 0],
        );
    }

    /** Prefer canonical key; fall back to legacy row before migrations. */
    private function sectionFromCollection(Collection $sections, string $key, string $legacyKey): ?CmsSection
    {
        return $sections->get($key) ?? $sections->get($legacyKey);
    }

    /**
     * @return array<int, string>
     */
    private function splitLines(?string $raw): array
    {
        return array_values(array_filter(array_map('trim', explode("\n", $raw ?? ''))));
    }

    /**
     * Read a request key as array; malformed scalar/object payloads become [].
     *
     * @return array<string, mixed>
     */
    private function inputArray(Request $request, string $key): array
    {
        $value = $request->input($key, []);
        if (! is_array($value)) {
            return [];
        }

        return $value;
    }

    /**
     * @param  array<int, string>  $urls
     * @return array<int, string>
     */
    private function zipAlts(array $urls, ?string $altsRaw): array
    {
        $alts = $this->splitLines($altsRaw);
        $out = [];
        foreach (array_keys($urls) as $i) {
            $out[] = $alts[$i] ?? '';
        }

        return $out;
    }

    // ─── Hero ─────────────────────────────────────────────────────────────

    private function readHero(?CmsSection $s): array
    {
        if (! $s) {
            return [
                'headline' => '',
                'subheadline' => '',
                'buttons' => [],
                'background_urls' => '',
                'background_alts' => '',
                'accent_color' => '',
                'enabled' => true,
            ];
        }
        $c = $s->content_json ?? [];
        $urls = $c['background_urls'] ?? [];

        return [
            'headline' => $c['headline'] ?? '',
            'subheadline' => $c['subheadline'] ?? '',
            'buttons' => $c['buttons'] ?? [],
            'background_urls' => implode("\n", is_array($urls) ? $urls : []),
            'background_alts' => implode("\n", $c['background_alts'] ?? []),
            'accent_color' => $c['accent_color'] ?? '',
            'enabled' => (bool) $s->is_active,
        ];
    }

    private function persistHero(CmsPage $page, array $hero): void
    {
        $section = $this->section($page, 'hero');
        $lines = $this->splitLines($hero['background_urls'] ?? '');
        $urls = array_slice($lines, 0, 5);
        $alts = array_slice($this->zipAlts($urls, $hero['background_alts'] ?? ''), 0, count($urls));
        $section->content_json = [
            'headline' => $hero['headline'] ?? '',
            'subheadline' => $hero['subheadline'] ?? '',
            'buttons' => $hero['buttons'] ?? [],
            'background_urls' => $urls,
            'background_alts' => $alts,
            'accent_color' => $hero['accent_color'] ?? '',
        ];
        if (array_key_exists('enabled', $hero)) {
            $section->is_active = (bool) $hero['enabled'];
        }
        $section->save();
    }

    // ─── USP ──────────────────────────────────────────────────────────────

    private function readUsp(?CmsSection $s): array
    {
        if (! $s) {
            return [
                'title' => '',
                'description' => '',
                'points' => [],
                'side_images_urls' => '',
                'side_images_alts' => '',
                'accent_color' => '',
                'enabled' => true,
            ];
        }
        $c = $s->content_json ?? [];
        $points = [];
        foreach (($s->items ?? collect())->where('type', 'usp') as $item) {
            $extra = is_array($item->extra_json) ? $item->extra_json : [];
            $points[] = [
                'icon' => $item->icon_url ?? '',
                'title' => $item->title,
                'description' => $item->description,
                'background_color' => $extra['background_color'] ?? '',
                'icon_alt' => $extra['icon_alt'] ?? '',
            ];
        }

        $sideUrls = $c['side_images_urls'] ?? [];

        return [
            'title' => $c['title'] ?? '',
            'description' => $c['description'] ?? '',
            'points' => $points,
            'side_images_urls' => implode("\n", is_array($sideUrls) ? $sideUrls : []),
            'side_images_alts' => implode("\n", $c['side_images_alts'] ?? []),
            'accent_color' => $c['accent_color'] ?? '',
            'enabled' => (bool) $s->is_active,
        ];
    }

    private function persistUsp(CmsPage $page, array $usp): void
    {
        $section = $this->section($page, 'why_choose_us');
        $lines = $this->splitLines($usp['side_images_urls'] ?? '');
        $alts = $this->zipAlts($lines, $usp['side_images_alts'] ?? '');
        $section->content_json = [
            'title' => $usp['title'] ?? '',
            'description' => $usp['description'] ?? '',
            'side_images_urls' => $lines,
            'side_images_alts' => $alts,
            'accent_color' => $usp['accent_color'] ?? '',
        ];
        if (array_key_exists('enabled', $usp)) {
            $section->is_active = (bool) $usp['enabled'];
        }
        $section->save();

        $section->items()->where('type', 'usp')->delete();
        foreach ($usp['points'] ?? [] as $i => $row) {
            $extra = [
                'background_color' => $row['background_color'] ?? '',
                'icon_alt' => $row['icon_alt'] ?? '',
            ];
            CmsItem::query()->create([
                'section_id' => $section->id,
                'type' => 'usp',
                'title' => $row['title'] ?? '',
                'description' => $row['description'] ?? null,
                'icon_url' => $row['icon'] ?? null,
                'sort_order' => $i,
                'is_active' => true,
                'extra_json' => $extra,
            ]);
        }
    }

    // ─── Classes ──────────────────────────────────────────────────────────

    private function readClasses(?CmsSection $s): array
    {
        if (! $s) {
            return [
                'title' => '',
                'description' => '',
                'button_text' => '',
                'button_url' => '',
                'max_items' => 20,
                'accent_color' => '',
                'enabled' => true,
            ];
        }
        $c = $s->content_json ?? [];

        return [
            'title' => $c['title'] ?? '',
            'description' => $c['description'] ?? '',
            'button_text' => $c['button_text'] ?? '',
            'button_url' => $c['button_url'] ?? '',
            'max_items' => (int) ($c['max_items'] ?? 20),
            'accent_color' => $c['accent_color'] ?? '',
            'enabled' => (bool) $s->is_active,
        ];
    }

    private function persistClasses(CmsPage $page, array $data): void
    {
        $section = $this->section($page, 'classes');
        $section->content_json = [
            'title' => $data['title'] ?? '',
            'description' => $data['description'] ?? '',
            'button_text' => $data['button_text'] ?? '',
            'button_url' => $data['button_url'] ?? '',
            'max_items' => (int) ($data['max_items'] ?? 20),
            'accent_color' => $data['accent_color'] ?? '',
        ];
        if (array_key_exists('enabled', $data)) {
            $section->is_active = (bool) $data['enabled'];
        }
        $section->save();
    }

    // ─── Trust ────────────────────────────────────────────────────────────

    private function readTrust(?CmsSection $s): array
    {
        if (! $s) {
            return [
                'logos' => [],
                'google_rating_text' => '',
                'google_button_label' => '',
                'google_button_url' => '',
                'enabled' => true,
            ];
        }
        $c = $s->content_json ?? [];
        $logos = [];
        foreach (($s->items ?? collect())->where('type', 'logo') as $item) {
            $extra = is_array($item->extra_json) ? $item->extra_json : [];
            $logos[] = [
                'image_url' => $item->image_url,
                'title' => $item->title,
                'image_alt' => $extra['image_alt'] ?? '',
            ];
        }

        return [
            'logos' => $logos,
            'google_rating_text' => $c['google_rating']['text'] ?? '',
            'google_button_label' => $c['google_rating']['button_label'] ?? '',
            'google_button_url' => $c['google_rating']['button_url'] ?? '',
            'enabled' => (bool) $s->is_active,
        ];
    }

    private function persistTrust(CmsPage $page, array $trust): void
    {
        $section = $this->section($page, 'testimonials');
        $section->content_json = [
            'google_rating' => [
                'text' => $trust['google_rating_text'] ?? '',
                'button_label' => $trust['google_button_label'] ?? '',
                'button_url' => $trust['google_button_url'] ?? '',
            ],
        ];
        if (array_key_exists('enabled', $trust)) {
            $section->is_active = (bool) $trust['enabled'];
        }
        $section->save();

        $section->items()->where('type', 'logo')->delete();
        foreach ($trust['logos'] ?? [] as $i => $row) {
            CmsItem::query()->create([
                'section_id' => $section->id,
                'type' => 'logo',
                'title' => $row['title'] ?? '',
                'image_url' => $row['image_url'] ?? null,
                'sort_order' => $i,
                'is_active' => true,
                'extra_json' => ['image_alt' => $row['image_alt'] ?? ''],
            ]);
        }
    }

    // ─── Promo ────────────────────────────────────────────────────────────

    private function readPromo(?CmsSection $s): array
    {
        if (! $s) {
            return [
                'title' => '',
                'description' => '',
                'banner_urls' => '',
                'banner_alts' => '',
                'accent_color' => '',
                'cards' => [],
                'enabled' => true,
            ];
        }
        $c = $s->content_json ?? [];
        $cards = [];
        foreach (($s->items ?? collect())->where('type', 'promo_card') as $item) {
            $extra = is_array($item->extra_json) ? $item->extra_json : [];
            $cards[] = [
                'image_url' => $item->image_url,
                'title' => $item->title,
                'description' => $item->description,
                'button_label' => $extra['button_label'] ?? '',
                'url' => $item->link_url,
                'card_color' => $extra['card_color'] ?? '',
                'image_alt' => $extra['image_alt'] ?? '',
            ];
        }
        $banners = $c['banner_urls'] ?? [];

        return [
            'title' => $c['title'] ?? '',
            'description' => $c['description'] ?? '',
            'banner_urls' => implode("\n", is_array($banners) ? $banners : []),
            'banner_alts' => implode("\n", $c['banner_alts'] ?? []),
            'accent_color' => $c['accent_color'] ?? '',
            'cards' => $cards,
            'enabled' => (bool) $s->is_active,
        ];
    }

    private function persistPromo(CmsPage $page, array $promo): void
    {
        $section = $this->section($page, 'cta');
        $lines = $this->splitLines($promo['banner_urls'] ?? '');
        $urls = array_slice($lines, 0, 3);
        $alts = array_slice($this->zipAlts($urls, $promo['banner_alts'] ?? ''), 0, count($urls));
        $section->content_json = [
            'title' => $promo['title'] ?? '',
            'description' => $promo['description'] ?? '',
            'banner_urls' => $urls,
            'banner_alts' => $alts,
            'accent_color' => $promo['accent_color'] ?? '',
        ];
        if (array_key_exists('enabled', $promo)) {
            $section->is_active = (bool) $promo['enabled'];
        }
        $section->save();

        $section->items()->where('type', 'promo_card')->delete();
        foreach ($promo['cards'] ?? [] as $i => $row) {
            CmsItem::query()->create([
                'section_id' => $section->id,
                'type' => 'promo_card',
                'title' => $row['title'] ?? '',
                'description' => $row['description'] ?? null,
                'image_url' => $row['image_url'] ?? null,
                'link_url' => $row['url'] ?? null,
                'sort_order' => $i,
                'is_active' => true,
                'extra_json' => [
                    'button_label' => $row['button_label'] ?? '',
                    'card_color' => $row['card_color'] ?? '',
                    'image_alt' => $row['image_alt'] ?? '',
                ],
            ]);
        }
    }

    // ─── Header ───────────────────────────────────────────────────────────

    private function readHeader(?CmsSection $s): array
    {
        if (! $s) {
            return [
                'logo_url' => '',
                'logo_alt' => '',
                'menu_items' => [],
                'cta' => ['label' => '', 'url' => '', 'bg_color' => '', 'text_color' => ''],
                'languages' => [],
                'enabled' => true,
            ];
        }
        $c = $s->content_json ?? [];
        $menu = [];
        foreach (($s->items ?? collect())->where('type', 'menu_item') as $item) {
            $extra = $item->extra_json ?? [];
            $menu[] = [
                'label' => $item->title,
                'url' => $item->link_url,
                'type' => $extra['nav_type'] ?? 'page',
                'has_children' => (bool) ($extra['has_children'] ?? false),
            ];
        }

        return [
            'logo_url' => $c['logo_url'] ?? '',
            'logo_alt' => $c['logo_alt'] ?? '',
            'cta' => $c['cta'] ?? ['label' => '', 'url' => '', 'bg_color' => '', 'text_color' => ''],
            'languages' => $c['languages'] ?? [],
            'menu_items' => $menu,
            'enabled' => (bool) $s->is_active,
        ];
    }

    private function persistHeader(CmsPage $page, array $header): void
    {
        $section = $this->section($page, 'header');
        $section->content_json = [
            'logo_url' => $header['logo_url'] ?? '',
            'logo_alt' => $header['logo_alt'] ?? '',
            'cta' => $header['cta'] ?? [],
            'languages' => $header['languages'] ?? [],
        ];
        if (array_key_exists('enabled', $header)) {
            $section->is_active = (bool) $header['enabled'];
        }
        $section->save();

        $section->items()->where('type', 'menu_item')->delete();
        foreach ($header['menu_items'] ?? [] as $i => $row) {
            CmsItem::query()->create([
                'section_id' => $section->id,
                'type' => 'menu_item',
                'title' => $row['label'] ?? '',
                'link_url' => $row['url'] ?? null,
                'sort_order' => $i,
                'is_active' => true,
                'extra_json' => [
                    'nav_type' => $row['type'] ?? 'page',
                    'has_children' => (bool) ($row['has_children'] ?? false),
                ],
            ]);
        }
    }

    // ─── Footer ───────────────────────────────────────────────────────────

    private function readFooter(?CmsSection $s): array
    {
        if (! $s) {
            return [
                'brand' => ['logo_url' => '', 'description' => '', 'logo_alt' => ''],
                'quick_links' => [],
                'buttons' => [],
                'payment' => ['title' => '', 'icons_urls' => '', 'icons_alts' => ''],
                'legal_links' => [],
                'bottom' => ['copyright' => '', 'ssl_badge_url' => ''],
                'enabled' => true,
            ];
        }
        $c = $s->content_json ?? [];
        $quick = [];
        foreach (($s->items ?? collect())->where('type', 'quick_link') as $item) {
            $quick[] = ['label' => $item->title, 'url' => $item->link_url];
        }
        $buttons = [];
        foreach (($s->items ?? collect())->where('type', 'footer_button') as $item) {
            $buttons[] = ['label' => $item->title, 'url' => $item->link_url];
        }
        $legal = [];
        foreach (($s->items ?? collect())->where('type', 'legal_link') as $item) {
            $legal[] = ['label' => $item->title, 'url' => $item->link_url];
        }
        $icons = $c['payment']['icons'] ?? [];
        $iconAlts = $c['payment']['icon_alts'] ?? [];
        $brand = $c['brand'] ?? ['logo_url' => '', 'description' => '', 'logo_alt' => ''];

        return [
            'brand' => [
                'logo_url' => $brand['logo_url'] ?? '',
                'description' => $brand['description'] ?? '',
                'logo_alt' => $brand['logo_alt'] ?? '',
            ],
            'quick_links' => $quick,
            'buttons' => $buttons,
            'payment' => [
                'title' => $c['payment']['title'] ?? '',
                'icons_urls' => is_array($icons) ? implode("\n", $icons) : '',
                'icons_alts' => is_array($iconAlts) ? implode("\n", $iconAlts) : '',
            ],
            'legal_links' => $legal,
            'bottom' => $c['bottom'] ?? ['copyright' => '', 'ssl_badge_url' => ''],
            'enabled' => (bool) $s->is_active,
        ];
    }

    private function persistFooter(CmsPage $page, array $footer): void
    {
        $section = $this->section($page, 'footer');
        $lines = $this->splitLines($footer['payment']['icons_urls'] ?? '');
        $alts = $this->zipAlts($lines, $footer['payment']['icons_alts'] ?? '');
        $brand = $footer['brand'] ?? [];
        $section->content_json = [
            'brand' => [
                'logo_url' => $brand['logo_url'] ?? '',
                'description' => $brand['description'] ?? '',
                'logo_alt' => $brand['logo_alt'] ?? '',
            ],
            'payment' => [
                'title' => $footer['payment']['title'] ?? '',
                'icons' => $lines,
                'icon_alts' => $alts,
            ],
            'bottom' => $footer['bottom'] ?? [],
        ];
        if (array_key_exists('enabled', $footer)) {
            $section->is_active = (bool) $footer['enabled'];
        }
        $section->save();

        $section->items()->whereIn('type', ['quick_link', 'footer_button', 'legal_link'])->delete();
        foreach ($footer['quick_links'] ?? [] as $i => $row) {
            CmsItem::query()->create(['section_id' => $section->id, 'type' => 'quick_link', 'title' => $row['label'] ?? '', 'link_url' => $row['url'] ?? null, 'sort_order' => $i, 'is_active' => true]);
        }
        foreach ($footer['buttons'] ?? [] as $i => $row) {
            CmsItem::query()->create(['section_id' => $section->id, 'type' => 'footer_button', 'title' => $row['label'] ?? '', 'link_url' => $row['url'] ?? null, 'sort_order' => $i, 'is_active' => true]);
        }
        foreach ($footer['legal_links'] ?? [] as $i => $row) {
            CmsItem::query()->create(['section_id' => $section->id, 'type' => 'legal_link', 'title' => $row['label'] ?? '', 'link_url' => $row['url'] ?? null, 'sort_order' => $i, 'is_active' => true]);
        }
    }

    // ─── Floating ─────────────────────────────────────────────────────────

    private function readFloating(?CmsSection $s): array
    {
        if (! $s) {
            return ['enabled' => false, 'style_json' => '', 'items' => []];
        }
        $c = $s->content_json ?? [];
        $items = [];
        foreach (($s->items ?? collect())->where('type', 'quick_link') as $item) {
            $items[] = ['icon' => $item->icon_url ?? '', 'label' => $item->subtitle ?? '', 'url' => $item->link_url];
        }

        return [
            'enabled' => (bool) ($c['enabled'] ?? false),
            'style_json' => isset($c['style']) ? json_encode($c['style'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) : '',
            'items' => $items,
        ];
    }

    private function persistFloating(CmsPage $page, array $floating): void
    {
        $section = $this->section($page, 'floating_menu');
        $style = null;
        $raw = trim($floating['style_json'] ?? '');
        if ($raw !== '') {
            $decoded = json_decode($raw, true);
            $style = is_array($decoded) ? $decoded : null;
        }
        $section->content_json = [
            'enabled' => (bool) ($floating['enabled'] ?? false),
            'style' => $style,
        ];
        $section->save();

        $section->items()->where('type', 'quick_link')->delete();
        foreach ($floating['items'] ?? [] as $i => $row) {
            CmsItem::query()->create([
                'section_id' => $section->id,
                'type' => 'quick_link',
                'title' => '',
                'subtitle' => $row['label'] ?? '',
                'icon_url' => $row['icon'] ?? null,
                'link_url' => $row['url'] ?? null,
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }
    }
}
