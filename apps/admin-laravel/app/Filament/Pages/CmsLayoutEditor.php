<?php

namespace App\Filament\Pages;

use App\Models\CmsItem;
use App\Models\CmsPage;
use App\Models\CmsSection;
use App\Services\CmsService;
use Filament\Actions\Action;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Tabs;
use Filament\Forms\Components\Tabs\Tab;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\Fieldset;
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
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-squares-2x2';

    protected static ?string $navigationGroup = 'CMS';

    protected static ?int $navigationSort = 1;

    protected static ?string $navigationLabel = 'Layout & Navigation';

    protected static ?string $title = 'Layout & Navigation';

    protected static string $view = 'filament.pages.cms-layout-editor';

    public static function canAccess(): bool
    {
        logger()->info('CmsLayoutEditor::canAccess called', [
            'auth_check' => auth()->check(),
            'user_id' => auth()->id(),
            'is_active' => auth()->user()?->is_active,
        ]);

        return true;
    }

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
                    ->columnSpanFull()
                    ->tabs([
                        Tab::make('Header')
                            ->icon('heroicon-o-bars-3')
                            ->schema([
                                Section::make('🎨 Header Styling & Colors')
                                    ->description('Professional color customization for header and navigation menu')
                                    ->collapsible()
                                    ->schema([
                                        Fieldset::make('Header Background & Layout')
                                            ->schema([
                                                Grid::make(2)->schema([
                                                    ColorPicker::make('header.colors.background')
                                                        ->label('Header Background')
                                                        ->helperText('Main header background color')
                                                        ->default('#FFFFFF')
                                                        ->rgb()
                                                        ->alpha(),
                                                        
                                                    ColorPicker::make('header.colors.border')
                                                        ->label('Header Border')
                                                        ->helperText('Bottom border/separator color')
                                                        ->default('#E5E7EB')
                                                        ->rgb()
                                                        ->alpha(),
                                                ]),
                                            ]),

                                        Fieldset::make('Navigation Menu - Default State')
                                            ->schema([
                                                Grid::make(2)->schema([
                                                    ColorPicker::make('header.colors.menu_background')
                                                        ->label('Menu Background')
                                                        ->helperText('Navigation menu background color')
                                                        ->default('transparent')
                                                        ->rgb()
                                                        ->alpha(),
                                                        
                                                    ColorPicker::make('header.colors.menu_text')
                                                        ->label('Menu Text Color')
                                                        ->helperText('Navigation link text color')
                                                        ->default('#0F172A')
                                                        ->rgb(),
                                                ]),
                                                Grid::make(2)->schema([
                                                    ColorPicker::make('header.colors.menu_hover_background')
                                                        ->label('Menu Hover Background')
                                                        ->helperText('Background color when hovering menu items')
                                                        ->default('#F8FAFC')
                                                        ->rgb()
                                                        ->alpha(),
                                                        
                                                    ColorPicker::make('header.colors.menu_hover_text')
                                                        ->label('Menu Hover Text')
                                                        ->helperText('Text color when hovering menu items')
                                                        ->default('#2563EB')
                                                        ->rgb(),
                                                ]),
                                            ]),

                                        Fieldset::make('Navigation Menu - Sticky/Scroll State')
                                            ->schema([
                                                Grid::make(2)->schema([
                                                    ColorPicker::make('header.colors.sticky_background')
                                                        ->label('Sticky Header Background')
                                                        ->helperText('Header background when scrolling/sticky')
                                                        ->default('#FFFFFF')
                                                        ->rgb()
                                                        ->alpha(),
                                                        
                                                    ColorPicker::make('header.colors.sticky_text')
                                                        ->label('Sticky Menu Text')
                                                        ->helperText('Menu text color when header is sticky')
                                                        ->default('#0F172A')
                                                        ->rgb(),
                                                ]),
                                                Grid::make(2)->schema([
                                                    ColorPicker::make('header.colors.sticky_hover_background')
                                                        ->label('Sticky Menu Hover Background')
                                                        ->helperText('Menu hover background in sticky state')
                                                        ->default('#F8FAFC')
                                                        ->rgb()
                                                        ->alpha(),
                                                        
                                                    ColorPicker::make('header.colors.sticky_hover_text')
                                                        ->label('Sticky Menu Hover Text')
                                                        ->helperText('Menu hover text in sticky state')
                                                        ->default('#2563EB')
                                                        ->rgb(),
                                                ]),
                                            ]),
                                    ]),

                                Section::make('📷 Header Logo')
                                    ->schema([
                                        TextInput::make('header.logo_url')
                                            ->label('Logo Image URL')
                                            ->placeholder('https://example.com/logo.png')
                                            ->helperText('High-quality logo image (recommended: PNG with transparent background)')
                                            ->maxLength(2048)
                                            ->url()
                                            ->columnSpanFull(),
                                    ]),

                                Section::make('🧭 Navigation Menu Items')
                                    ->schema([
                                        Repeater::make('header.menu_items')
                                            ->label('Menu Items (max 20)')
                                            ->maxItems(20)
                                            ->schema([
                                                Grid::make(3)->schema([
                                                    TextInput::make('label')
                                                        ->label('Menu Label')
                                                        ->placeholder('e.g., "About Us"')
                                                        ->required()
                                                        ->maxLength(100),
                                                        
                                                    TextInput::make('url')
                                                        ->label('Link URL')
                                                        ->placeholder('e.g., "/about" or "https://..."')
                                                        ->maxLength(2048),
                                                        
                                                    Select::make('type')
                                                        ->label('Link Type')
                                                        ->options([
                                                            'page' => 'Internal Page',
                                                            'anchor' => 'Page Section (#anchor)',
                                                            'external' => 'External Website'
                                                        ])
                                                        ->default('page')
                                                        ->required(),
                                                ]),
                                                Toggle::make('has_children')
                                                    ->label('Has Dropdown Menu')
                                                    ->helperText('Enable if this item has child menu items')
                                                    ->columnSpanFull(),
                                            ])
                                            ->defaultItems(0)
                                            ->addActionLabel('+ Add Menu Item')
                                            ->reorderable()
                                            ->collapsible()
                                            ->itemLabel(fn (array $state): ?string => $state['label'] ?? 'New Menu Item'),
                                    ]),

                                Section::make('🎯 Header Call-to-Action Button')
                                    ->schema([
                                        Grid::make(2)->schema([
                                            TextInput::make('header.cta.label')
                                                ->label('Button Text')
                                                ->placeholder('e.g., "Register Now"')
                                                ->helperText('Text displayed on the CTA button')
                                                ->maxLength(100),
                                                
                                            TextInput::make('header.cta.url')
                                                ->label('Button Link')
                                                ->placeholder('e.g., "/#classes"')
                                                ->helperText('Where the button links to')
                                                ->maxLength(2048),
                                        ]),
                                        Grid::make(2)->schema([
                                            ColorPicker::make('header.cta.bg_color')
                                                ->label('Button Background')
                                                ->helperText('CTA button background color')
                                                ->default('#2563EB')
                                                ->rgb(),
                                                
                                            ColorPicker::make('header.cta.text_color')
                                                ->label('Button Text Color')
                                                ->helperText('CTA button text color')
                                                ->default('#FFFFFF')
                                                ->rgb(),
                                        ]),
                                    ]),

                                Section::make('🌐 Language Options')
                                    ->schema([
                                        Repeater::make('header.languages')
                                            ->label('Available Languages')
                                            ->schema([
                                                TextInput::make('code')
                                                    ->label('Language Code')
                                                    ->placeholder('e.g., "en", "ms"')
                                                    ->maxLength(10),
                                                TextInput::make('label')
                                                    ->label('Display Name')
                                                    ->placeholder('e.g., "English", "Bahasa Malaysia"')
                                                    ->maxLength(50),
                                                Toggle::make('active')
                                                    ->label('Active')
                                                    ->default(true),
                                            ])
                                            ->columns(3)
                                            ->defaultItems(0)
                                            ->addActionLabel('+ Add Language')
                                            ->collapsible(),
                                    ]),
                            ]),
                        Tab::make('Footer')
                            ->icon('heroicon-o-document-text')
                            ->schema([
                                Section::make('🎨 Footer Styling & Colors')
                                    ->description('Professional color customization for footer sections')
                                    ->collapsible()
                                    ->schema([
                                        Fieldset::make('Footer Background & Layout')
                                            ->schema([
                                                Grid::make(2)->schema([
                                                    ColorPicker::make('footer.colors.background')
                                                        ->label('Footer Background')
                                                        ->helperText('Main footer background color')
                                                        ->default('#0F172A')
                                                        ->rgb()
                                                        ->alpha(),
                                                        
                                                    ColorPicker::make('footer.colors.text')
                                                        ->label('Footer Text Color')
                                                        ->helperText('Main text color for footer content')
                                                        ->default('#E5E7EB')
                                                        ->rgb(),
                                                ]),
                                            ]),

                                        Fieldset::make('Footer Links & Navigation')
                                            ->schema([
                                                Grid::make(3)->schema([
                                                    ColorPicker::make('footer.colors.link_text')
                                                        ->label('Link Text Color')
                                                        ->helperText('Color for footer navigation links')
                                                        ->default('#CBD5E1')
                                                        ->rgb(),
                                                        
                                                    ColorPicker::make('footer.colors.link_hover')
                                                        ->label('Link Hover Color')
                                                        ->helperText('Color when hovering footer links')
                                                        ->default('#FFFFFF')
                                                        ->rgb(),
                                                        
                                                    ColorPicker::make('footer.colors.heading')
                                                        ->label('Section Heading Color')
                                                        ->helperText('Color for footer section headings')
                                                        ->default('#FFFFFF')
                                                        ->rgb(),
                                                ]),
                                            ]),

                                        Fieldset::make('Footer Buttons & CTA')
                                            ->schema([
                                                Grid::make(2)->schema([
                                                    ColorPicker::make('footer.colors.button_background')
                                                        ->label('Button Background')
                                                        ->helperText('Footer login button background')
                                                        ->default('transparent')
                                                        ->rgb()
                                                        ->alpha(),
                                                        
                                                    ColorPicker::make('footer.colors.button_text')
                                                        ->label('Button Text Color')
                                                        ->helperText('Footer button text color')
                                                        ->default('#FFFFFF')
                                                        ->rgb(),
                                                ]),
                                                Grid::make(2)->schema([
                                                    ColorPicker::make('footer.colors.button_border')
                                                        ->label('Button Border Color')
                                                        ->helperText('Footer button border color')
                                                        ->default('#334155')
                                                        ->rgb()
                                                        ->alpha(),
                                                        
                                                    ColorPicker::make('footer.colors.button_hover')
                                                        ->label('Button Hover Background')
                                                        ->helperText('Footer button background on hover')
                                                        ->default('rgba(255,255,255,0.1)')
                                                        ->rgb()
                                                        ->alpha(),
                                                ]),
                                            ]),
                                    ]),

                                Tabs::make('footerContent')
                                    ->columnSpanFull()
                                    ->tabs([
                                        Tab::make('Brand Section')
                                            ->icon('heroicon-o-building-office')
                                            ->schema([
                                                TextInput::make('footer.brand.logo_url')
                                                    ->label('Footer Logo URL')
                                                    ->placeholder('https://example.com/footer-logo.png')
                                                    ->helperText('Logo for footer (can be different from header)')
                                                    ->maxLength(2048)
                                                    ->url()
                                                    ->columnSpanFull(),
                                                    
                                                Textarea::make('footer.brand.description')
                                                    ->label('Brand Description')
                                                    ->placeholder('Brief description of your company...')
                                                    ->helperText('Company description displayed in footer')
                                                    ->rows(4)
                                                    ->columnSpanFull(),
                                            ]),
                                        Tab::make('Navigation Links')
                                            ->icon('heroicon-o-link')
                                            ->schema([
                                                Repeater::make('footer.quick_links')
                                                    ->label('Quick Links (max 20)')
                                                    ->maxItems(20)
                                                    ->schema([
                                                        TextInput::make('label')
                                                            ->label('Link Text')
                                                            ->placeholder('e.g., "About Us"')
                                                            ->required()
                                                            ->maxLength(100),
                                                        TextInput::make('url')
                                                            ->label('Link URL')
                                                            ->placeholder('e.g., "/about"')
                                                            ->required()
                                                            ->maxLength(2048),
                                                    ])
                                                    ->columns(2)
                                                    ->addActionLabel('+ Add Quick Link')
                                                    ->reorderable()
                                                    ->collapsible()
                                                    ->itemLabel(fn (array $state): ?string => $state['label'] ?? 'New Link'),
                                            ]),
                                        Tab::make('Action Buttons')
                                            ->icon('heroicon-o-cursor-arrow-rays')
                                            ->schema([
                                                Repeater::make('footer.buttons')
                                                    ->label('Footer Buttons (max 10)')
                                                    ->maxItems(10)
                                                    ->schema([
                                                        TextInput::make('label')
                                                            ->label('Button Text')
                                                            ->placeholder('e.g., "Login"')
                                                            ->required()
                                                            ->maxLength(100),
                                                        TextInput::make('url')
                                                            ->label('Button URL')
                                                            ->placeholder('e.g., "/login"')
                                                            ->required()
                                                            ->maxLength(2048),
                                                    ])
                                                    ->columns(2)
                                                    ->addActionLabel('+ Add Button')
                                                    ->reorderable()
                                                    ->collapsible()
                                                    ->itemLabel(fn (array $state): ?string => $state['label'] ?? 'New Button'),
                                            ]),
                                        Tab::make('Payment & Trust')
                                            ->icon('heroicon-o-shield-check')
                                            ->schema([
                                                TextInput::make('footer.payment.title')
                                                    ->label('Payment Section Title')
                                                    ->placeholder('e.g., "Secure Online Payment"')
                                                    ->helperText('Heading for payment methods section')
                                                    ->maxLength(255)
                                                    ->columnSpanFull(),
                                                    
                                                Textarea::make('footer.payment.icons_urls')
                                                    ->label('Payment Method Icon URLs')
                                                    ->placeholder("https://example.com/visa.svg\nhttps://example.com/mastercard.svg")
                                                    ->rows(6)
                                                    ->helperText('Payment method icons (one URL per line)')
                                                    ->columnSpanFull(),
                                            ]),
                                        Tab::make('Legal & Copyright')
                                            ->icon('heroicon-o-scale')
                                            ->schema([
                                                Repeater::make('footer.legal_links')
                                                    ->label('Legal Links')
                                                    ->maxItems(10)
                                                    ->schema([
                                                        TextInput::make('label')
                                                            ->label('Link Text')
                                                            ->placeholder('e.g., "Privacy Policy"')
                                                            ->required()
                                                            ->maxLength(100),
                                                        TextInput::make('url')
                                                            ->label('Link URL')
                                                            ->placeholder('e.g., "/privacy"')
                                                            ->required()
                                                            ->maxLength(2048),
                                                    ])
                                                    ->columns(2)
                                                    ->addActionLabel('+ Add Legal Link')
                                                    ->reorderable()
                                                    ->collapsible()
                                                    ->itemLabel(fn (array $state): ?string => $state['label'] ?? 'New Legal Link'),
                                                    
                                                TextInput::make('footer.bottom.copyright')
                                                    ->label('Copyright Text')
                                                    ->placeholder('© 2026 Your Company. All rights reserved.')
                                                    ->helperText('Copyright notice displayed in footer')
                                                    ->maxLength(500)
                                                    ->columnSpanFull(),
                                                    
                                                TextInput::make('footer.bottom.ssl_badge_url')
                                                    ->label('SSL Badge URL')
                                                    ->placeholder('https://example.com/ssl-badge.png')
                                                    ->helperText('Security badge/SSL certificate image')
                                                    ->maxLength(2048)
                                                    ->url()
                                                    ->columnSpanFull(),
                                            ]),
                                    ]),
                            ]),
                        Tab::make('Floating Menu')
                            ->icon('heroicon-o-chat-bubble-oval-left')
                            ->schema([
                                Section::make('Settings')
                                    ->columns(2)
                                    ->schema([
                                        Toggle::make('floating.enabled')->label('Enabled')->default(false),
                                        Textarea::make('floating.style_json')
                                            ->label('Custom style (JSON, optional)')
                                            ->rows(3)
                                            ->columnSpanFull(),
                                    ]),
                                Section::make('Menu Items')
                                    ->schema([
                                        Repeater::make('floating.items')
                                            ->label('')
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
        return CmsPage::query()->firstOrCreate(
            ['slug' => 'homepage'],
            ['title' => 'Homepage', 'is_active' => true],
        );
    }

    private function section(string $key): CmsSection
    {
        return $this->homepage()->sections()->firstOrCreate(
            ['section_key' => $key],
            ['title' => ucfirst(str_replace('_', ' ', $key)), 'content_json' => [], 'is_active' => true, 'sort_order' => 0],
        );
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
            'colors' => $c['colors'] ?? [
                'background' => '#FFFFFF',
                'border' => '#E5E7EB',
                'menu_background' => 'transparent',
                'menu_text' => '#0F172A',
                'menu_hover_background' => '#F8FAFC',
                'menu_hover_text' => '#2563EB',
                'sticky_background' => '#FFFFFF',
                'sticky_text' => '#0F172A',
                'sticky_hover_background' => '#F8FAFC',
                'sticky_hover_text' => '#2563EB',
            ],
            'cta' => $c['cta'] ?? ['label' => '', 'url' => '', 'bg_color' => '#2563EB', 'text_color' => '#FFFFFF'],
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
        
        // Merge colors with existing data to prevent loss
        $existingContent = $section->content_json ?? [];
        $existingColors = $existingContent['colors'] ?? [];
        
        $section->content_json = [
            'logo_url' => $header['logo_url'] ?? $existingContent['logo_url'] ?? '',
            'colors' => array_merge($existingColors, $header['colors'] ?? []),
            'cta' => $header['cta'] ?? $existingContent['cta'] ?? [],
            'languages' => $header['languages'] ?? $existingContent['languages'] ?? [],
        ];
        $section->save();

        // Only update menu items if provided (prevent data loss)
        if (array_key_exists('menu_items', $header)) {
            $section->items()->where('type', 'menu_item')->delete();
            foreach ($header['menu_items'] ?? [] as $i => $row) {
                if (!empty(trim($row['label'] ?? ''))) { // Only create items with valid labels
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
            'colors' => $c['colors'] ?? [
                'background' => '#0F172A',
                'text' => '#E5E7EB',
                'link_text' => '#CBD5E1',
                'link_hover' => '#FFFFFF',
                'heading' => '#FFFFFF',
                'button_background' => 'transparent',
                'button_text' => '#FFFFFF',
                'button_border' => '#334155',
                'button_hover' => 'rgba(255,255,255,0.1)',
            ],
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
        
        // Merge colors and content with existing data to prevent loss
        $existingContent = $section->content_json ?? [];
        $existingColors = $existingContent['colors'] ?? [];
        
        $lines = array_filter(array_map('trim', explode("\n", (string) ($footer['payment']['icons_urls'] ?? ''))));
        
        $newContent = [
            'colors' => array_merge($existingColors, $footer['colors'] ?? []),
            'brand' => $footer['brand'] ?? $existingContent['brand'] ?? [],
            'payment' => [
                'title' => $footer['payment']['title'] ?? $existingContent['payment']['title'] ?? '',
                'icons' => $lines,
            ],
            'bottom' => $footer['bottom'] ?? $existingContent['bottom'] ?? [],
        ];
        
        $section->content_json = $newContent;
        $section->save();

        // Only update link items if provided (prevent data loss)
        if (array_key_exists('quick_links', $footer) || 
            array_key_exists('buttons', $footer) || 
            array_key_exists('legal_links', $footer)) {
            
            $section->items()->whereIn('type', ['quick_link', 'footer_button', 'legal_link'])->delete();

            foreach ($footer['quick_links'] ?? [] as $i => $row) {
                if (!empty(trim($row['label'] ?? ''))) {
                    CmsItem::query()->create([
                        'section_id' => $section->id,
                        'type' => 'quick_link',
                        'title' => $row['label'] ?? '',
                        'link_url' => $row['url'] ?? null,
                        'sort_order' => $i,
                        'is_active' => true,
                    ]);
                }
            }
            
            foreach ($footer['buttons'] ?? [] as $i => $row) {
                if (!empty(trim($row['label'] ?? ''))) {
                    CmsItem::query()->create([
                        'section_id' => $section->id,
                        'type' => 'footer_button',
                        'title' => $row['label'] ?? '',
                        'link_url' => $row['url'] ?? null,
                        'sort_order' => $i,
                        'is_active' => true,
                    ]);
                }
            }
            
            foreach ($footer['legal_links'] ?? [] as $i => $row) {
                if (!empty(trim($row['label'] ?? ''))) {
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
