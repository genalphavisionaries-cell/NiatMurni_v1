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
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\Card;
use Filament\Forms\Components\Fieldset;
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
                        Tab::make('Hero Section')
                            ->icon('heroicon-o-sparkles')
                            ->schema([
                                Section::make('🎯 Hero Section')
                                    ->description('The main banner that visitors see first. Create a compelling headline and call-to-action.')
                                    ->collapsible()
                                    ->schema([
                                        Grid::make(2)->schema([
                                            Toggle::make('hero.enabled')
                                                ->label('Published')
                                                ->helperText('Toggle to publish/draft this section')
                                                ->default(true)
                                                ->columnSpanFull(),
                                        ]),
                                        
                                        Fieldset::make('Content')
                                            ->schema([
                                                TextInput::make('hero.headline')
                                                    ->label('Main Headline')
                                                    ->placeholder('e.g., "KKM Food Handler Certification"')
                                                    ->helperText('The primary message visitors will see')
                                                    ->maxLength(500)
                                                    ->columnSpanFull(),
                                                    
                                                Textarea::make('hero.subheadline')
                                                    ->label('Description')
                                                    ->placeholder('Explain your service benefits...')
                                                    ->helperText('Support your headline with compelling details')
                                                    ->rows(3)
                                                    ->columnSpanFull(),
                                            ]),

                                        Fieldset::make('Call-to-Action Buttons')
                                            ->schema([
                                                Repeater::make('hero.buttons')
                                                    ->label('Action Buttons (max 2)')
                                                    ->maxItems(2)
                                                    ->schema([
                                                        TextInput::make('label')
                                                            ->label('Button Text')
                                                            ->placeholder('e.g., "Register Now"')
                                                            ->required(),
                                                        TextInput::make('url')
                                                            ->label('Button Link')
                                                            ->placeholder('e.g., "/#classes"')
                                                            ->required(),
                                                        ColorPicker::make('color')
                                                            ->label('Button Color')
                                                            ->helperText('Leave empty for default'),
                                                    ])
                                                    ->columns(2)
                                                    ->defaultItems(1)
                                                    ->addActionLabel('+ Add Button')
                                                    ->collapsible(),
                                            ]),

                                        Fieldset::make('Background Images')
                                            ->schema([
                                                Textarea::make('hero.background_urls')
                                                    ->label('Background Image URLs')
                                                    ->placeholder("https://example.com/hero-bg.jpg\nhttps://example.com/hero-bg-2.jpg")
                                                    ->rows(4)
                                                    ->helperText('Enter up to 5 image URLs, one per line. First image is primary. Images will rotate automatically.')
                                                    ->columnSpanFull(),
                                            ]),
                                    ]),
                            ]),
                        Tab::make('Why Choose Us')
                            ->icon('heroicon-o-star')
                            ->schema([
                                Section::make('⭐ Why Choose Us Section')
                                    ->description('Highlight your unique value propositions and competitive advantages to convince visitors.')
                                    ->collapsible()
                                    ->schema([
                                        Toggle::make('why_choose_us.enabled')
                                            ->label('Published')
                                            ->helperText('Toggle to publish/draft this section')
                                            ->default(true),
                                        
                                        Fieldset::make('Section Header')
                                            ->schema([
                                                TextInput::make('why_choose_us.title')
                                                    ->label('Section Title')
                                                    ->placeholder('e.g., "Why Choose Niat Murni Academy?"')
                                                    ->helperText('Clear title explaining why customers should choose you')
                                                    ->maxLength(255)
                                                    ->columnSpanFull(),
                                                    
                                                Textarea::make('why_choose_us.description')
                                                    ->label('Section Description')
                                                    ->placeholder('Optional description to support your benefits...')
                                                    ->helperText('Brief explanation of your advantages (optional)')
                                                    ->rows(3)
                                                    ->columnSpanFull(),
                                            ]),

                                        Fieldset::make('Benefit Points')
                                            ->schema([
                                                Repeater::make('why_choose_us.points')
                                                    ->label('Your Key Benefits (max 6)')
                                                    ->maxItems(6)
                                                    ->schema([
                                                        TextInput::make('title')
                                                            ->label('Benefit Title')
                                                            ->placeholder('e.g., "KKM Certified Trainers"')
                                                            ->required()
                                                            ->maxLength(200),
                                                        TextInput::make('icon')
                                                            ->label('Icon Name')
                                                            ->placeholder('award, shield, certificate, etc.')
                                                            ->helperText('Choose from: award, shield, certificate, clock, monitor')
                                                            ->maxLength(50),
                                                        Textarea::make('description')
                                                            ->label('Benefit Description')
                                                            ->placeholder('Explain this advantage in detail...')
                                                            ->helperText('Optional: Elaborate on this benefit')
                                                            ->rows(2)
                                                            ->maxLength(500)
                                                            ->columnSpanFull(),
                                                    ])
                                                    ->columns(2)
                                                    ->defaultItems(0)
                                                    ->addActionLabel('+ Add Benefit')
                                                    ->reorderable()
                                                    ->collapsible()
                                                    ->itemLabel(fn (array $state): ?string => $state['title'] ?? 'New Benefit'),
                                            ]),

                                        Fieldset::make('Visual Elements')
                                            ->schema([
                                                Textarea::make('why_choose_us.side_images_urls')
                                                    ->label('Supporting Images')
                                                    ->placeholder("https://example.com/benefits-image.jpg\nhttps://example.com/team-photo.jpg")
                                                    ->helperText('Images to display alongside your benefits (one URL per line)')
                                                    ->rows(3)
                                                    ->columnSpanFull(),
                                            ]),
                                    ]),
                            ]),
                        Tab::make('Classes Section')
                            ->icon('heroicon-o-academic-cap')
                            ->schema([
                                Section::make('🎓 Upcoming Classes Section')
                                    ->description('Configure how upcoming class listings are displayed. Classes are automatically loaded from your course schedule.')
                                    ->collapsible()
                                    ->schema([
                                        Toggle::make('classes.enabled')
                                            ->label('Published')
                                            ->helperText('Toggle to show/hide the upcoming classes section')
                                            ->default(true),
                                        
                                        Fieldset::make('Section Content')
                                            ->schema([
                                                Grid::make(2)->schema([
                                                    TextInput::make('classes.title')
                                                        ->label('Section Title')
                                                        ->placeholder('e.g., "Upcoming Classes"')
                                                        ->helperText('Title for the classes listing section')
                                                        ->maxLength(255),
                                                        
                                                    TextInput::make('classes.max_items')
                                                        ->label('Maximum Classes Shown')
                                                        ->numeric()
                                                        ->default(20)
                                                        ->minValue(1)
                                                        ->maxValue(100)
                                                        ->helperText('How many classes to display'),
                                                ]),
                                                
                                                Textarea::make('classes.description')
                                                    ->label('Section Description')
                                                    ->placeholder('Browse our upcoming KKM certification classes...')
                                                    ->helperText('Optional description for the classes section')
                                                    ->rows(3)
                                                    ->columnSpanFull(),
                                            ]),

                                        Fieldset::make('Call-to-Action')
                                            ->schema([
                                                Grid::make(2)->schema([
                                                    TextInput::make('classes.button_text')
                                                        ->label('View All Button Text')
                                                        ->placeholder('e.g., "View All Classes"')
                                                        ->helperText('Button text for viewing all classes')
                                                        ->maxLength(100),
                                                        
                                                    TextInput::make('classes.button_url')
                                                        ->label('View All Button Link')
                                                        ->placeholder('e.g., "/classes"')
                                                        ->helperText('Where the "view all" button links to')
                                                        ->maxLength(2048),
                                                ]),
                                            ]),

                                        Placeholder::make('classes_note')
                                            ->label('')
                                            ->content('💡 Class listings are automatically loaded from your course schedule in Programs → Classes. This section controls how they are displayed on the homepage.'),
                                    ]),
                            ]),
                        Tab::make('Trust & Reviews')
                            ->icon('heroicon-o-shield-check')
                            ->schema([
                                Section::make('🛡️ Trust & Social Proof Section')
                                    ->description('Build credibility with customer reviews, brand partnerships, and trust indicators.')
                                    ->collapsible()
                                    ->schema([
                                        Toggle::make('testimonials.enabled')
                                            ->label('Published')
                                            ->helperText('Toggle to publish/draft this section')
                                            ->default(true),
                                        
                                        Fieldset::make('Brand Partnership Logos')
                                            ->schema([
                                                Repeater::make('trust.logos')
                                                    ->label('Partner/Trust Logos (max 20)')
                                                    ->maxItems(20)
                                                    ->schema([
                                                        TextInput::make('title')
                                                            ->label('Company/Brand Name')
                                                            ->placeholder('e.g., "KKM Malaysia"')
                                                            ->required()
                                                            ->maxLength(100),
                                                        TextInput::make('image_url')
                                                            ->label('Logo Image URL')
                                                            ->placeholder('https://example.com/logo.png')
                                                            ->helperText('High-quality logo image (recommended: PNG with transparent background)')
                                                            ->maxLength(2048)
                                                            ->url(),
                                                    ])
                                                    ->columns(2)
                                                    ->defaultItems(0)
                                                    ->addActionLabel('+ Add Brand Logo')
                                                    ->reorderable()
                                                    ->collapsible()
                                                    ->itemLabel(fn (array $state): ?string => $state['title'] ?? 'New Brand')
                                                    ->columnSpanFull(),
                                            ]),

                                        Fieldset::make('Google Reviews Integration')
                                            ->schema([
                                                Grid::make(3)->schema([
                                                    TextInput::make('testimonials.google_rating_text')
                                                        ->label('Rating Description')
                                                        ->placeholder('e.g., "Rated 4.9/5 by customers"')
                                                        ->helperText('How to describe your Google rating'),
                                                        
                                                    TextInput::make('testimonials.google_button_label')
                                                        ->label('Review Button Text')
                                                        ->placeholder('e.g., "Write a Review"')
                                                        ->helperText('Call-to-action for reviews'),
                                                        
                                                    TextInput::make('testimonials.google_button_url')
                                                        ->label('Google Reviews Link')
                                                        ->placeholder('https://g.page/r/...')
                                                        ->helperText('Direct link to your Google Business reviews')
                                                        ->maxLength(2048)
                                                        ->url(),
                                                ]),
                                            ]),

                                        Placeholder::make('testimonials_note')
                                            ->label('')
                                            ->content('💡 Individual customer testimonials are managed separately under CMS → Testimonials for dedicated review management.'),
                                    ]),
                            ]),
                        Tab::make('Promotions & CTA')
                            ->icon('heroicon-o-megaphone')
                            ->schema([
                                Section::make('🎯 Call-to-Action & Promotions')
                                    ->description('Drive conversions with promotional offers, special deals, and compelling calls-to-action.')
                                    ->collapsible()
                                    ->schema([
                                        Toggle::make('cta.enabled')
                                            ->label('Published')
                                            ->helperText('Toggle to publish/draft this section')
                                            ->default(true),
                                        
                                        Fieldset::make('Section Header')
                                            ->schema([
                                                TextInput::make('cta.title')
                                                    ->label('Section Title')
                                                    ->placeholder('e.g., "Special Offers & Promotions"')
                                                    ->helperText('Attract attention with compelling promotional title')
                                                    ->maxLength(255)
                                                    ->columnSpanFull(),
                                                    
                                                Textarea::make('cta.description')
                                                    ->label('Section Description')
                                                    ->placeholder('Limited-time offers and exclusive deals...')
                                                    ->helperText('Explain your current promotional campaign')
                                                    ->rows(3)
                                                    ->columnSpanFull(),
                                            ]),

                                        Fieldset::make('Banner Images')
                                            ->schema([
                                                Textarea::make('cta.banner_urls')
                                                    ->label('Promotional Banner Images')
                                                    ->placeholder("https://example.com/promo-banner.jpg\nhttps://example.com/special-offer.jpg")
                                                    ->rows(3)
                                                    ->helperText('Up to 3 promotional banner images (one URL per line)')
                                                    ->columnSpanFull(),
                                            ]),

                                        Fieldset::make('Promotional Cards')
                                            ->schema([
                                                Repeater::make('cta.cards')
                                                    ->label('Promotion Cards (max 10)')
                                                    ->maxItems(10)
                                                    ->schema([
                                                        Grid::make(2)->schema([
                                                            TextInput::make('title')
                                                                ->label('Offer Title')
                                                                ->placeholder('e.g., "Early Bird Special"')
                                                                ->required()
                                                                ->maxLength(200),
                                                            TextInput::make('button_label')
                                                                ->label('Button Text')
                                                                ->placeholder('e.g., "Claim Offer"')
                                                                ->helperText('Call-to-action text')
                                                                ->maxLength(100),
                                                        ]),
                                                        
                                                        TextInput::make('image_url')
                                                            ->label('Card Image URL')
                                                            ->placeholder('https://example.com/offer-image.jpg')
                                                            ->helperText('Visual for this promotion')
                                                            ->maxLength(2048)
                                                            ->url()
                                                            ->columnSpanFull(),
                                                            
                                                        Textarea::make('description')
                                                            ->label('Offer Description')
                                                            ->placeholder('Describe the offer details, terms, or benefits...')
                                                            ->rows(3)
                                                            ->maxLength(500)
                                                            ->columnSpanFull(),
                                                            
                                                        TextInput::make('url')
                                                            ->label('Offer Link')
                                                            ->placeholder('e.g., "/#classes" or "/special-offer"')
                                                            ->helperText('Where users go when they click this offer')
                                                            ->maxLength(2048)
                                                            ->columnSpanFull(),
                                                    ])
                                                    ->defaultItems(0)
                                                    ->addActionLabel('+ Add Promotion')
                                                    ->reorderable()
                                                    ->collapsible()
                                                    ->itemLabel(fn (array $state): ?string => $state['title'] ?? 'New Promotion')
                                                    ->columnSpanFull(),
                                            ]),
                                    ]),
                            ]),
                    ]),
            ])
            ->statePath('data');
    }

    public function saveDraft(): void
    {
        $data = $this->form->getState();
        
        // Set all sections to draft mode before saving
        $data = $this->setSectionsDraftMode($data);
        
        try {
            DB::transaction(function () use ($data) {
                $this->persistHero($data['hero'] ?? []);
                $this->persistUsp($data['why_choose_us'] ?? $data['usp'] ?? []);
                $this->persistClasses($data['classes'] ?? []);
                $this->persistTrust($data['testimonials'] ?? $data['trust'] ?? []);
                $this->persistPromo($data['cta'] ?? $data['promo'] ?? []);
            });
            app(CmsService::class)->forgetCache();

            Notification::make()
                ->title('Draft Saved')
                ->body('Your changes have been saved as a draft. Use "Publish Changes" to make them live.')
                ->success()
                ->send();
                
        } catch (\Throwable $e) {
            Notification::make()
                ->title('Save Failed')
                ->body('Could not save your changes: ' . $e->getMessage())
                ->danger()
                ->send();
        }
    }

    public function publishChanges(): void
    {
        $data = $this->form->getState();
        
        // Validate for publish
        $validationErrors = $this->validateForPublish($data);
        
        if (!empty($validationErrors)) {
            $errorMessage = "Cannot publish - please fix the following issues:\n\n" . implode("\n", $validationErrors);
            
            Notification::make()
                ->title('Publish Failed')
                ->body($errorMessage)
                ->danger()
                ->persistent()
                ->send();
            return;
        }

        // Set all sections to published mode
        $data = $this->setSectionsPublishMode($data);
        
        try {
            DB::transaction(function () use ($data) {
                $this->persistHero($data['hero'] ?? []);
                $this->persistUsp($data['why_choose_us'] ?? $data['usp'] ?? []);
                $this->persistClasses($data['classes'] ?? []);
                $this->persistTrust($data['testimonials'] ?? $data['trust'] ?? []);
                $this->persistPromo($data['cta'] ?? $data['promo'] ?? []);
            });
            app(CmsService::class)->forgetCache();

            Notification::make()
                ->title('Published Successfully')
                ->body('Your homepage changes are now live on the website!')
                ->success()
                ->send();
                
        } catch (\Throwable $e) {
            Notification::make()
                ->title('Publish Failed')
                ->body('Could not publish your changes: ' . $e->getMessage())
                ->danger()
                ->send();
        }
    }

    private function setSectionsDraftMode(array $data): array
    {
        $sections = ['hero', 'why_choose_us', 'testimonials', 'cta', 'classes'];
        foreach ($sections as $section) {
            if (isset($data[$section])) {
                $data[$section]['enabled'] = false;
            }
        }
        return $data;
    }

    private function setSectionsPublishMode(array $data): array
    {
        $sections = ['hero', 'why_choose_us', 'testimonials', 'cta', 'classes'];
        foreach ($sections as $section) {
            if (isset($data[$section])) {
                $data[$section]['enabled'] = $data[$section]['enabled'] ?? true;
            }
        }
        return $data;
    }

    private function validateForPublish(array $data): array
    {
        $errors = [];
        
        // Validate Hero
        $hero = $data['hero'] ?? [];
        if (empty(trim($hero['headline'] ?? ''))) {
            $errors[] = "• Hero Section: Headline is required for publishing";
        }
        
        // Validate Why Choose Us
        $why = $data['why_choose_us'] ?? [];
        if (empty(trim($why['title'] ?? ''))) {
            $errors[] = "• Why Choose Us: Section title is required for publishing";
        }
        $points = $why['points'] ?? [];
        $validPoints = array_filter($points, fn($p) => !empty(trim($p['title'] ?? '')));
        if (empty($validPoints)) {
            $errors[] = "• Why Choose Us: At least 1 benefit point is required for publishing";
        }
        
        // Validate CTA
        $cta = $data['cta'] ?? [];
        if (empty(trim($cta['title'] ?? ''))) {
            $errors[] = "• Promotions: Section title is required for publishing";
        }
        $cards = $cta['cards'] ?? [];
        $validCards = array_filter($cards, fn($c) => !empty(trim($c['title'] ?? '')));
        if (empty($validCards)) {
            $errors[] = "• Promotions: At least 1 promotional offer is required for publishing";
        }
        
        return $errors;
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('save_draft')
                ->label('Save Draft')
                ->icon('heroicon-o-document-text')
                ->action('saveDraft')
                ->color('gray')
                ->tooltip('Save your changes without publishing'),
                
            Action::make('publish')
                ->label('Publish Changes')
                ->icon('heroicon-o-globe-alt')
                ->action('publishChanges')
                ->color('success')
                ->tooltip('Validate and publish changes to the website'),
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
            'enabled' => (bool) $s->is_active,
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
        
        // Merge with existing content to prevent data loss
        $existingContent = $section->content_json ?? [];
        $newContent = [
            'headline' => $hero['headline'] ?? $existingContent['headline'] ?? '',
            'subheadline' => $hero['subheadline'] ?? $existingContent['subheadline'] ?? '',
            'buttons' => $hero['buttons'] ?? $existingContent['buttons'] ?? [],
            'background_urls' => array_slice($lines, 0, 5),
        ];
        
        $section->content_json = $newContent;
        $section->is_active = $hero['enabled'] ?? $section->is_active ?? true;
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
            'enabled' => (bool) $s->is_active,
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
        
        // Merge with existing content
        $existingContent = $section->content_json ?? [];
        $newContent = [
            'title' => $usp['title'] ?? $existingContent['title'] ?? '',
            'description' => $usp['description'] ?? $existingContent['description'] ?? '',
            'side_images_urls' => $lines,
        ];
        
        $section->content_json = $newContent;
        $section->is_active = $usp['enabled'] ?? $section->is_active ?? true;
        $section->save();

        // Only update items if points are provided (prevent data loss)
        if (array_key_exists('points', $usp)) {
            $section->items()->where('type', 'usp')->delete();
            foreach ($usp['points'] ?? [] as $i => $row) {
                if (!empty(trim($row['title'] ?? ''))) { // Only create items with valid titles
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
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function loadClasses(): array
    {
        $s = $this->section('classes');
        $c = $s->content_json ?? [];

        return [
            'enabled' => (bool) $s->is_active,
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
        
        // Merge with existing content
        $existingContent = $section->content_json ?? [];
        $newContent = [
            'title' => $classes['title'] ?? $existingContent['title'] ?? '',
            'description' => $classes['description'] ?? $existingContent['description'] ?? '',
            'button_text' => $classes['button_text'] ?? $existingContent['button_text'] ?? '',
            'button_url' => $classes['button_url'] ?? $existingContent['button_url'] ?? '',
            'max_items' => (int) ($classes['max_items'] ?? $existingContent['max_items'] ?? 20),
        ];
        
        $section->content_json = $newContent;
        $section->is_active = $classes['enabled'] ?? $section->is_active ?? true;
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
            'enabled' => (bool) $s->is_active,
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
        
        // Merge with existing content
        $existingContent = $section->content_json ?? [];
        $existingRating = $existingContent['google_rating'] ?? [];
        
        $newContent = [
            'google_rating' => [
                'text' => $trust['google_rating_text'] ?? $existingRating['text'] ?? '',
                'button_label' => $trust['google_button_label'] ?? $existingRating['button_label'] ?? '',
                'button_url' => $trust['google_button_url'] ?? $existingRating['button_url'] ?? '',
            ],
        ];
        
        $section->content_json = $newContent;
        $section->is_active = $trust['enabled'] ?? $section->is_active ?? true;
        $section->save();

        // Only update logos if provided (prevent data loss)
        if (array_key_exists('logos', $trust)) {
            $section->items()->where('type', 'logo')->delete();
            foreach ($trust['logos'] ?? [] as $i => $row) {
                if (!empty(trim($row['title'] ?? ''))) { // Only create logos with valid titles
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
            'enabled' => (bool) $s->is_active,
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
        
        // Merge with existing content
        $existingContent = $section->content_json ?? [];
        $newContent = [
            'title' => $promo['title'] ?? $existingContent['title'] ?? '',
            'description' => $promo['description'] ?? $existingContent['description'] ?? '',
            'banner_urls' => array_slice($lines, 0, 3),
        ];
        
        $section->content_json = $newContent;
        $section->is_active = $promo['enabled'] ?? $section->is_active ?? true;
        $section->save();

        // Only update cards if provided (prevent data loss)
        if (array_key_exists('cards', $promo)) {
            $section->items()->where('type', 'promo_card')->delete();
            foreach ($promo['cards'] ?? [] as $i => $row) {
                if (!empty(trim($row['title'] ?? ''))) { // Only create cards with valid titles
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
    }
}
