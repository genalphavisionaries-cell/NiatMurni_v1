<?php

namespace App\Filament\Pages;

use App\Filament\Concerns\EnforcesModuleAccessPage;
use App\Models\CmsItem;
use App\Models\CmsPage;
use App\Models\CmsSection;
use App\Services\CmsService;
use App\Support\AdminModules;
use Filament\Actions\Action;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Tabs;
use Filament\Forms\Components\Tabs\Tab;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\DB;

/**
 * Layout & navigation: header, footer, floating menu — stored in cms_sections + cms_items.
 */
class CmsLayoutEditor extends Page implements HasForms
{
    use EnforcesModuleAccessPage;
    use InteractsWithForms;

    protected static string $requiredModule = AdminModules::CMS;

    protected static ?string $navigationIcon = 'heroicon-o-squares-2x2';

    protected static ?string $navigationGroup = 'CMS';

    protected static ?int $navigationSort = 1;

    protected static ?string $navigationLabel = 'Layout & Navigation';

    protected static ?string $title = 'Layout & Navigation';

    protected static string $view = 'filament.pages.cms-layout-editor';

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill($this->loadFormData());
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Tabs::make('layoutTabs')
                    ->tabs([
                        Tab::make('Header')
                            ->schema([
                                TextInput::make('header.logo_url')
                                    ->label('Logo URL')
                                    ->maxLength(2048)
                                    ->url(),
                                Repeater::make('header.menu_items')
                                    ->label('Menu items')
                                    ->schema([
                                        TextInput::make('label')->required()->maxLength(255),
                                        TextInput::make('url')->maxLength(2048),
                                        Select::make('type')
                                            ->options(['page' => 'Page', 'anchor' => 'Anchor', 'external' => 'External'])
                                            ->required(),
                                        Toggle::make('has_children')->label('Has children'),
                                    ])
                                    ->columns(2)
                                    ->defaultItems(0),
                                TextInput::make('header.cta.label')->label('CTA label')->maxLength(255),
                                TextInput::make('header.cta.url')->label('CTA URL')->maxLength(2048),
                                ColorPicker::make('header.cta.bg_color')->label('CTA background'),
                                ColorPicker::make('header.cta.text_color')->label('CTA text color'),
                                Repeater::make('header.languages')
                                    ->label('Languages')
                                    ->schema([
                                        TextInput::make('code')->maxLength(10),
                                        TextInput::make('label')->maxLength(50),
                                        Toggle::make('active')->default(true),
                                    ])
                                    ->columns(3)
                                    ->defaultItems(0),
                            ]),
                        Tab::make('Footer')
                            ->schema([
                                Tabs::make('footerInner')
                                    ->tabs([
                                        Tab::make('Brand')
                                            ->schema([
                                                TextInput::make('footer.brand.logo_url')->label('Logo URL')->maxLength(2048),
                                                Textarea::make('footer.brand.description')->label('Description')->rows(4),
                                            ]),
                                        Tab::make('Quick links')
                                            ->schema([
                                                Repeater::make('footer.quick_links')
                                                    ->maxItems(8)
                                                    ->schema([
                                                        TextInput::make('label')->required(),
                                                        TextInput::make('url')->required(),
                                                    ])
                                                    ->columns(2),
                                            ]),
                                        Tab::make('Buttons')
                                            ->schema([
                                                Repeater::make('footer.buttons')
                                                    ->maxItems(3)
                                                    ->schema([
                                                        TextInput::make('label')->required(),
                                                        TextInput::make('url')->required(),
                                                    ])
                                                    ->columns(2),
                                            ]),
                                        Tab::make('Payment trust')
                                            ->schema([
                                                TextInput::make('footer.payment.title')->label('Title')->maxLength(255),
                                                Textarea::make('footer.payment.icons_urls')
                                                    ->label('Payment icon URLs (one per line)')
                                                    ->rows(4)
                                                    ->helperText('Paste full image URLs, one per line.'),
                                            ]),
                                        Tab::make('Bottom')
                                            ->schema([
                                                Repeater::make('footer.legal_links')
                                                    ->schema([
                                                        TextInput::make('label')->required(),
                                                        TextInput::make('url')->required(),
                                                    ])
                                                    ->columns(2),
                                                TextInput::make('footer.bottom.copyright')->label('Copyright')->maxLength(500),
                                                TextInput::make('footer.bottom.ssl_badge_url')->label('SSL badge URL')->maxLength(2048),
                                            ]),
                                    ]),
                            ]),
                        Tab::make('Floating Menu')
                            ->schema([
                                Toggle::make('floating.enabled')->label('Enabled')->default(false),
                                Textarea::make('floating.style_json')
                                    ->label('Style (JSON, optional)')
                                    ->rows(3),
                                Repeater::make('floating.items')
                                    ->maxItems(3)
                                    ->schema([
                                        TextInput::make('icon')->maxLength(100),
                                        TextInput::make('label')->maxLength(255),
                                        TextInput::make('url')->maxLength(2048),
                                    ])
                                    ->columns(3)
                                    ->defaultItems(0),
                            ]),
                    ]),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        $data = $this->form->getState();
        DB::transaction(function () use ($data) {
            $this->persistHeader($data['header'] ?? []);
            $this->persistFooter($data['footer'] ?? []);
            $this->persistFloating($data['floating'] ?? []);
        });
        app(CmsService::class)->forgetCache();

        Notification::make()->title('Layout saved')->success()->send();
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('save')->label('Save')->action('save'),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function loadFormData(): array
    {
        return [
            'header' => $this->loadHeader(),
            'footer' => $this->loadFooter(),
            'floating' => $this->loadFloating(),
        ];
    }

    private function homepage(): CmsPage
    {
        return CmsPage::query()->where('slug', 'homepage')->firstOrFail();
    }

    private function section(string $key): CmsSection
    {
        return $this->homepage()->sections()->where('section_key', $key)->firstOrFail();
    }

    /**
     * @return array<string, mixed>
     */
    private function loadHeader(): array
    {
        $s = $this->section('header');
        $c = $s->content_json ?? [];
        $menu = [];
        foreach ($s->items()->where('type', 'menu_item')->orderBy('sort_order')->get() as $item) {
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
            'cta' => $c['cta'] ?? ['label' => '', 'url' => '', 'bg_color' => null, 'text_color' => null],
            'languages' => $c['languages'] ?? [],
            'menu_items' => $menu,
        ];
    }

    /**
     * @param  array<string, mixed>  $header
     */
    private function persistHeader(array $header): void
    {
        $section = $this->section('header');
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

    /**
     * @return array<string, mixed>
     */
    private function loadFooter(): array
    {
        $s = $this->section('footer');
        $c = $s->content_json ?? [];

        $quick = [];
        foreach ($s->items()->where('type', 'quick_link')->orderBy('sort_order')->get() as $item) {
            $quick[] = ['label' => $item->title, 'url' => $item->link_url];
        }
        $buttons = [];
        foreach ($s->items()->where('type', 'footer_button')->orderBy('sort_order')->get() as $item) {
            $buttons[] = ['label' => $item->title, 'url' => $item->link_url];
        }
        $legal = [];
        foreach ($s->items()->where('type', 'legal_link')->orderBy('sort_order')->get() as $item) {
            $legal[] = ['label' => $item->title, 'url' => $item->link_url];
        }

        $icons = $c['payment']['icons'] ?? [];
        $iconsText = is_array($icons) ? implode("\n", $icons) : '';

        return [
            'brand' => $c['brand'] ?? ['logo_url' => '', 'description' => ''],
            'quick_links' => $quick,
            'buttons' => $buttons,
            'payment' => [
                'title' => $c['payment']['title'] ?? '',
                'icons_urls' => $iconsText,
            ],
            'legal_links' => $legal,
            'bottom' => $c['bottom'] ?? ['copyright' => '', 'ssl_badge_url' => ''],
        ];
    }

    /**
     * @param  array<string, mixed>  $footer
     */
    private function persistFooter(array $footer): void
    {
        $section = $this->section('footer');
        $c = [];
        $c['brand'] = $footer['brand'] ?? [];
        $lines = array_filter(array_map('trim', explode("\n", (string) ($footer['payment']['icons_urls'] ?? ''))));
        $c['payment'] = [
            'title' => $footer['payment']['title'] ?? '',
            'icons' => $lines,
        ];
        $c['bottom'] = $footer['bottom'] ?? [];
        $section->content_json = $c;
        $section->save();

        $section->items()->whereIn('type', ['quick_link', 'footer_button', 'legal_link'])->delete();

        foreach ($footer['quick_links'] ?? [] as $i => $row) {
            CmsItem::query()->create([
                'section_id' => $section->id,
                'type' => 'quick_link',
                'title' => $row['label'] ?? '',
                'link_url' => $row['url'] ?? null,
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }
        foreach ($footer['buttons'] ?? [] as $i => $row) {
            CmsItem::query()->create([
                'section_id' => $section->id,
                'type' => 'footer_button',
                'title' => $row['label'] ?? '',
                'link_url' => $row['url'] ?? null,
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }
        foreach ($footer['legal_links'] ?? [] as $i => $row) {
            CmsItem::query()->create([
                'section_id' => $section->id,
                'type' => 'legal_link',
                'title' => $row['label'] ?? '',
                'link_url' => $row['url'] ?? null,
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function loadFloating(): array
    {
        $s = $this->section('floating_menu');
        $c = $s->content_json ?? [];
        $items = [];
        foreach ($s->items()->where('type', 'quick_link')->orderBy('sort_order')->get() as $item) {
            $items[] = [
                'icon' => $item->icon_url ?? '',
                'label' => $item->subtitle ?? '',
                'url' => $item->link_url,
            ];
        }

        return [
            'enabled' => (bool) ($c['enabled'] ?? false),
            'style_json' => isset($c['style']) ? json_encode($c['style'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) : '',
            'items' => $items,
        ];
    }

    /**
     * @param  array<string, mixed>  $floating
     */
    private function persistFloating(array $floating): void
    {
        $section = $this->section('floating_menu');
        $style = null;
        $raw = trim((string) ($floating['style_json'] ?? ''));
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
