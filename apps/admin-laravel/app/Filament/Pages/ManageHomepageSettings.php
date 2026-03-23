<?php

namespace App\Filament\Pages;

use App\Models\HomepageSection;
use App\Support\AdminModules;
use Filament\Actions\Action;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\Fieldset;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Section;
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

class ManageHomepageSettings extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-home';

    protected static ?string $navigationGroup = 'CMS';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Homepage Settings';

    protected static ?string $title = 'Homepage Settings';

    protected static string $view = 'filament.pages.manage-homepage-settings';

    public static function canAccess(): bool
    {
        return auth()->user()?->hasModuleAccess(AdminModules::CMS) ?? false;
    }

    public ?array $data = [];

    /** Canonical section registry: key → display name & default sort order */
    private const SECTIONS = [
        'hero'                => ['name' => 'Hero',               'sort_order' => 1],
        'floating_quick_menu' => ['name' => 'Floating Quick Menu','sort_order' => 2],
        'why_us'              => ['name' => 'Why Us',             'sort_order' => 3],
        'upcoming_classes'    => ['name' => 'Upcoming Classes',   'sort_order' => 4],
        'trust_reviews'       => ['name' => 'Trust & Reviews',    'sort_order' => 5],
        'promotions'          => ['name' => 'Promotions',         'sort_order' => 6],
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Lifecycle
    // ─────────────────────────────────────────────────────────────────────────

    public function mount(): void
    {
        $filled = [];

        foreach (self::SECTIONS as $key => $meta) {
            $section = HomepageSection::firstOrCreate(
                ['section_key' => $key],
                [
                    'name'       => $meta['name'],
                    'sort_order' => $meta['sort_order'],
                    'is_active'  => true,
                ]
            );

            $extra = is_array($section->extra_data) ? $section->extra_data : [];

            $filled[$key] = $this->hydrateSection($key, $section, $extra);
        }

        $this->form->fill($filled);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Hydration helpers (DB → form state)
    // ─────────────────────────────────────────────────────────────────────────

    /** @param  array<string, mixed>  $extra */
    private function hydrateSection(string $key, HomepageSection $s, array $extra): array
    {
        return match ($key) {
            'hero' => [
                'is_active'                => $s->is_active,
                'title'                    => $s->title ?? '',
                'description'              => $s->description ?? '',
                'button_primary_label'     => $s->button_primary_label ?? '',
                'button_primary_url'       => $s->button_primary_url ?? '',
                'button_primary_enabled'   => (bool) ($extra['button_primary_enabled'] ?? true),
                'button_secondary_label'   => $s->button_secondary_label ?? '',
                'button_secondary_url'     => $s->button_secondary_url ?? '',
                'button_secondary_enabled' => (bool) ($extra['button_secondary_enabled'] ?? false),
                'text_color'               => $extra['text_color'] ?? '#ffffff',
                'text_align'               => $extra['text_align'] ?? 'center',
                'overlay_opacity'          => (float) ($extra['overlay_opacity'] ?? 0.5),
                'autoplay'                 => (bool) ($extra['autoplay'] ?? true),
                'autoplay_interval'        => (int) ($extra['autoplay_interval'] ?? 5000),
                'show_arrows'              => (bool) ($extra['show_arrows'] ?? true),
                'show_dots'                => (bool) ($extra['show_dots'] ?? true),
                'slides'                   => $extra['slides'] ?? [],
            ],

            'floating_quick_menu' => [
                'is_active' => $s->is_active,
                'items'     => $extra['items'] ?? [],
            ],

            'why_us' => [
                'is_active'          => $s->is_active,
                'title'              => $s->title ?? '',
                'description'        => $s->description ?? '',
                'description_line_2' => $extra['description_line_2'] ?? '',
                'usp_items'          => $extra['usp_items'] ?? [],
                'banner_slides'      => $extra['banner_slides'] ?? [],
            ],

            'upcoming_classes' => [
                'is_active'                => $s->is_active,
                'title'                    => $s->title ?? '',
                'description'              => $s->description ?? '',
                'mobile_load_more_text'    => $extra['mobile_load_more_text'] ?? 'Load More',
                'empty_state_text'         => $extra['empty_state_text'] ?? 'Tiada kelas dijadualkan buat masa ini.',
                'full_listing_button_text' => $extra['full_listing_button_text'] ?? 'Pilih Kelas Lain',
                'full_listing_button_url'  => $extra['full_listing_button_url'] ?? '/#classes',
                'show_full_listing_button' => (bool) ($extra['show_full_listing_button'] ?? true),
                'desktop_initial_count'    => (int) ($extra['desktop_initial_count'] ?? 21),
                'desktop_load_more_count'  => (int) ($extra['desktop_load_more_count'] ?? 10),
                'mobile_initial_count'     => (int) ($extra['mobile_initial_count'] ?? 10),
                'mobile_load_more_count'   => (int) ($extra['mobile_load_more_count'] ?? 6),
                'show_availability'        => (bool) ($extra['show_availability'] ?? true),
                'show_quantity_selector'   => (bool) ($extra['show_quantity_selector'] ?? true),
                'enable_load_more'         => (bool) ($extra['enable_load_more'] ?? true),
            ],

            'trust_reviews' => [
                'is_active'      => $s->is_active,
                'title'          => $s->title ?? '',
                'description'    => $s->description ?? '',
                'review_summary' => array_merge([
                    'enabled'           => true,
                    'platform_label'    => 'Google Reviews',
                    'rating_value'      => 4.8,
                    'review_count'      => 2500,
                    'review_count_text' => 'ulasan',
                    'button_text'       => 'Lihat Semua Ulasan',
                    'button_url'        => '',
                ], $extra['review_summary'] ?? []),
                'brand_logos'    => $extra['brand_logos'] ?? [],
                'testimonials'   => $extra['testimonials'] ?? [],
            ],

            'promotions' => [
                'is_active'   => $s->is_active,
                'title'       => $s->title ?? '',
                'description' => $s->description ?? '',
                'top_banner'  => array_merge([
                    'enabled'           => false,
                    'desktop_image_url' => '',
                    'mobile_image_url'  => '',
                    'alt_text'          => '',
                    'link_url'          => '',
                ], $extra['top_banner'] ?? []),
                'promo_cards' => $extra['promo_cards'] ?? [],
            ],

            default => [],
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Form definition
    // ─────────────────────────────────────────────────────────────────────────

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Tabs::make('Homepage Sections')
                    ->tabs([
                        $this->heroTab(),
                        $this->floatingQuickMenuTab(),
                        $this->whyUsTab(),
                        $this->upcomingClassesTab(),
                        $this->trustReviewsTab(),
                        $this->promotionsTab(),
                    ])
                    ->persistTabInQueryString()
                    ->columnSpanFull(),
            ])
            ->statePath('data');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tab: Hero
    // ─────────────────────────────────────────────────────────────────────────

    private function heroTab(): Tab
    {
        $imgHelper = 'Paste a full image URL (e.g. https://res.cloudinary.com/…).';

        return Tab::make('Hero')
            ->icon('heroicon-o-photo')
            ->schema([
                Section::make('Section visibility')
                    ->schema([
                        Toggle::make('hero.is_active')
                            ->label('Enable hero section')
                            ->helperText('Toggle off to hide this section from the homepage.'),
                    ]),

                Section::make('Headline & description')
                    ->schema([
                        TextInput::make('hero.title')
                            ->label('Heading')
                            ->maxLength(255)
                            ->helperText('Main headline shown over the hero image.'),
                        Textarea::make('hero.description')
                            ->label('Description / subheading')
                            ->rows(3)
                            ->maxLength(500),
                    ]),

                Section::make('Call-to-action buttons')
                    ->columns(2)
                    ->schema([
                        Fieldset::make('Button 1 (primary)')
                            ->schema([
                                Toggle::make('hero.button_primary_enabled')
                                    ->label('Show button 1'),
                                TextInput::make('hero.button_primary_label')
                                    ->label('Button text')
                                    ->maxLength(100),
                                TextInput::make('hero.button_primary_url')
                                    ->label('Button URL')
                                    ->maxLength(2048)
                                    ->helperText('Relative (e.g. /#classes) or full URL.'),
                            ]),
                        Fieldset::make('Button 2 (secondary)')
                            ->schema([
                                Toggle::make('hero.button_secondary_enabled')
                                    ->label('Show button 2'),
                                TextInput::make('hero.button_secondary_label')
                                    ->label('Button text')
                                    ->maxLength(100),
                                TextInput::make('hero.button_secondary_url')
                                    ->label('Button URL')
                                    ->maxLength(2048),
                            ]),
                    ]),

                Section::make('Text & overlay style')
                    ->columns(2)
                    ->schema([
                        ColorPicker::make('hero.text_color')
                            ->label('Text colour')
                            ->helperText('Colour of the heading and description text over the image.'),
                        Select::make('hero.text_align')
                            ->label('Text alignment')
                            ->options([
                                'left'   => 'Left',
                                'center' => 'Center',
                                'right'  => 'Right',
                            ])
                            ->native(false),
                        TextInput::make('hero.overlay_opacity')
                            ->label('Overlay opacity (0 – 1)')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(1)
                            ->step(0.05)
                            ->helperText('0 = fully transparent, 1 = fully dark.'),
                    ]),

                Section::make('Slideshow behaviour')
                    ->columns(2)
                    ->schema([
                        Toggle::make('hero.autoplay')
                            ->label('Autoplay slides'),
                        TextInput::make('hero.autoplay_interval')
                            ->label('Autoplay interval (ms)')
                            ->numeric()
                            ->minValue(1000)
                            ->maxValue(30000)
                            ->step(500)
                            ->helperText('Default: 5000 ms (5 seconds).'),
                        Toggle::make('hero.show_arrows')
                            ->label('Show prev / next arrows'),
                        Toggle::make('hero.show_dots')
                            ->label('Show slide indicator dots'),
                    ]),

                Section::make('Slides')
                    ->description('Add one or more slides. The first enabled slide loads first.')
                    ->schema([
                        Repeater::make('hero.slides')
                            ->label('Slides')
                            ->schema([
                                TextInput::make('desktop_image_url')
                                    ->label('Desktop image URL')
                                    ->maxLength(2048)
                                    ->helperText($imgHelper),
                                TextInput::make('mobile_image_url')
                                    ->label('Mobile image URL (optional)')
                                    ->maxLength(2048)
                                    ->helperText('Falls back to desktop image if blank.'),
                                TextInput::make('alt_text')
                                    ->label('Alt text')
                                    ->maxLength(255)
                                    ->helperText('Describe the image for accessibility / SEO.'),
                                Toggle::make('enabled')
                                    ->label('Enabled')
                                    ->default(true),
                            ])
                            ->columns(2)
                            ->addActionLabel('Add slide')
                            ->reorderable()
                            ->collapsible()
                            ->cloneable()
                            ->itemLabel(fn (array $state): ?string => $state['alt_text'] ?? null),
                    ]),
            ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tab: Floating Quick Menu
    // ─────────────────────────────────────────────────────────────────────────

    private function floatingQuickMenuTab(): Tab
    {
        return Tab::make('Floating Quick Menu')
            ->icon('heroicon-o-bars-3-bottom-right')
            ->schema([
                Section::make('Section visibility')
                    ->schema([
                        Toggle::make('floating_quick_menu.is_active')
                            ->label('Enable floating quick menu')
                            ->helperText('Shows a horizontal shortcut bar pinned to the bottom of the screen.'),
                    ]),

                Section::make('Menu items')
                    ->description('Up to 4 shortcut buttons. Add icons, labels, and links.')
                    ->schema([
                        Repeater::make('floating_quick_menu.items')
                            ->label('Items')
                            ->schema([
                                TextInput::make('icon')
                                    ->label('Icon (emoji or text)')
                                    ->maxLength(50)
                                    ->helperText('e.g. 📅 or a short text symbol.'),
                                TextInput::make('label')
                                    ->label('Label')
                                    ->maxLength(50)
                                    ->required(),
                                TextInput::make('url')
                                    ->label('Link URL')
                                    ->maxLength(2048)
                                    ->helperText('e.g. /#classes or https://wa.me/60xxxxxxx'),
                                Toggle::make('enabled')
                                    ->label('Enabled')
                                    ->default(true),
                            ])
                            ->columns(2)
                            ->maxItems(4)
                            ->addActionLabel('Add menu item')
                            ->reorderable()
                            ->collapsible()
                            ->itemLabel(fn (array $state): ?string => $state['label'] ?? null),
                    ]),
            ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tab: Why Us
    // ─────────────────────────────────────────────────────────────────────────

    private function whyUsTab(): Tab
    {
        $imgHelper = 'Paste a full image URL (e.g. https://res.cloudinary.com/…).';

        return Tab::make('Why Us')
            ->icon('heroicon-o-star')
            ->schema([
                Section::make('Section visibility')
                    ->schema([
                        Toggle::make('why_us.is_active')
                            ->label('Enable "Why Us" section'),
                    ]),

                Section::make('Section heading')
                    ->schema([
                        TextInput::make('why_us.title')
                            ->label('Section title')
                            ->maxLength(255),
                        Textarea::make('why_us.description')
                            ->label('Description line 1')
                            ->rows(2)
                            ->maxLength(500),
                        Textarea::make('why_us.description_line_2')
                            ->label('Description line 2 (optional)')
                            ->rows(2)
                            ->maxLength(500),
                    ]),

                Section::make('USP cards')
                    ->description('List the key reasons to choose Niat Murni. Each item becomes a highlight card.')
                    ->schema([
                        Repeater::make('why_us.usp_items')
                            ->label('USP items')
                            ->schema([
                                TextInput::make('icon')
                                    ->label('Icon (emoji or text)')
                                    ->maxLength(50),
                                TextInput::make('title')
                                    ->label('Title')
                                    ->maxLength(150)
                                    ->required(),
                                Textarea::make('description')
                                    ->label('Description')
                                    ->rows(2)
                                    ->maxLength(300),
                                Toggle::make('enabled')
                                    ->label('Enabled')
                                    ->default(true),
                            ])
                            ->columns(2)
                            ->addActionLabel('Add USP item')
                            ->reorderable()
                            ->collapsible()
                            ->itemLabel(fn (array $state): ?string => $state['title'] ?? null),
                    ]),

                Section::make('Right-side banner slides')
                    ->description('Image carousel shown on the right side of this section.')
                    ->schema([
                        Repeater::make('why_us.banner_slides')
                            ->label('Banner slides')
                            ->schema([
                                TextInput::make('desktop_image_url')
                                    ->label('Desktop image URL')
                                    ->maxLength(2048)
                                    ->helperText($imgHelper),
                                TextInput::make('mobile_image_url')
                                    ->label('Mobile image URL (optional)')
                                    ->maxLength(2048),
                                TextInput::make('alt_text')
                                    ->label('Alt text')
                                    ->maxLength(255),
                                Toggle::make('enabled')
                                    ->label('Enabled')
                                    ->default(true),
                            ])
                            ->columns(2)
                            ->addActionLabel('Add slide')
                            ->reorderable()
                            ->collapsible()
                            ->itemLabel(fn (array $state): ?string => $state['alt_text'] ?? null),
                    ]),
            ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tab: Upcoming Classes
    // ─────────────────────────────────────────────────────────────────────────

    private function upcomingClassesTab(): Tab
    {
        return Tab::make('Upcoming Classes')
            ->icon('heroicon-o-calendar-days')
            ->schema([
                Section::make('Section visibility')
                    ->schema([
                        Toggle::make('upcoming_classes.is_active')
                            ->label('Enable "Upcoming Classes" section'),
                    ]),

                Section::make('Section heading')
                    ->schema([
                        TextInput::make('upcoming_classes.title')
                            ->label('Section title')
                            ->maxLength(255)
                            ->helperText('Default: "Kelas Terkini"'),
                        Textarea::make('upcoming_classes.description')
                            ->label('Section description')
                            ->rows(2)
                            ->maxLength(500),
                    ]),

                Section::make('Text labels')
                    ->description('Customise button and message text shown on the live class listing.')
                    ->columns(2)
                    ->schema([
                        TextInput::make('upcoming_classes.empty_state_text')
                            ->label('Empty state message')
                            ->maxLength(255)
                            ->helperText('Shown when no upcoming classes are found.'),
                        TextInput::make('upcoming_classes.mobile_load_more_text')
                            ->label('"Load More" button text')
                            ->maxLength(100),
                        TextInput::make('upcoming_classes.full_listing_button_text')
                            ->label('Full listing button text')
                            ->maxLength(100),
                        TextInput::make('upcoming_classes.full_listing_button_url')
                            ->label('Full listing button URL')
                            ->maxLength(2048),
                    ]),

                Section::make('Display options')
                    ->columns(2)
                    ->schema([
                        Toggle::make('upcoming_classes.show_full_listing_button')
                            ->label('Show "View All Classes" button'),
                        Toggle::make('upcoming_classes.show_availability')
                            ->label('Show seat availability'),
                        Toggle::make('upcoming_classes.show_quantity_selector')
                            ->label('Show quantity selector'),
                        Toggle::make('upcoming_classes.enable_load_more')
                            ->label('Enable "Load More" pagination'),
                    ]),

                Section::make('Pagination limits')
                    ->description('Controls how many classes are shown initially and per "Load More" click.')
                    ->columns(2)
                    ->schema([
                        TextInput::make('upcoming_classes.desktop_initial_count')
                            ->label('Desktop: initial items shown')
                            ->numeric()
                            ->minValue(1)
                            ->maxValue(100)
                            ->helperText('Default: 21 (7 rows × 3 columns).'),
                        TextInput::make('upcoming_classes.desktop_load_more_count')
                            ->label('Desktop: items per "Load More"')
                            ->numeric()
                            ->minValue(1)
                            ->maxValue(50)
                            ->helperText('Default: 10.'),
                        TextInput::make('upcoming_classes.mobile_initial_count')
                            ->label('Mobile: initial items shown')
                            ->numeric()
                            ->minValue(1)
                            ->maxValue(50)
                            ->helperText('Default: 10.'),
                        TextInput::make('upcoming_classes.mobile_load_more_count')
                            ->label('Mobile: items per "Load More"')
                            ->numeric()
                            ->minValue(1)
                            ->maxValue(30)
                            ->helperText('Default: 6.'),
                    ]),

                Section::make('ℹ Live class data')
                    ->description('Actual class listings come from real session data managed under Operations → Class Sessions. You cannot add or edit class cards here.')
                    ->schema([]),
            ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tab: Trust & Reviews
    // ─────────────────────────────────────────────────────────────────────────

    private function trustReviewsTab(): Tab
    {
        $imgHelper = 'Paste a full image URL (e.g. https://res.cloudinary.com/…).';

        return Tab::make('Trust & Reviews')
            ->icon('heroicon-o-chat-bubble-left-ellipsis')
            ->schema([
                Section::make('Section visibility')
                    ->schema([
                        Toggle::make('trust_reviews.is_active')
                            ->label('Enable Trust & Reviews section'),
                    ]),

                Section::make('Section heading')
                    ->schema([
                        TextInput::make('trust_reviews.title')
                            ->label('Section title')
                            ->maxLength(255),
                        Textarea::make('trust_reviews.description')
                            ->label('Section description')
                            ->rows(2)
                            ->maxLength(500),
                    ]),

                Section::make('Review summary bar')
                    ->description('The highlighted rating strip shown at the top of this section.')
                    ->schema([
                        Toggle::make('trust_reviews.review_summary.enabled')
                            ->label('Show rating summary bar'),
                        TextInput::make('trust_reviews.review_summary.platform_label')
                            ->label('Platform label')
                            ->maxLength(100)
                            ->helperText('e.g. "Google Reviews"'),
                        TextInput::make('trust_reviews.review_summary.rating_value')
                            ->label('Rating (out of 5)')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(5)
                            ->step(0.1),
                        TextInput::make('trust_reviews.review_summary.review_count')
                            ->label('Number of reviews')
                            ->numeric()
                            ->minValue(0),
                        TextInput::make('trust_reviews.review_summary.review_count_text')
                            ->label('Review count suffix')
                            ->maxLength(50)
                            ->helperText('e.g. "ulasan" or "reviews"'),
                        TextInput::make('trust_reviews.review_summary.button_text')
                            ->label('CTA button text')
                            ->maxLength(100),
                        TextInput::make('trust_reviews.review_summary.button_url')
                            ->label('CTA button URL')
                            ->maxLength(2048)
                            ->helperText('Link to your Google Reviews page.'),
                    ])
                    ->columns(2),

                Section::make('Brand / partner logos marquee')
                    ->description('Logos or company names that scroll horizontally in a trust strip.')
                    ->schema([
                        Repeater::make('trust_reviews.brand_logos')
                            ->label('Brand logos')
                            ->schema([
                                TextInput::make('company_name')
                                    ->label('Company name')
                                    ->maxLength(100)
                                    ->required(),
                                TextInput::make('image_url')
                                    ->label('Logo image URL (optional)')
                                    ->maxLength(2048)
                                    ->helperText($imgHelper . ' If blank, the company name is shown as text.'),
                                TextInput::make('alt_text')
                                    ->label('Alt text')
                                    ->maxLength(255),
                                Toggle::make('enabled')
                                    ->label('Enabled')
                                    ->default(true),
                            ])
                            ->columns(2)
                            ->addActionLabel('Add brand')
                            ->reorderable()
                            ->collapsible()
                            ->itemLabel(fn (array $state): ?string => $state['company_name'] ?? null),
                    ]),

                Section::make('Testimonials')
                    ->description('Individual review cards shown in the grid below the rating bar.')
                    ->schema([
                        Repeater::make('trust_reviews.testimonials')
                            ->label('Testimonials')
                            ->schema([
                                TextInput::make('reviewer_name')
                                    ->label('Reviewer name')
                                    ->maxLength(100)
                                    ->required(),
                                TextInput::make('avatar_url')
                                    ->label('Avatar image URL (optional)')
                                    ->maxLength(2048)
                                    ->helperText('Leave blank to use the reviewer\'s initial letter.'),
                                TextInput::make('initial')
                                    ->label('Initial letter (fallback avatar)')
                                    ->maxLength(3)
                                    ->helperText('Used when no avatar URL is set (e.g. "A").'),
                                TextInput::make('rating')
                                    ->label('Star rating (1–5)')
                                    ->numeric()
                                    ->minValue(1)
                                    ->maxValue(5)
                                    ->default(5),
                                TextInput::make('review_date_text')
                                    ->label('Date text')
                                    ->maxLength(100)
                                    ->helperText('e.g. "Februari 2025" — displayed as-is.'),
                                Textarea::make('review_text')
                                    ->label('Review text')
                                    ->rows(3)
                                    ->maxLength(1000)
                                    ->required(),
                                TextInput::make('source_label')
                                    ->label('Source label (optional)')
                                    ->maxLength(50)
                                    ->helperText('e.g. "Google" — shown as a small badge.'),
                                Toggle::make('enabled')
                                    ->label('Show this review')
                                    ->default(true),
                            ])
                            ->columns(2)
                            ->addActionLabel('Add testimonial')
                            ->reorderable()
                            ->collapsible()
                            ->itemLabel(fn (array $state): ?string => $state['reviewer_name'] ?? null),
                    ]),
            ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tab: Promotions
    // ─────────────────────────────────────────────────────────────────────────

    private function promotionsTab(): Tab
    {
        $imgHelper = 'Paste a full image URL (e.g. https://res.cloudinary.com/…).';

        return Tab::make('Promotions')
            ->icon('heroicon-o-megaphone')
            ->schema([
                Section::make('Section visibility')
                    ->schema([
                        Toggle::make('promotions.is_active')
                            ->label('Enable Promotions section'),
                    ]),

                Section::make('Section heading')
                    ->schema([
                        TextInput::make('promotions.title')
                            ->label('Section title')
                            ->maxLength(255),
                        Textarea::make('promotions.description')
                            ->label('Section description')
                            ->rows(2)
                            ->maxLength(500),
                    ]),

                Section::make('Top banner')
                    ->description('Optional full-width banner shown at the top of the Promotions section.')
                    ->columns(2)
                    ->schema([
                        Toggle::make('promotions.top_banner.enabled')
                            ->label('Show top banner')
                            ->columnSpanFull(),
                        TextInput::make('promotions.top_banner.desktop_image_url')
                            ->label('Desktop banner image URL')
                            ->maxLength(2048)
                            ->helperText($imgHelper),
                        TextInput::make('promotions.top_banner.mobile_image_url')
                            ->label('Mobile banner image URL (optional)')
                            ->maxLength(2048),
                        TextInput::make('promotions.top_banner.alt_text')
                            ->label('Alt text')
                            ->maxLength(255),
                        TextInput::make('promotions.top_banner.link_url')
                            ->label('Click-through URL (optional)')
                            ->maxLength(2048),
                    ]),

                Section::make('Promo cards')
                    ->description('Individual promotion cards shown in a grid. Each card has an image, title, and action button.')
                    ->schema([
                        Repeater::make('promotions.promo_cards')
                            ->label('Promo cards')
                            ->schema([
                                TextInput::make('title')
                                    ->label('Card title')
                                    ->maxLength(150)
                                    ->required(),
                                Textarea::make('description')
                                    ->label('Card description')
                                    ->rows(2)
                                    ->maxLength(300),
                                TextInput::make('image_url')
                                    ->label('Desktop image URL')
                                    ->maxLength(2048)
                                    ->helperText($imgHelper),
                                TextInput::make('mobile_image_url')
                                    ->label('Mobile image URL (optional)')
                                    ->maxLength(2048),
                                TextInput::make('alt_text')
                                    ->label('Image alt text')
                                    ->maxLength(255),
                                TextInput::make('button_text')
                                    ->label('Button text')
                                    ->maxLength(100),
                                TextInput::make('link_url')
                                    ->label('Button / card link URL')
                                    ->maxLength(2048),
                                Toggle::make('open_in_new_tab')
                                    ->label('Open link in new tab'),
                                Toggle::make('enabled')
                                    ->label('Show this card')
                                    ->default(true),
                            ])
                            ->columns(2)
                            ->addActionLabel('Add promo card')
                            ->reorderable()
                            ->collapsible()
                            ->cloneable()
                            ->itemLabel(fn (array $state): ?string => $state['title'] ?? null),
                    ]),
            ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Actions & Save
    // ─────────────────────────────────────────────────────────────────────────

    protected function getFormActions(): array
    {
        return [
            Action::make('save')
                ->label('Save all homepage settings')
                ->icon('heroicon-o-check')
                ->submit('save'),
        ];
    }

    public function save(): void
    {
        $state = $this->form->getState();

        foreach (array_keys(self::SECTIONS) as $key) {
            $this->persistSection($key, $state[$key] ?? []);
        }

        Notification::make()
            ->title('Homepage settings saved successfully.')
            ->success()
            ->send();
    }

    /** Persist one section back to the DB */
    private function persistSection(string $key, array $state): void
    {
        $section = HomepageSection::firstOrCreate(
            ['section_key' => $key],
            [
                'name'       => self::SECTIONS[$key]['name'],
                'sort_order' => self::SECTIONS[$key]['sort_order'],
                'is_active'  => true,
            ]
        );

        $update = match ($key) {
            'hero' => [
                'is_active'              => (bool) ($state['is_active'] ?? true),
                'title'                  => $state['title'] ?? null,
                'description'            => $state['description'] ?? null,
                'button_primary_label'   => $state['button_primary_label'] ?? null,
                'button_primary_url'     => $state['button_primary_url'] ?? null,
                'button_secondary_label' => $state['button_secondary_label'] ?? null,
                'button_secondary_url'   => $state['button_secondary_url'] ?? null,
                'extra_data' => [
                    'button_primary_enabled'   => (bool) ($state['button_primary_enabled'] ?? true),
                    'button_secondary_enabled' => (bool) ($state['button_secondary_enabled'] ?? false),
                    'text_color'               => $state['text_color'] ?? '#ffffff',
                    'text_align'               => $state['text_align'] ?? 'center',
                    'overlay_opacity'          => (float) ($state['overlay_opacity'] ?? 0.5),
                    'autoplay'                 => (bool) ($state['autoplay'] ?? true),
                    'autoplay_interval'        => (int) ($state['autoplay_interval'] ?? 5000),
                    'show_arrows'              => (bool) ($state['show_arrows'] ?? true),
                    'show_dots'                => (bool) ($state['show_dots'] ?? true),
                    'slides'                   => array_values($state['slides'] ?? []),
                ],
            ],

            'floating_quick_menu' => [
                'is_active'  => (bool) ($state['is_active'] ?? true),
                'extra_data' => [
                    'items' => array_values($state['items'] ?? []),
                ],
            ],

            'why_us' => [
                'is_active'   => (bool) ($state['is_active'] ?? true),
                'title'       => $state['title'] ?? null,
                'description' => $state['description'] ?? null,
                'extra_data'  => [
                    'description_line_2' => $state['description_line_2'] ?? '',
                    'usp_items'          => array_values($state['usp_items'] ?? []),
                    'banner_slides'      => array_values($state['banner_slides'] ?? []),
                ],
            ],

            'upcoming_classes' => [
                'is_active'   => (bool) ($state['is_active'] ?? true),
                'title'       => $state['title'] ?? null,
                'description' => $state['description'] ?? null,
                'extra_data'  => [
                    'mobile_load_more_text'    => $state['mobile_load_more_text'] ?? 'Load More',
                    'empty_state_text'         => $state['empty_state_text'] ?? '',
                    'full_listing_button_text' => $state['full_listing_button_text'] ?? '',
                    'full_listing_button_url'  => $state['full_listing_button_url'] ?? '',
                    'show_full_listing_button' => (bool) ($state['show_full_listing_button'] ?? true),
                    'desktop_initial_count'    => (int) ($state['desktop_initial_count'] ?? 21),
                    'desktop_load_more_count'  => (int) ($state['desktop_load_more_count'] ?? 10),
                    'mobile_initial_count'     => (int) ($state['mobile_initial_count'] ?? 10),
                    'mobile_load_more_count'   => (int) ($state['mobile_load_more_count'] ?? 6),
                    'show_availability'        => (bool) ($state['show_availability'] ?? true),
                    'show_quantity_selector'   => (bool) ($state['show_quantity_selector'] ?? true),
                    'enable_load_more'         => (bool) ($state['enable_load_more'] ?? true),
                ],
            ],

            'trust_reviews' => [
                'is_active'   => (bool) ($state['is_active'] ?? true),
                'title'       => $state['title'] ?? null,
                'description' => $state['description'] ?? null,
                'extra_data'  => [
                    'review_summary' => $state['review_summary'] ?? [],
                    'brand_logos'    => array_values($state['brand_logos'] ?? []),
                    'testimonials'   => array_values($state['testimonials'] ?? []),
                ],
            ],

            'promotions' => [
                'is_active'   => (bool) ($state['is_active'] ?? true),
                'title'       => $state['title'] ?? null,
                'description' => $state['description'] ?? null,
                'extra_data'  => [
                    'top_banner'  => $state['top_banner'] ?? [],
                    'promo_cards' => array_values($state['promo_cards'] ?? []),
                ],
            ],

            default => [],
        };

        if ($update !== []) {
            $section->update($update);
        }
    }
}
