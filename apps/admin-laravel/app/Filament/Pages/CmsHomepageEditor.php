<?php

namespace App\Filament\Pages;

use App\Models\CmsItem;
use App\Models\CmsPage;
use App\Models\CmsSection;
use App\Services\CmsService;
use Filament\Actions\Action;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Tabs;
use Filament\Forms\Components\Tabs\Tab;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\DB;

/**
 * Homepage sections: hero, why_choose_us, classes, testimonials, cta — cms_sections + cms_items.
 */
class CmsHomepageEditor extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-home';

    protected static ?string $navigationGroup = 'CMS';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Homepage';

    protected static ?string $title = 'Homepage';

    protected static string $view = 'filament.pages.cms-homepage-editor';

    public static function canAccess(): bool
    {
        logger()->info('CmsHomepageEditor::canAccess called', [
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
                Tabs::make('homeTabs')
                    ->columnSpanFull()
                    ->tabs([
                        Tab::make('Hero')
                            ->icon('heroicon-o-sparkles')
                            ->schema([
                                Section::make('Headline')
                                    ->columns(2)
                                    ->schema([
                                        TextInput::make('hero.headline')
                                            ->label('Headline')
                                            ->maxLength(500),
                                        Textarea::make('hero.subheadline')
                                            ->label('Sub-headline')
                                            ->rows(3)
                                            ->columnSpanFull(),
                                    ]),
                                Section::make('CTA Buttons')
                                    ->schema([
                                        Repeater::make('hero.buttons')
                                            ->label('')
                                            ->schema([
                                                TextInput::make('label')->required(),
                                                TextInput::make('url')->required(),
                                                ColorPicker::make('color'),
                                            ])
                                            ->columns(3)
                                            ->defaultItems(0),
                                    ]),
                                Section::make('Background Images')
                                    ->schema([
                                        Textarea::make('hero.background_urls')
                                            ->label('Image URLs (max 5, one per line)')
                                            ->rows(5)
                                            ->helperText('Up to 5 URLs; first line is primary.'),
                                    ]),
                            ]),
                        Tab::make('Why choose us')
                            ->icon('heroicon-o-star')
                            ->schema([
                                Section::make('Section Content')
                                    ->columns(2)
                                    ->schema([
                                        TextInput::make('why_choose_us.title')
                                            ->label('Title')
                                            ->maxLength(255),
                                        Textarea::make('why_choose_us.description')
                                            ->label('Description')
                                            ->rows(3)
                                            ->columnSpanFull(),
                                    ]),
                                Section::make('USP Points')
                                    ->schema([
                                        Repeater::make('why_choose_us.points')
                                            ->label('Points (max 4)')
                                            ->maxItems(4)
                                            ->schema([
                                                TextInput::make('icon')->maxLength(255),
                                                TextInput::make('title')->maxLength(255),
                                                Textarea::make('description')->rows(2)->columnSpanFull(),
                                            ])
                                            ->columns(2)
                                            ->defaultItems(0),
                                    ]),
                                Section::make('Side Images')
                                    ->schema([
                                        Textarea::make('why_choose_us.side_images_urls')
                                            ->label('Right-side image URLs (one per line)')
                                            ->rows(4),
                                    ]),
                            ]),
                        Tab::make('Classes')
                            ->icon('heroicon-o-academic-cap')
                            ->schema([
                                Section::make('Section Content')
                                    ->columns(2)
                                    ->schema([
                                        TextInput::make('classes.title')
                                            ->label('Title')
                                            ->maxLength(255),
                                        TextInput::make('classes.max_items')
                                            ->label('Max items shown')
                                            ->numeric()
                                            ->default(20)
                                            ->minValue(1)
                                            ->maxValue(100),
                                        Textarea::make('classes.description')
                                            ->label('Description')
                                            ->rows(3)
                                            ->columnSpanFull(),
                                    ]),
                                Section::make('Button')
                                    ->columns(2)
                                    ->schema([
                                        TextInput::make('classes.button_text')
                                            ->label('Button text')
                                            ->maxLength(100),
                                        TextInput::make('classes.button_url')
                                            ->label('Button URL')
                                            ->maxLength(2048),
                                    ]),
                                Placeholder::make('classes_note')
                                    ->label('')
                                    ->content('Class listings are loaded dynamically from the API — no manual class rows here.'),
                            ]),
                        Tab::make('Testimonials')
                            ->icon('heroicon-o-shield-check')
                            ->schema([
                                Section::make('Partner Logos')
                                    ->schema([
                                        Repeater::make('trust.logos')
                                            ->label('Logos (max 10)')
                                            ->maxItems(10)
                                            ->schema([
                                                TextInput::make('image_url')->label('Image URL')->maxLength(2048),
                                                TextInput::make('title')->label('Alt text')->maxLength(255),
                                            ])
                                            ->columns(2)
                                            ->defaultItems(0),
                                    ]),
                                Section::make('Google Rating')
                                    ->columns(3)
                                    ->schema([
                                        TextInput::make('testimonials.google_rating_text')->label('Rating text'),
                                        TextInput::make('testimonials.google_button_label')->label('Button label'),
                                        TextInput::make('testimonials.google_button_url')->label('Button URL')->maxLength(2048),
                                    ]),
                                Placeholder::make('testimonials_note')
                                    ->label('')
                                    ->content('Customer testimonials are managed under CMS → Testimonials.'),
                            ]),
                        Tab::make('CTA')
                            ->icon('heroicon-o-megaphone')
                            ->schema([
                                Section::make('Section Content')
                                    ->columns(2)
                                    ->schema([
                                        TextInput::make('cta.title')
                                            ->label('Title')
                                            ->maxLength(255),
                                        Textarea::make('cta.description')
                                            ->label('Description')
                                            ->rows(3)
                                            ->columnSpanFull(),
                                        Textarea::make('cta.banner_urls')
                                            ->label('Banner image URLs (max 3, one per line)')
                                            ->rows(3)
                                            ->columnSpanFull(),
                                    ]),
                                Section::make('Promo Cards')
                                    ->schema([
                                        Repeater::make('cta.cards')
                                            ->label('Cards (max 3)')
                                            ->maxItems(3)
                                            ->schema([
                                                TextInput::make('image_url')->label('Image URL')->maxLength(2048),
                                                TextInput::make('title')->maxLength(255),
                                                Textarea::make('description')->rows(2)->columnSpanFull(),
                                                TextInput::make('button_label')->maxLength(100),
                                                TextInput::make('url')->label('Link URL')->maxLength(2048),
                                            ])
                                            ->columns(2)
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
            $this->persistHero($data['hero'] ?? []);
            $this->persistUsp($data['why_choose_us'] ?? $data['usp'] ?? []);
            $this->persistClasses($data['classes'] ?? []);
            $this->persistTrust($data['testimonials'] ?? $data['trust'] ?? []);
            $this->persistPromo($data['cta'] ?? $data['promo'] ?? []);
        });
        app(CmsService::class)->forgetCache();

        Notification::make()->title('Homepage saved')->success()->send();
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
            'hero' => $this->loadHero(),
            'why_choose_us' => $this->loadUsp(),
            'classes' => $this->loadClasses(),
            'testimonials' => $this->loadTrust(),
            'cta' => $this->loadPromo(),
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
    private function loadHero(): array
    {
        $s = $this->section('hero');
        $c = $s->content_json ?? [];
        $urls = $c['background_urls'] ?? [];
        $urlsText = is_array($urls) ? implode("\n", $urls) : '';

        return [
            'headline' => $c['headline'] ?? '',
            'subheadline' => $c['subheadline'] ?? '',
            'buttons' => $c['buttons'] ?? [],
            'background_urls' => $urlsText,
        ];
    }

    /**
     * @param  array<string, mixed>  $hero
     */
    private function persistHero(array $hero): void
    {
        $section = $this->section('hero');
        $lines = array_values(array_filter(array_map('trim', explode("\n", (string) ($hero['background_urls'] ?? '')))));
        $section->content_json = [
            'headline' => $hero['headline'] ?? '',
            'subheadline' => $hero['subheadline'] ?? '',
            'buttons' => $hero['buttons'] ?? [],
            'background_urls' => array_slice($lines, 0, 5),
        ];
        $section->save();
    }

    /**
     * @return array<string, mixed>
     */
    private function loadUsp(): array
    {
        $s = $this->section('why_choose_us');
        $c = $s->content_json ?? [];
        $points = [];
        foreach ($s->items()->where('type', 'usp')->orderBy('sort_order')->get() as $item) {
            $points[] = [
                'icon' => $item->icon_url ?? '',
                'title' => $item->title,
                'description' => $item->description,
            ];
        }
        $side = $c['side_images_urls'] ?? [];
        $sideText = is_array($side) ? implode("\n", $side) : '';

        return [
            'title' => $c['title'] ?? '',
            'description' => $c['description'] ?? '',
            'points' => $points,
            'side_images_urls' => $sideText,
        ];
    }

    /**
     * @param  array<string, mixed>  $usp
     */
    private function persistUsp(array $usp): void
    {
        $section = $this->section('why_choose_us');
        $lines = array_values(array_filter(array_map('trim', explode("\n", (string) ($usp['side_images_urls'] ?? '')))));
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

    /**
     * @return array<string, mixed>
     */
    private function loadClasses(): array
    {
        $c = $this->section('classes')->content_json ?? [];

        return [
            'title' => $c['title'] ?? '',
            'description' => $c['description'] ?? '',
            'button_text' => $c['button_text'] ?? '',
            'button_url' => $c['button_url'] ?? '',
            'max_items' => (int) ($c['max_items'] ?? 20),
        ];
    }

    /**
     * @param  array<string, mixed>  $classes
     */
    private function persistClasses(array $classes): void
    {
        $section = $this->section('classes');
        $section->content_json = [
            'title' => $classes['title'] ?? '',
            'description' => $classes['description'] ?? '',
            'button_text' => $classes['button_text'] ?? '',
            'button_url' => $classes['button_url'] ?? '',
            'max_items' => (int) ($classes['max_items'] ?? 20),
        ];
        $section->save();
    }

    /**
     * @return array<string, mixed>
     */
    private function loadTrust(): array
    {
        $s = $this->section('testimonials');
        $c = $s->content_json ?? [];
        $logos = [];
        foreach ($s->items()->where('type', 'logo')->orderBy('sort_order')->get() as $item) {
            $logos[] = [
                'image_url' => $item->image_url,
                'title' => $item->title,
            ];
        }

        return [
            'logos' => $logos,
            'google_rating_text' => $c['google_rating']['text'] ?? '',
            'google_button_label' => $c['google_rating']['button_label'] ?? '',
            'google_button_url' => $c['google_rating']['button_url'] ?? '',
        ];
    }

    /**
     * @param  array<string, mixed>  $trust
     */
    private function persistTrust(array $trust): void
    {
        $section = $this->section('testimonials');
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

    /**
     * @return array<string, mixed>
     */
    private function loadPromo(): array
    {
        $s = $this->section('cta');
        $c = $s->content_json ?? [];
        $banners = $c['banner_urls'] ?? [];
        $bText = is_array($banners) ? implode("\n", $banners) : '';
        $cards = [];
        foreach ($s->items()->where('type', 'promo_card')->orderBy('sort_order')->get() as $item) {
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
            'banner_urls' => $bText,
            'cards' => $cards,
        ];
    }

    /**
     * @param  array<string, mixed>  $promo
     */
    private function persistPromo(array $promo): void
    {
        $section = $this->section('cta');
        $lines = array_values(array_filter(array_map('trim', explode("\n", (string) ($promo['banner_urls'] ?? '')))));
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
                'extra_json' => [
                    'button_label' => $row['button_label'] ?? '',
                ],
            ]);
        }
    }
}
