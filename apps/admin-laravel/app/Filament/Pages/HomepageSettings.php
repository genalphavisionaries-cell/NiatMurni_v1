<?php

namespace App\Filament\Pages;

use App\Models\HomepageSetting;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
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

    public function mount(): void
    {
        $setting = HomepageSetting::singleton();
        $this->form->fill([
            'site_name' => $setting->site_name,
            'logo_url' => $setting->logo_url,
            'logo_alt' => $setting->logo_alt,
            'header_nav' => $setting->header_nav ?? [],
            'footer_columns' => $setting->footer_columns ?? [],
            'footer_bottom' => $setting->footer_bottom,
            'hero' => $setting->hero ?? [],
            'main_banners' => $setting->main_banners ?? [],
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
            Section::make('Site & Logo')
                ->schema([
                    TextInput::make('site_name')
                        ->label('Site name')
                        ->required()
                        ->maxLength(255),
                    FileUpload::make('logo_url')
                        ->label('Logo image')
                        ->image()
                        ->directory('homepage')
                        ->visibility('public')
                        ->maxSize(1024)
                        ->helperText('Upload logo; stored path will be used as logo URL.'),
                    TextInput::make('logo_alt')
                        ->label('Logo alt text')
                        ->maxLength(255),
                ])
                ->columns(1),

            Section::make('Header menu')
                ->description('Navigation links shown in the header.')
                ->schema([
                    Repeater::make('header_nav')
                        ->label('Menu items')
                        ->schema([
                            TextInput::make('label')->label('Label')->required()->maxLength(255),
                            TextInput::make('href')->label('URL / path')->required()->maxLength(500),
                            \Filament\Forms\Components\Toggle::make('external')->label('Open in new tab')->default(false),
                        ])
                        ->columns(3)
                        ->defaultItems(0)
                        ->addActionLabel('Add menu item'),
                ]),

            Section::make('Footer')
                ->schema([
                    Repeater::make('footer_columns')
                        ->label('Footer columns')
                        ->schema([
                            TextInput::make('heading')->label('Column heading')->required()->maxLength(255),
                            Repeater::make('links')
                                ->label('Links')
                                ->schema([
                                    TextInput::make('label')->label('Label')->required()->maxLength(255),
                                    TextInput::make('href')->label('URL')->required()->maxLength(500),
                                    \Filament\Forms\Components\Toggle::make('external')->label('External')->default(false),
                                ])
                                ->columns(3)
                                ->defaultItems(0)
                                ->addActionLabel('Add link'),
                        ])
                        ->columns(1)
                        ->defaultItems(0)
                        ->addActionLabel('Add column'),
                    Textarea::make('footer_bottom')
                        ->label('Footer bottom text (e.g. copyright)')
                        ->rows(2)
                        ->maxLength(1000),
                ]),

            Section::make('Hero section')
                ->schema([
                    TextInput::make('hero.headline')->label('Headline')->required()->maxLength(255),
                    Textarea::make('hero.subheadline')->label('Subheadline')->rows(3)->maxLength(1000),
                    TextInput::make('hero.ctaText')->label('CTA button text')->maxLength(255),
                    TextInput::make('hero.ctaHref')->label('CTA button URL')->maxLength(500),
                    FileUpload::make('hero.backgroundImageUrl')
                        ->label('Hero background image')
                        ->image()
                        ->directory('homepage/hero')
                        ->visibility('public')
                        ->maxSize(2048),
                    TextInput::make('hero.overlayOpacity')
                        ->label('Overlay opacity (0–1)')
                        ->numeric()->minValue(0)->maxValue(1)->step(0.1)->default(0.4),
                ])
                ->columns(1),

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
                            Select::make('variant')->label('Variant')->options(['default' => 'Default', 'reverse' => 'Reverse'])->default('default'),
                        ])
                        ->columns(2)
                        ->defaultItems(0)
                        ->addActionLabel('Add banner'),
                ]),
        ];
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        if (isset($data['hero']) && is_array($data['hero']) && array_is_list($data['hero']) && isset($data['hero'][0])) {
            $data['hero'] = $data['hero'][0];
        }
        if (! empty($data['logo_url'])) {
            $data['logo_url'] = is_array($data['logo_url']) ? ($data['logo_url'][0] ?? null) : $data['logo_url'];
        }
        if (! empty($data['hero']['backgroundImageUrl'])) {
            $bg = $data['hero']['backgroundImageUrl'];
            $data['hero']['backgroundImageUrl'] = is_array($bg) ? ($bg[0] ?? null) : $bg;
        }
        foreach ($data['main_banners'] ?? [] as $i => $banner) {
            if (! empty($banner['imageUrl'])) {
                $img = $banner['imageUrl'];
                $data['main_banners'][$i]['imageUrl'] = is_array($img) ? ($img[0] ?? null) : $img;
            }
            if (empty($data['main_banners'][$i]['id'])) {
                $data['main_banners'][$i]['id'] = (string) Str::uuid();
            }
        }
        return $data;
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
            'hero' => $this->normalizeHero($data['hero'] ?? []),
            'main_banners' => $data['main_banners'] ?? [],
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

    protected function getFormActions(): array
    {
        return [
            \Filament\Actions\Action::make('save')
                ->label('Save changes')
                ->submit('save'),
        ];
    }

    protected function getHeaderActions(): array
    {
        return [
            \Filament\Actions\Action::make('save')
                ->label('Save changes')
                ->submit('save'),
        ];
    }
}