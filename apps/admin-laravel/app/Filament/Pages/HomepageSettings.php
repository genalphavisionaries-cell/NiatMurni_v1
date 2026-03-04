<?php

namespace App\Filament\Pages;

use App\Models\HomepageSetting;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Tabs;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Str;

class HomepageSettings extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';
    protected static ?string $navigationGroup = 'Site';
    protected static ?string $navigationLabel = 'Homepage Settings';
    protected static ?string $title = 'Homepage Settings';
    protected static ?int $navigationSort = 1;
    protected static string $view = 'filament.pages.homepage-settings';

    public ?array $data = [];

    public static function getNavigationBadge(): ?string
    {
        return 'CMS';
    }

    public function mount(): void
    {
        $setting = HomepageSetting::singleton();
        $paymentIcons = $setting->payment_method_icons ?? [];
        $paymentIconsList = [];
        if (is_array($paymentIcons) && ! array_is_list($paymentIcons)) {
            foreach ($paymentIcons as $key => $url) {
                $paymentIconsList[] = ['key' => $key, 'url' => $url];
            }
        }
        $whyChoose = $setting->why_choose ?? [];
        $socialProof = $setting->social_proof ?? [];
        $this->form->fill([
            'site_name' => $setting->site_name,
            'logo_url' => $setting->logo_url,
            'logo_alt' => $setting->logo_alt,
            'header_nav' => $setting->header_nav ?? [],
            'footer_columns' => $setting->footer_columns ?? [],
            'footer_bottom' => $setting->footer_bottom,
            'footer_logo_url' => $setting->footer_logo_url,
            'footer_description' => $setting->footer_description,
            'footer_ssl_badge_url' => $setting->footer_ssl_badge_url,
            'payment_method_icons' => $paymentIconsList,
            'hero' => $setting->hero ?? [],
            'main_banners' => $setting->main_banners ?? [],
            'why_choose' => [
                'title' => $whyChoose['title'] ?? '',
                'subtitle' => $whyChoose['subtitle'] ?? '',
                'image' => $whyChoose['image'] ?? null,
                'benefits' => $whyChoose['benefits'] ?? [],
            ],
            'social_proof' => [
                'title' => $socialProof['title'] ?? '',
                'subtitle' => $socialProof['subtitle'] ?? '',
                'google_rating' => $socialProof['google_rating'] ?? 5,
                'review_count' => $socialProof['review_count'] ?? 0,
                'brand_logos' => $socialProof['brand_logos'] ?? [],
                'testimonials' => $socialProof['testimonials'] ?? [],
            ],
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema($this->getFormSchema())
            ->statePath('data');
    }

    protected function getFormSchema(): array
    {
        return [
            Tabs::make('Homepage CMS')
                ->tabs([
                    Tabs\Tab::make('General')
                        ->icon('heroicon-o-home')
                        ->schema([
                            Section::make('Site & Logo')
                                ->description('Branding shown in header and across the site.')
                                ->schema([
                                    TextInput::make('site_name')
                                        ->label('Site name')
                                        ->required()
                                        ->maxLength(255)
                                        ->placeholder('Niat Murni Academy'),
                                    FileUpload::make('logo_url')
                                        ->label('Header logo')
                                        ->image()
                                        ->directory('homepage')
                                        ->visibility('public')
                                        ->maxSize(1024)
                                        ->helperText('Recommended: transparent PNG, max height 36px.'),
                                    TextInput::make('logo_alt')
                                        ->label('Logo alt text')
                                        ->maxLength(255)
                                        ->placeholder('Niat Murni Academy'),
                                ])
                                ->columns(1),
                            Section::make('Header menu')
                                ->description('Navigation links in the header.')
                                ->schema([
                                    Repeater::make('header_nav')
                                        ->label('Menu items')
                                        ->schema([
                                            TextInput::make('label')->label('Label')->required()->maxLength(255),
                                            TextInput::make('href')->label('URL')->required()->maxLength(500)->placeholder('#programs'),
                                            Toggle::make('external')->label('Open in new tab')->default(false),
                                        ])
                                        ->columns(3)
                                        ->defaultItems(0)
                                        ->addActionLabel('Add item')
                                        ->reorderable(),
                                ]),
                        ]),

                    Tabs\Tab::make('Hero')
                        ->icon('heroicon-o-photo')
                        ->schema([
                            Section::make('Hero section')
                                ->description('Main banner at the top of the homepage.')
                                ->schema([
                                    TextInput::make('hero.headline')
                                        ->label('Headline')
                                        ->required()
                                        ->maxLength(255)
                                        ->placeholder('Professional Food Safety Training'),
                                    Textarea::make('hero.subheadline')
                                        ->label('Subheadline')
                                        ->rows(3)
                                        ->maxLength(1000),
                                    TextInput::make('hero.ctaText')->label('CTA button text')->maxLength(255)->placeholder('View Upcoming Classes'),
                                    TextInput::make('hero.ctaHref')->label('CTA button URL')->maxLength(500)->placeholder('#classes'),
                                    FileUpload::make('hero.backgroundImageUrl')
                                        ->label('Background image')
                                        ->image()
                                        ->directory('homepage/hero')
                                        ->visibility('public')
                                        ->maxSize(2048),
                                    TextInput::make('hero.overlayOpacity')
                                        ->label('Overlay opacity (0–1)')
                                        ->numeric()
                                        ->minValue(0)
                                        ->maxValue(1)
                                        ->step(0.1)
                                        ->default(0.4)
                                        ->helperText('Darkens the image behind text.'),
                                ])
                                ->columns(1),
                        ]),

                    Tabs\Tab::make('Footer')
                        ->icon('heroicon-o-rectangle-group')
                        ->schema([
                            Section::make('Footer brand column')
                                ->description('Logo and description in the footer (left column).')
                                ->schema([
                                    FileUpload::make('footer_logo_url')
                                        ->label('Footer logo')
                                        ->image()
                                        ->directory('homepage/footer')
                                        ->visibility('public')
                                        ->maxSize(1024)
                                        ->helperText('If empty, site name is shown as text.'),
                                    Textarea::make('footer_description')
                                        ->label('Footer description')
                                        ->rows(3)
                                        ->maxLength(1000)
                                        ->placeholder('Penyedia latihan kursus pengendalian makanan...'),
                                ])
                                ->columns(1),
                            Section::make('Footer columns & copyright')
                                ->schema([
                                    Repeater::make('footer_columns')
                                        ->label('Link columns')
                                        ->schema([
                                            TextInput::make('heading')->label('Column heading')->required()->maxLength(255),
                                            Repeater::make('links')
                                                ->label('Links')
                                                ->schema([
                                                    TextInput::make('label')->label('Label')->required()->maxLength(255),
                                                    TextInput::make('href')->label('URL')->required()->maxLength(500),
                                                    Toggle::make('external')->label('External')->default(false),
                                                ])
                                                ->columns(3)
                                                ->defaultItems(0)
                                                ->addActionLabel('Add link'),
                                        ])
                                        ->columns(1)
                                        ->defaultItems(0)
                                        ->addActionLabel('Add column')
                                        ->reorderable(),
                                    Textarea::make('footer_bottom')
                                        ->label('Copyright / bottom text')
                                        ->rows(2)
                                        ->maxLength(1000)
                                        ->placeholder('© 2026 Niat Murni Academy. All rights reserved.'),
                                ]),
                            Section::make('Security badge')
                                ->description('SSL / “Secured by” badge in footer. If empty, default badge is shown.')
                                ->schema([
                                    FileUpload::make('footer_ssl_badge_url')
                                        ->label('SSL badge image')
                                        ->image()
                                        ->directory('homepage/footer')
                                        ->visibility('public')
                                        ->maxSize(512),
                                ]),
                        ]),

                    Tabs\Tab::make('Banners')
                        ->icon('heroicon-o-squares-2x2')
                        ->schema([
                            Section::make('Main banners')
                                ->description('Banner blocks below the hero.')
                                ->schema([
                                    Repeater::make('main_banners')
                                        ->label('Banners')
                                        ->schema([
                                            TextInput::make('title')->label('Title')->required()->maxLength(255),
                                            Textarea::make('description')->label('Description')->rows(2)->maxLength(500),
                                            FileUpload::make('imageUrl')
                                                ->label('Image')
                                                ->image()
                                                ->directory('homepage/banners')
                                                ->visibility('public')
                                                ->maxSize(2048),
                                            TextInput::make('ctaText')->label('CTA text')->maxLength(255),
                                            TextInput::make('ctaHref')->label('CTA URL')->maxLength(500),
                                            Select::make('variant')
                                                ->label('Layout')
                                                ->options(['default' => 'Default', 'reverse' => 'Reverse'])
                                                ->default('default'),
                                        ])
                                        ->columns(2)
                                        ->defaultItems(0)
                                        ->addActionLabel('Add banner')
                                        ->reorderable(),
                                ]),
                        ]),

                    Tabs\Tab::make('Why Choose')
                        ->icon('heroicon-o-sparkles')
                        ->schema([
                            Section::make('Why Choose section')
                                ->description('“Kenapa Pilih Kursus Kami” — benefits with icons.')
                                ->schema([
                                    TextInput::make('why_choose.title')
                                        ->label('Section title')
                                        ->maxLength(255)
                                        ->placeholder('Kenapa Pilih Kursus Kami?'),
                                    TextInput::make('why_choose.subtitle')
                                        ->label('Subtitle')
                                        ->maxLength(500),
                                    FileUpload::make('why_choose.image')
                                        ->label('Section image (optional)')
                                        ->image()
                                        ->directory('homepage/why-choose')
                                        ->visibility('public')
                                        ->maxSize(2048),
                                    Repeater::make('why_choose.benefits')
                                        ->label('Benefits')
                                        ->schema([
                                            TextInput::make('icon')
                                                ->label('Icon name')
                                                ->maxLength(50)
                                                ->placeholder('e.g. monitor, clock, award'),
                                            TextInput::make('title')->label('Title')->required()->maxLength(255),
                                            Textarea::make('description')->label('Description')->rows(2)->maxLength(500),
                                            TextInput::make('order')->label('Order')->numeric()->default(0),
                                        ])
                                        ->columns(2)
                                        ->defaultItems(0)
                                        ->addActionLabel('Add benefit')
                                        ->reorderable(),
                                ]),
                        ]),

                    Tabs\Tab::make('Social Proof')
                        ->icon('heroicon-o-star')
                        ->schema([
                            Section::make('Trust header')
                                ->description('Google rating and review count above testimonials.')
                                ->schema([
                                    TextInput::make('social_proof.title')
                                        ->label('Section title')
                                        ->maxLength(255)
                                        ->placeholder('Antara Syarikat Yang Pernah Menghadiri Kursus Kami'),
                                    TextInput::make('social_proof.subtitle')
                                        ->label('Subtitle')
                                        ->maxLength(500),
                                    TextInput::make('social_proof.google_rating')
                                        ->label('Google rating (1–5)')
                                        ->numeric()
                                        ->minValue(0)
                                        ->maxValue(5)
                                        ->step(0.1)
                                        ->default(5),
                                    TextInput::make('social_proof.review_count')
                                        ->label('Review count (e.g. 1300)')
                                        ->numeric()
                                        ->minValue(0)
                                        ->default(1300),
                                ])
                                ->columns(2),
                            Section::make('Client logos')
                                ->description('Logos shown in a single row; upload image or leave empty to show company name.')
                                ->schema([
                                    Repeater::make('social_proof.brand_logos')
                                        ->label('Brand logos')
                                        ->schema([
                                            TextInput::make('company_name')->label('Company name')->required()->maxLength(255),
                                            FileUpload::make('logo')
                                                ->label('Logo image')
                                                ->image()
                                                ->directory('homepage/social-proof')
                                                ->visibility('public')
                                                ->maxSize(512),
                                            TextInput::make('order')->label('Order')->numeric()->default(0),
                                        ])
                                        ->columns(3)
                                        ->defaultItems(0)
                                        ->addActionLabel('Add logo')
                                        ->reorderable(),
                                ]),
                            Section::make('Testimonials')
                                ->description('Customer quotes with name, rating, and optional avatar.')
                                ->schema([
                                    Repeater::make('social_proof.testimonials')
                                        ->label('Testimonials')
                                        ->schema([
                                            TextInput::make('name')->label('Name')->required()->maxLength(255),
                                            TextInput::make('role')->label('Role / subtitle')->maxLength(255)->placeholder('e.g. Pengusaha Restoran'),
                                            TextInput::make('date')->label('Date (e.g. February 11 or Mac 2025)')->maxLength(100)->placeholder('optional'),
                                            TextInput::make('rating')->label('Rating (1–5)')->numeric()->minValue(1)->maxValue(5)->default(5),
                                            Textarea::make('review')->label('Review text')->required()->rows(3)->maxLength(2000),
                                            FileUpload::make('avatar')
                                                ->label('Avatar')
                                                ->image()
                                                ->directory('homepage/testimonials')
                                                ->visibility('public')
                                                ->maxSize(512)
                                                ->avatar(),
                                            TextInput::make('order')->label('Order')->numeric()->default(0),
                                        ])
                                        ->columns(2)
                                        ->defaultItems(0)
                                        ->addActionLabel('Add testimonial')
                                        ->reorderable(),
                                ]),
                        ]),

                    Tabs\Tab::make('Payment Icons')
                        ->icon('heroicon-o-credit-card')
                        ->schema([
                            Section::make('Payment method icons')
                                ->description('Icons shown in footer (VISA, Mastercard, QR, DuitNow, etc.). Upload image per method; key must match: visa, mastercard, amex, jcb, discover, diners, unionpay, qr, duitnow.')
                                ->schema([
                                    Repeater::make('payment_method_icons')
                                        ->label('Icons')
                                        ->schema([
                                            Select::make('key')
                                                ->label('Method')
                                                ->options([
                                                    'visa' => 'VISA',
                                                    'mastercard' => 'Mastercard',
                                                    'amex' => 'AMEX',
                                                    'jcb' => 'JCB',
                                                    'discover' => 'Discover',
                                                    'diners' => 'Diners Club',
                                                    'unionpay' => 'UnionPay',
                                                    'qr' => 'QR',
                                                    'duitnow' => 'DuitNow',
                                                ])
                                                ->required()
                                                ->searchable(),
                                            FileUpload::make('url')
                                                ->label('Icon image')
                                                ->image()
                                                ->directory('homepage/payment')
                                                ->visibility('public')
                                                ->maxSize(256),
                                        ])
                                        ->columns(2)
                                        ->defaultItems(0)
                                        ->addActionLabel('Add payment icon')
                                        ->reorderable(false),
                                ]),
                        ]),
                ])
                ->columnSpanFull()
                ->persistTabInQueryString(),
        ];
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        if (isset($data['hero']) && is_array($data['hero']) && ! isset($data['hero']['headline']) && isset($data['hero'][0])) {
            $data['hero'] = $data['hero'][0];
        }
        $data['logo_url'] = $this->firstFileFromUpload($data['logo_url'] ?? null);
        if (! empty($data['hero']['backgroundImageUrl'])) {
            $data['hero']['backgroundImageUrl'] = $this->firstFileFromUpload($data['hero']['backgroundImageUrl']);
        }
        foreach ($data['main_banners'] ?? [] as $i => $banner) {
            if (! empty($banner['imageUrl'])) {
                $data['main_banners'][$i]['imageUrl'] = $this->firstFileFromUpload($banner['imageUrl']);
            }
            if (empty($data['main_banners'][$i]['id'])) {
                $data['main_banners'][$i]['id'] = (string) Str::uuid();
            }
        }
        $data['footer_logo_url'] = $this->firstFileFromUpload($data['footer_logo_url'] ?? null);
        $data['footer_ssl_badge_url'] = $this->firstFileFromUpload($data['footer_ssl_badge_url'] ?? null);
        if (! empty($data['why_choose']['image'])) {
            $data['why_choose']['image'] = $this->firstFileFromUpload($data['why_choose']['image']);
        }
        foreach ($data['why_choose']['benefits'] ?? [] as $i => $benefit) {
            $data['why_choose']['benefits'][$i]['order'] = (int) ($benefit['order'] ?? $i);
        }
        foreach ($data['social_proof']['brand_logos'] ?? [] as $i => $logo) {
            $data['social_proof']['brand_logos'][$i]['logo'] = $this->firstFileFromUpload($logo['logo'] ?? null);
            $data['social_proof']['brand_logos'][$i]['order'] = (int) ($logo['order'] ?? $i);
        }
        foreach ($data['social_proof']['testimonials'] ?? [] as $i => $t) {
            $data['social_proof']['testimonials'][$i]['avatar'] = $this->firstFileFromUpload($t['avatar'] ?? null);
            $data['social_proof']['testimonials'][$i]['order'] = (int) ($t['order'] ?? $i);
        }
        $icons = [];
        foreach ($data['payment_method_icons'] ?? [] as $item) {
            if (! empty($item['key']) && ! empty($item['url'])) {
                $icons[$item['key']] = $this->firstFileFromUpload($item['url']);
            }
        }
        $data['payment_method_icons'] = $icons;
        return $data;
    }

    private function firstFileFromUpload(mixed $value): ?string
    {
        if (empty($value)) {
            return null;
        }
        if (is_array($value)) {
            return $value[0] ?? null;
        }
        return $value;
    }

    public function save(): void
    {
        $data = $this->form->getState();
        $data = $this->mutateFormDataBeforeSave($data);

        $setting = HomepageSetting::singleton();
        $setting->update([
            'site_name' => $data['site_name'] ?? $setting->site_name,
            'logo_url' => $data['logo_url'] ?? $setting->logo_url,
            'logo_alt' => $data['logo_alt'] ?? $setting->logo_alt,
            'header_nav' => $data['header_nav'] ?? [],
            'footer_columns' => $this->normalizeFooterColumns($data['footer_columns'] ?? []),
            'footer_bottom' => $data['footer_bottom'] ?? $setting->footer_bottom,
            'footer_logo_url' => $data['footer_logo_url'] ?? $setting->footer_logo_url,
            'footer_description' => $data['footer_description'] ?? $setting->footer_description,
            'footer_ssl_badge_url' => $data['footer_ssl_badge_url'] ?? $setting->footer_ssl_badge_url,
            'payment_method_icons' => $data['payment_method_icons'] ?? $setting->payment_method_icons ?? [],
            'hero' => $this->normalizeHero($data['hero'] ?? []),
            'main_banners' => $data['main_banners'] ?? [],
            'why_choose' => $this->normalizeWhyChoose($data['why_choose'] ?? []),
            'social_proof' => $this->normalizeSocialProof($data['social_proof'] ?? []),
        ]);

        Notification::make()
            ->title('Homepage settings saved.')
            ->success()
            ->send();
    }

    private function normalizeFooterColumns(array $columns): array
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

    private function normalizeHero(array $hero): array
    {
        return [
            'headline' => $hero['headline'] ?? '',
            'subheadline' => $hero['subheadline'] ?? '',
            'ctaText' => $hero['ctaText'] ?? '',
            'ctaHref' => $hero['ctaHref'] ?? '',
            'backgroundImageUrl' => $hero['backgroundImageUrl'] ?? null,
            'overlayOpacity' => (float) ($hero['overlayOpacity'] ?? 0.4),
        ];
    }

    private function normalizeWhyChoose(array $wc): array
    {
        $benefits = [];
        foreach ($wc['benefits'] ?? [] as $b) {
            $benefits[] = [
                'icon' => $b['icon'] ?? '',
                'title' => $b['title'] ?? '',
                'description' => $b['description'] ?? '',
                'order' => (int) ($b['order'] ?? 0),
            ];
        }
        usort($benefits, fn ($a, $b) => $a['order'] <=> $b['order']);
        return [
            'title' => $wc['title'] ?? '',
            'subtitle' => $wc['subtitle'] ?? '',
            'image' => $wc['image'] ?? null,
            'benefits' => $benefits,
        ];
    }

    private function normalizeSocialProof(array $sp): array
    {
        $logos = [];
        foreach ($sp['brand_logos'] ?? [] as $l) {
            $logos[] = [
                'company_name' => $l['company_name'] ?? '',
                'logo' => $l['logo'] ?? null,
                'order' => (int) ($l['order'] ?? 0),
            ];
        }
        usort($logos, fn ($a, $b) => $a['order'] <=> $b['order']);
        $testimonials = [];
        foreach ($sp['testimonials'] ?? [] as $t) {
            $testimonials[] = [
                'name' => $t['name'] ?? '',
                'role' => $t['role'] ?? null,
                'date' => ! empty($t['date']) ? $t['date'] : null,
                'rating' => (int) ($t['rating'] ?? 5),
                'review' => $t['review'] ?? '',
                'avatar' => $t['avatar'] ?? null,
                'order' => (int) ($t['order'] ?? 0),
            ];
        }
        usort($testimonials, fn ($a, $b) => $a['order'] <=> $b['order']);
        return [
            'title' => $sp['title'] ?? '',
            'subtitle' => $sp['subtitle'] ?? '',
            'google_rating' => (float) ($sp['google_rating'] ?? 5),
            'review_count' => (int) ($sp['review_count'] ?? 0),
            'brand_logos' => $logos,
            'testimonials' => $testimonials,
        ];
    }

    protected function getFormActions(): array
    {
        return [
            \Filament\Actions\Action::make('save')
                ->label('Save changes')
                ->submit('save')
                ->keyBindings(['mod+s']),
        ];
    }

    protected function getHeaderActions(): array
    {
        return [
            \Filament\Actions\Action::make('save')
                ->label('Save changes')
                ->submit('save')
                ->keyBindings(['mod+s']),
        ];
    }
}
