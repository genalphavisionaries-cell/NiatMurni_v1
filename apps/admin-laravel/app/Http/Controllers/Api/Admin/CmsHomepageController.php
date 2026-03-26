<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CmsItem;
use App\Models\CmsPage;
use App\Models\CmsSection;
use App\Services\CmsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
                'usp' => $this->readUsp($sections->get('usp')),
                'classes' => $this->readClasses($sections->get('classes')),
                'trust' => $this->readTrust($sections->get('trust')),
                'promo' => $this->readPromo($sections->get('promo')),
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

        DB::transaction(function () use ($page, $request) {
            if ($request->has('hero')) {
                $this->persistHero($page, $request->input('hero', []));
            }
            if ($request->has('usp')) {
                $this->persistUsp($page, $request->input('usp', []));
            }
            if ($request->has('classes')) {
                $this->persistClasses($page, $request->input('classes', []));
            }
            if ($request->has('trust')) {
                $this->persistTrust($page, $request->input('trust', []));
            }
            if ($request->has('promo')) {
                $this->persistPromo($page, $request->input('promo', []));
            }
            if ($request->has('header')) {
                $this->persistHeader($page, $request->input('header', []));
            }
            if ($request->has('footer')) {
                $this->persistFooter($page, $request->input('footer', []));
            }
            if ($request->has('floating_menu')) {
                $this->persistFloating($page, $request->input('floating_menu', []));
            }
        });

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

    // ─── Hero ─────────────────────────────────────────────────────────────

    private function readHero(?CmsSection $s): array
    {
        if (! $s) {
            return ['headline' => '', 'subheadline' => '', 'buttons' => [], 'background_urls' => ''];
        }
        $c = $s->content_json ?? [];

        return [
            'headline' => $c['headline'] ?? '',
            'subheadline' => $c['subheadline'] ?? '',
            'buttons' => $c['buttons'] ?? [],
            'background_urls' => implode("\n", $c['background_urls'] ?? []),
        ];
    }

    private function persistHero(CmsPage $page, array $hero): void
    {
        $section = $this->section($page, 'hero');
        $lines = array_values(array_filter(array_map('trim', explode("\n", $hero['background_urls'] ?? ''))));
        $section->content_json = [
            'headline' => $hero['headline'] ?? '',
            'subheadline' => $hero['subheadline'] ?? '',
            'buttons' => $hero['buttons'] ?? [],
            'background_urls' => array_slice($lines, 0, 5),
        ];
        $section->save();
    }

    // ─── USP ──────────────────────────────────────────────────────────────

    private function readUsp(?CmsSection $s): array
    {
        if (! $s) {
            return ['title' => '', 'description' => '', 'points' => [], 'side_images_urls' => ''];
        }
        $c = $s->content_json ?? [];
        $points = [];
        foreach (($s->items ?? collect())->where('type', 'usp') as $item) {
            $points[] = ['icon' => $item->icon_url ?? '', 'title' => $item->title, 'description' => $item->description];
        }

        return [
            'title' => $c['title'] ?? '',
            'description' => $c['description'] ?? '',
            'points' => $points,
            'side_images_urls' => implode("\n", $c['side_images_urls'] ?? []),
        ];
    }

    private function persistUsp(CmsPage $page, array $usp): void
    {
        $section = $this->section($page, 'usp');
        $lines = array_values(array_filter(array_map('trim', explode("\n", $usp['side_images_urls'] ?? ''))));
        $section->content_json = [
            'title' => $usp['title'] ?? '',
            'description' => $usp['description'] ?? '',
            'side_images_urls' => $lines,
        ];
        $section->save();

        $section->items()->where('type', 'usp')->delete();
        foreach ($usp['points'] ?? [] as $i => $row) {
            CmsItem::query()->create([
                'section_id' => $section->id,
                'type' => 'usp',
                'title' => $row['title'] ?? '',
                'description' => $row['description'] ?? null,
                'icon_url' => $row['icon'] ?? null,
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }
    }

    // ─── Classes ──────────────────────────────────────────────────────────

    private function readClasses(?CmsSection $s): array
    {
        if (! $s) {
            return ['title' => '', 'description' => '', 'button_text' => '', 'button_url' => '', 'max_items' => 20];
        }
        $c = $s->content_json ?? [];

        return [
            'title' => $c['title'] ?? '',
            'description' => $c['description'] ?? '',
            'button_text' => $c['button_text'] ?? '',
            'button_url' => $c['button_url'] ?? '',
            'max_items' => (int) ($c['max_items'] ?? 20),
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
        ];
        $section->save();
    }

    // ─── Trust ────────────────────────────────────────────────────────────

    private function readTrust(?CmsSection $s): array
    {
        if (! $s) {
            return ['logos' => [], 'google_rating_text' => '', 'google_button_label' => '', 'google_button_url' => ''];
        }
        $c = $s->content_json ?? [];
        $logos = [];
        foreach (($s->items ?? collect())->where('type', 'logo') as $item) {
            $logos[] = ['image_url' => $item->image_url, 'title' => $item->title];
        }

        return [
            'logos' => $logos,
            'google_rating_text' => $c['google_rating']['text'] ?? '',
            'google_button_label' => $c['google_rating']['button_label'] ?? '',
            'google_button_url' => $c['google_rating']['button_url'] ?? '',
        ];
    }

    private function persistTrust(CmsPage $page, array $trust): void
    {
        $section = $this->section($page, 'trust');
        $section->content_json = [
            'google_rating' => [
                'text' => $trust['google_rating_text'] ?? '',
                'button_label' => $trust['google_button_label'] ?? '',
                'button_url' => $trust['google_button_url'] ?? '',
            ],
        ];
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
            ]);
        }
    }

    // ─── Promo ────────────────────────────────────────────────────────────

    private function readPromo(?CmsSection $s): array
    {
        if (! $s) {
            return ['title' => '', 'description' => '', 'banner_urls' => '', 'cards' => []];
        }
        $c = $s->content_json ?? [];
        $cards = [];
        foreach (($s->items ?? collect())->where('type', 'promo_card') as $item) {
            $extra = $item->extra_json ?? [];
            $cards[] = [
                'image_url' => $item->image_url,
                'title' => $item->title,
                'description' => $item->description,
                'button_label' => $extra['button_label'] ?? '',
                'url' => $item->link_url,
            ];
        }

        return [
            'title' => $c['title'] ?? '',
            'description' => $c['description'] ?? '',
            'banner_urls' => implode("\n", $c['banner_urls'] ?? []),
            'cards' => $cards,
        ];
    }

    private function persistPromo(CmsPage $page, array $promo): void
    {
        $section = $this->section($page, 'promo');
        $lines = array_values(array_filter(array_map('trim', explode("\n", $promo['banner_urls'] ?? ''))));
        $section->content_json = [
            'title' => $promo['title'] ?? '',
            'description' => $promo['description'] ?? '',
            'banner_urls' => array_slice($lines, 0, 3),
        ];
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
                'extra_json' => ['button_label' => $row['button_label'] ?? ''],
            ]);
        }
    }

    // ─── Header ───────────────────────────────────────────────────────────

    private function readHeader(?CmsSection $s): array
    {
        if (! $s) {
            return ['logo_url' => '', 'menu_items' => [], 'cta' => ['label' => '', 'url' => '', 'bg_color' => '', 'text_color' => ''], 'languages' => []];
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
            'cta' => $c['cta'] ?? ['label' => '', 'url' => '', 'bg_color' => '', 'text_color' => ''],
            'languages' => $c['languages'] ?? [],
            'menu_items' => $menu,
        ];
    }

    private function persistHeader(CmsPage $page, array $header): void
    {
        $section = $this->section($page, 'header');
        $section->content_json = [
            'logo_url' => $header['logo_url'] ?? '',
            'cta' => $header['cta'] ?? [],
            'languages' => $header['languages'] ?? [],
        ];
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
            return ['brand' => ['logo_url' => '', 'description' => ''], 'quick_links' => [], 'buttons' => [], 'payment' => ['title' => '', 'icons_urls' => ''], 'legal_links' => [], 'bottom' => ['copyright' => '', 'ssl_badge_url' => '']];
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

        return [
            'brand' => $c['brand'] ?? ['logo_url' => '', 'description' => ''],
            'quick_links' => $quick,
            'buttons' => $buttons,
            'payment' => [
                'title' => $c['payment']['title'] ?? '',
                'icons_urls' => is_array($icons) ? implode("\n", $icons) : '',
            ],
            'legal_links' => $legal,
            'bottom' => $c['bottom'] ?? ['copyright' => '', 'ssl_badge_url' => ''],
        ];
    }

    private function persistFooter(CmsPage $page, array $footer): void
    {
        $section = $this->section($page, 'footer');
        $lines = array_filter(array_map('trim', explode("\n", $footer['payment']['icons_urls'] ?? '')));
        $section->content_json = [
            'brand' => $footer['brand'] ?? [],
            'payment' => [
                'title' => $footer['payment']['title'] ?? '',
                'icons' => $lines,
            ],
            'bottom' => $footer['bottom'] ?? [],
        ];
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
