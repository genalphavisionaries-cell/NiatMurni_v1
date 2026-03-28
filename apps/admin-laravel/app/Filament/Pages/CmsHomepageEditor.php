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
    
    public bool $isSaving = false;

    public function mount(): void
    {
        $this->form->fill($this->loadFormData());
    }

    public function form(Form $form): Form
    {
        $homepageStatus = $this->getHomepageStatus();
        
        return $form
            ->schema([
                // Global Homepage Status Banner
                Section::make('')
                    ->schema([
                        Placeholder::make('homepage_status')
                            ->label('')
                            ->content(function () use ($homepageStatus) {
                                $statusBadge = $homepageStatus['is_live'] 
                                    ? '<span style="background: #059669; color: white; padding: 4px 12px; border-radius: 6px; font-weight: 600;">🌐 Homepage Live</span>'
                                    : '<span style="background: #D97706; color: white; padding: 4px 12px; border-radius: 6px; font-weight: 600;">✏️ Draft Changes Pending</span>';
                                
                                $sectionStatus = implode(' | ', array_map(
                                    fn($section, $status) => "<strong>{$section}:</strong> " . $this->formatSectionStatus($status),
                                    array_keys($homepageStatus['sections']),
                                    $homepageStatus['sections']
                                ));
                                
                                return "<div style='padding: 16px; border: 2px solid #e5e7eb; border-radius: 8px; background: #f9fafb;'>
                                    <div style='margin-bottom: 8px;'>{$statusBadge}</div>
                                    <div style='font-size: 14px; color: #6b7280;'>{$sectionStatus}</div>
                                </div>";
                            }),
                    ])
                    ->columnSpanFull(),
                    
                Tabs::make('homeTabs')
                    ->columnSpanFull()
                    ->tabs([
                        Tab::make('Hero Section')
                            ->icon('heroicon-o-sparkles')
                            ->badge(fn () => $this->getSectionStatusBadge('hero'))
                            ->badgeColor(fn () => $this->getSectionStatusColor('hero'))
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
                            ->badge(fn () => $this->getSectionStatusBadge('why_choose_us'))
                            ->badgeColor(fn () => $this->getSectionStatusColor('why_choose_us'))
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
                            ->badge(fn () => $this->getSectionStatusBadge('testimonials'))
                            ->badgeColor(fn () => $this->getSectionStatusColor('testimonials'))
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
                            ->badge(fn () => $this->getSectionStatusBadge('cta'))
                            ->badgeColor(fn () => $this->getSectionStatusColor('cta'))
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
        if ($this->isSaving) {
            return; // Prevent double-saves
        }
        
        $this->isSaving = true;
        \Log::info('CMS SAVE DRAFT: Starting save process');
        
        try {
            // Validate form first
            $this->form->validate();
            
            $data = $this->form->getState();
            \Log::info('CMS SAVE DRAFT: Form data retrieved', ['data_keys' => array_keys($data)]);
            
            if (empty($data)) {
                throw new \Exception('No form data received. Please refresh and try again.');
            }
            
            // Set all sections to draft mode before saving
            $data = $this->setSectionsDraftMode($data);
            \Log::info('CMS SAVE DRAFT: Set to draft mode');
            
            $this->saveAllSections($data);
            
            app(CmsService::class)->forgetCache();
            \Log::info('CMS SAVE DRAFT: Cache cleared');

            Notification::make()
                ->title('✅ Draft Saved Successfully')
                ->body('Your changes have been saved as a draft. Use "Publish Changes" to make them live.')
                ->success()
                ->duration(5000)
                ->send();
            
            \Log::info('CMS SAVE DRAFT: Success notification sent');
            
            // Refresh form data to show updated status
            $this->form->fill($this->loadFormData());
                
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('CMS SAVE DRAFT: Validation failed', ['errors' => $e->errors()]);
            
            Notification::make()
                ->title('Validation Failed')
                ->body('Please fix the form errors before saving.')
                ->danger()
                ->send();
                
        } catch (\Throwable $e) {
            \Log::error('CMS SAVE DRAFT: Failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            Notification::make()
                ->title('❌ Save Failed')
                ->body('Could not save your changes: ' . $e->getMessage() . ' Please try again or contact support.')
                ->danger()
                ->persistent()
                ->send();
        } finally {
            $this->isSaving = false;
        }
    }

    public function publishChanges(): void
    {
        \Log::info('CMS PUBLISH: Starting publish process');
        
        try {
            $data = $this->form->getState();
            \Log::info('CMS PUBLISH: Form data retrieved', ['data_keys' => array_keys($data)]);
            
            // Validate ALL critical sections for homepage consistency
            $validationResult = $this->validateEntireHomepageForPublish($data);
            \Log::info('CMS PUBLISH: Validation result', $validationResult);
            
            if (!$validationResult['can_publish']) {
                \Log::warning('CMS PUBLISH: Validation failed', $validationResult);
                
                Notification::make()
                    ->title('Homepage Cannot Be Published')
                    ->body($validationResult['message'])
                    ->danger()
                    ->persistent()
                    ->send();
                return;
            }

            // Set all sections to published mode
            $data = $this->setSectionsPublishMode($data);
            \Log::info('CMS PUBLISH: Set to publish mode');
            
            $this->saveAllSections($data);
            
            app(CmsService::class)->forgetCache();
            \Log::info('CMS PUBLISH: Cache cleared');

            Notification::make()
                ->title('Homepage Published Successfully')
                ->body('All sections are now live! Your homepage is complete and published.')
                ->success()
                ->duration(5000)
                ->send();
            
            \Log::info('CMS PUBLISH: Success notification sent');
                
        } catch (\Throwable $e) {
            \Log::error('CMS PUBLISH: Failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            Notification::make()
                ->title('Publish Failed')
                ->body('Could not publish your changes: ' . $e->getMessage())
                ->danger()
                ->persistent()
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

    /**
     * Save all sections with comprehensive error handling.
     */
    private function saveAllSections(array $data): void
    {
        DB::transaction(function () use ($data) {
            \Log::info('CMS SAVE: Starting transaction');
            
            $sectionsProcessed = [];
            
            try {
                if (isset($data['hero'])) {
                    \Log::info('CMS SAVE: Persisting hero', ['hero_data' => $data['hero']]);
                    $this->persistHero($data['hero']);
                    $sectionsProcessed[] = 'hero';
                }
                
                if (isset($data['why_choose_us']) || isset($data['usp'])) {
                    $uspData = $data['why_choose_us'] ?? $data['usp'] ?? [];
                    \Log::info('CMS SAVE: Persisting USP', ['usp_data' => $uspData]);
                    $this->persistUsp($uspData);
                    $sectionsProcessed[] = 'why_choose_us';
                }
                
                if (isset($data['classes'])) {
                    \Log::info('CMS SAVE: Persisting classes', ['classes_data' => $data['classes']]);
                    $this->persistClasses($data['classes']);
                    $sectionsProcessed[] = 'classes';
                }
                
                if (isset($data['testimonials']) || isset($data['trust'])) {
                    $trustData = $data['testimonials'] ?? $data['trust'] ?? [];
                    \Log::info('CMS SAVE: Persisting trust', ['trust_data' => $trustData]);
                    $this->persistTrust($trustData);
                    $sectionsProcessed[] = 'testimonials';
                }
                
                if (isset($data['cta']) || isset($data['promo'])) {
                    $ctaData = $data['cta'] ?? $data['promo'] ?? [];
                    \Log::info('CMS SAVE: Persisting CTA', ['cta_data' => $ctaData]);
                    $this->persistPromo($ctaData);
                    $sectionsProcessed[] = 'cta';
                }
                
                \Log::info('CMS SAVE: All sections persisted successfully', ['sections' => $sectionsProcessed]);
                
            } catch (\Throwable $e) {
                \Log::error('CMS SAVE: Section save failed', [
                    'sections_processed' => $sectionsProcessed,
                    'error' => $e->getMessage(),
                ]);
                throw $e; // Re-throw to trigger transaction rollback
            }
        });
    }

    private function validateEntireHomepageForPublish(array $data): array
    {
        $errors = [];
        $sections = [];
        
        // Validate ALL critical sections regardless of individual toggles
        
        // 1. Validate Hero Section
        $hero = $data['hero'] ?? [];
        $heroErrors = $this->validateSectionData('Hero', $hero, [
            'headline' => 'Main headline is required to attract visitors',
            'subheadline' => 'Description helps explain your service',
        ]);
        if (!empty($heroErrors)) {
            $errors = array_merge($errors, $heroErrors);
            $sections['hero'] = 'incomplete';
        } else {
            $sections['hero'] = 'ready';
        }
        
        // 2. Validate Why Choose Us Section  
        $why = $data['why_choose_us'] ?? [];
        $whyErrors = $this->validateSectionData('Why Choose Us', $why, [
            'title' => 'Section title is required to highlight your advantages',
        ]);
        
        $points = $why['points'] ?? [];
        $validPoints = array_filter($points, fn($p) => !empty(trim($p['title'] ?? '')));
        if (empty($validPoints)) {
            $whyErrors[] = "• Why Choose Us: At least 1 benefit point is required to showcase your value";
        }
        
        if (!empty($whyErrors)) {
            $errors = array_merge($errors, $whyErrors);
            $sections['why_choose_us'] = 'incomplete';
        } else {
            $sections['why_choose_us'] = 'ready';
        }
        
        // 3. Validate CTA/Promotions Section
        $cta = $data['cta'] ?? [];
        $ctaErrors = $this->validateSectionData('Promotions', $cta, [
            'title' => 'Section title is required to drive customer action',
        ]);
        
        $cards = $cta['cards'] ?? [];
        $validCards = array_filter($cards, fn($c) => !empty(trim($c['title'] ?? '')));
        if (empty($validCards)) {
            $ctaErrors[] = "• Promotions: At least 1 promotional offer is required to drive conversions";
        }
        
        if (!empty($ctaErrors)) {
            $errors = array_merge($errors, $ctaErrors);
            $sections['cta'] = 'incomplete';
        } else {
            $sections['cta'] = 'ready';
        }

        // Build comprehensive response
        if (!empty($errors)) {
            $message = "Homepage cannot be published until all required sections are complete:\n\n" . 
                      implode("\n", $errors) . 
                      "\n\n💡 You can still save as draft to preserve your work.";
                      
            return [
                'can_publish' => false,
                'message' => $message,
                'errors' => $errors,
                'sections_status' => $sections,
            ];
        }

        return [
            'can_publish' => true,
            'message' => 'All sections are ready for publishing!',
            'errors' => [],
            'sections_status' => $sections,
        ];
    }

    private function validateSectionData(string $sectionName, array $section, array $requiredFields): array
    {
        $errors = [];
        
        foreach ($requiredFields as $field => $message) {
            if (empty(trim($section[$field] ?? ''))) {
                $errors[] = "• {$sectionName}: {$message}";
            }
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
                ->tooltip('Save your changes without publishing')
                ->requiresConfirmation(false)
                ->keyBindings(['ctrl+s', 'cmd+s']),
                
            Action::make('publish')
                ->label('Publish Changes')
                ->icon('heroicon-o-globe-alt')
                ->action('publishChanges')
                ->color('success')
                ->tooltip('Validate and publish changes to the website')
                ->requiresConfirmation()
                ->modalHeading('Publish Homepage Changes')
                ->modalDescription('This will make your changes live on the website. All sections will be validated before publishing.')
                ->modalSubmitActionLabel('Publish Now'),
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
        
        // Prepare updates (only include provided fields)
        $updates = [];
        if (array_key_exists('headline', $hero)) {
            $updates['headline'] = $hero['headline'] ?? '';
        }
        if (array_key_exists('subheadline', $hero)) {
            $updates['subheadline'] = $hero['subheadline'] ?? '';
        }
        if (array_key_exists('buttons', $hero)) {
            $updates['buttons'] = $hero['buttons'] ?? [];
        }
        if (array_key_exists('background_urls', $hero)) {
            $updates['background_urls'] = array_slice($lines, 0, 5);
        }
        
        // Deep merge to preserve nested structures like buttons array
        $existingContent = $section->content_json ?? [];
        $newContent = $this->deepMerge($existingContent, $updates);
        
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
        
        // Prepare updates (only include provided fields)
        $updates = [];
        if (array_key_exists('title', $usp)) {
            $updates['title'] = $usp['title'] ?? '';
        }
        if (array_key_exists('description', $usp)) {
            $updates['description'] = $usp['description'] ?? '';
        }
        if (array_key_exists('side_images_urls', $usp)) {
            $updates['side_images_urls'] = $lines;
        }
        
        // Deep merge to preserve existing content
        $existingContent = $section->content_json ?? [];
        $newContent = $this->deepMerge($existingContent, $updates);
        
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
        
        // Prepare updates (only include provided fields)
        $updates = [];
        if (array_key_exists('title', $classes)) {
            $updates['title'] = $classes['title'] ?? '';
        }
        if (array_key_exists('description', $classes)) {
            $updates['description'] = $classes['description'] ?? '';
        }
        if (array_key_exists('button_text', $classes)) {
            $updates['button_text'] = $classes['button_text'] ?? '';
        }
        if (array_key_exists('button_url', $classes)) {
            $updates['button_url'] = $classes['button_url'] ?? '';
        }
        if (array_key_exists('max_items', $classes)) {
            $updates['max_items'] = (int) ($classes['max_items'] ?? 20);
        }
        
        // Deep merge to preserve existing content
        $existingContent = $section->content_json ?? [];
        $newContent = $this->deepMerge($existingContent, $updates);
        
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
        
        // Prepare updates (only include provided fields)
        $updates = [];
        if (array_key_exists('google_rating_text', $trust) || 
            array_key_exists('google_button_label', $trust) || 
            array_key_exists('google_button_url', $trust)) {
            
            $existingRating = ($section->content_json ?? [])['google_rating'] ?? [];
            $updates['google_rating'] = [];
            
            if (array_key_exists('google_rating_text', $trust)) {
                $updates['google_rating']['text'] = $trust['google_rating_text'] ?? '';
            }
            if (array_key_exists('google_button_label', $trust)) {
                $updates['google_rating']['button_label'] = $trust['google_button_label'] ?? '';
            }
            if (array_key_exists('google_button_url', $trust)) {
                $updates['google_rating']['button_url'] = $trust['google_button_url'] ?? '';
            }
            
            // Merge with existing google_rating data
            $updates['google_rating'] = $this->deepMerge($existingRating, $updates['google_rating']);
        }
        
        // Deep merge to preserve existing content
        $existingContent = $section->content_json ?? [];
        $newContent = $this->deepMerge($existingContent, $updates);
        
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
        
        // Prepare updates (only include provided fields)
        $updates = [];
        if (array_key_exists('title', $promo)) {
            $updates['title'] = $promo['title'] ?? '';
        }
        if (array_key_exists('description', $promo)) {
            $updates['description'] = $promo['description'] ?? '';
        }
        if (array_key_exists('banner_urls', $promo)) {
            $updates['banner_urls'] = array_slice($lines, 0, 3);
        }
        
        // Deep merge to preserve existing content
        $existingContent = $section->content_json ?? [];
        $newContent = $this->deepMerge($existingContent, $updates);
        
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

    /**
     * Recursively merge arrays to preserve nested structure and prevent data loss.
     * 
     * @param array $original - Existing data
     * @param array $updates - New data to merge in
     * @return array - Deeply merged result
     */
    private function deepMerge(array $original, array $updates): array
    {
        $result = $original;
        
        foreach ($updates as $key => $value) {
            if (is_array($value) && isset($result[$key]) && is_array($result[$key])) {
                // Recursively merge nested arrays
                $result[$key] = $this->deepMerge($result[$key], $value);
            } else {
                // Direct assignment for scalar values or new keys
                $result[$key] = $value;
            }
        }
        
        return $result;
    }

    /**
     * Safely update only provided fields while preserving existing data structure.
     * 
     * @param array $existing - Current section data
     * @param array $updates - New data to apply
     * @param array $fieldMap - Mapping of form fields to data structure
     * @return array - Merged result
     */
    private function mergeContentData(array $existing, array $updates, array $fieldMap = []): array
    {
        $merged = $existing;
        
        foreach ($updates as $key => $value) {
            if ($key === 'enabled') {
                continue; // Skip enabled field (handled separately)
            }
            
            // Apply field mapping if provided
            $targetKey = $fieldMap[$key] ?? $key;
            
            if (is_array($value) && isset($merged[$targetKey]) && is_array($merged[$targetKey])) {
                // Deep merge for nested structures
                $merged[$targetKey] = $this->deepMerge($merged[$targetKey], $value);
            } else {
                // Direct update for scalar values
                $merged[$targetKey] = $value;
            }
        }
        
        return $merged;
    }

    /**
     * Get the current live status of the homepage and its sections.
     */
    private function getHomepageStatus(): array
    {
        $page = $this->homepage();
        $sections = $page->sections()->get()->keyBy('section_key');
        
        $sectionStatuses = [];
        $allLive = true;
        
        $criticalSections = [
            'hero' => 'Hero',
            'why_choose_us' => 'Why Choose Us', 
            'testimonials' => 'Trust & Reviews',
            'cta' => 'Promotions',
        ];
        
        foreach ($criticalSections as $key => $label) {
            $section = $sections->get($key);
            
            if (!$section) {
                $sectionStatuses[$label] = 'missing';
                $allLive = false;
                continue;
            }
            
            if (!$section->is_active) {
                $sectionStatuses[$label] = 'draft';
                $allLive = false;
                continue;
            }
            
            // Check if section has meaningful content
            $content = $section->content_json ?? [];
            $hasContent = $this->sectionHasContent($key, $content, $section);
            
            if (!$hasContent) {
                $sectionStatuses[$label] = 'incomplete';
                $allLive = false;
            } else {
                $sectionStatuses[$label] = 'live';
            }
        }
        
        return [
            'is_live' => $allLive,
            'sections' => $sectionStatuses,
        ];
    }
    
    /**
     * Check if a section has meaningful content for live status.
     */
    private function sectionHasContent(string $sectionKey, array $content, $section): bool
    {
        switch ($sectionKey) {
            case 'hero':
                return !empty(trim($content['headline'] ?? ''));
                
            case 'why_choose_us':
                $hasTitle = !empty(trim($content['title'] ?? ''));
                $hasPoints = $section->items()->where('type', 'usp')->where('is_active', true)->count() > 0;
                return $hasTitle && $hasPoints;
                
            case 'testimonials':
                $hasRating = !empty(trim($content['google_rating']['text'] ?? ''));
                $hasLogos = $section->items()->where('type', 'logo')->where('is_active', true)->count() > 0;
                return $hasRating || $hasLogos;
                
            case 'cta':
                $hasTitle = !empty(trim($content['title'] ?? ''));
                $hasCards = $section->items()->where('type', 'promo_card')->where('is_active', true)->count() > 0;
                return $hasTitle && $hasCards;
                
            default:
                return true;
        }
    }
    
    /**
     * Format section status for display.
     */
    private function formatSectionStatus(string $status): string
    {
        return match($status) {
            'live' => '<span style="color: #059669;">Live</span>',
            'draft' => '<span style="color: #D97706;">Draft</span>',
            'incomplete' => '<span style="color: #DC2626;">Incomplete</span>',
            'missing' => '<span style="color: #991B1B;">Missing</span>',
            default => $status,
        };
    }

    /**
     * Get status badge text for individual section tabs.
     */
    private function getSectionStatusBadge(string $sectionKey): string
    {
        $status = $this->getHomepageStatus();
        $sectionName = match($sectionKey) {
            'hero' => 'Hero',
            'why_choose_us' => 'Why Choose Us',
            'testimonials' => 'Trust & Reviews', 
            'cta' => 'Promotions',
            default => ucfirst($sectionKey),
        };
        
        $sectionStatus = $status['sections'][$sectionName] ?? 'missing';
        
        return match($sectionStatus) {
            'live' => 'Live',
            'draft' => 'Draft',
            'incomplete' => 'Needs Content',
            'missing' => 'Missing',
            default => 'Unknown',
        };
    }

    /**
     * Get status badge color for individual section tabs.
     */
    private function getSectionStatusColor(string $sectionKey): string
    {
        $status = $this->getHomepageStatus();
        $sectionName = match($sectionKey) {
            'hero' => 'Hero',
            'why_choose_us' => 'Why Choose Us',
            'testimonials' => 'Trust & Reviews', 
            'cta' => 'Promotions',
            default => ucfirst($sectionKey),
        };
        
        $sectionStatus = $status['sections'][$sectionName] ?? 'missing';
        
        return match($sectionStatus) {
            'live' => 'success',
            'draft' => 'warning', 
            'incomplete' => 'danger',
            'missing' => 'gray',
            default => 'gray',
        };
    }
}
