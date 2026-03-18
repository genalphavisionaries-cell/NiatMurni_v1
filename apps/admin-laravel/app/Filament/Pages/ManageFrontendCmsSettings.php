<?php

namespace App\Filament\Pages;

use App\Models\Setting;
use App\Support\FrontendCmsSettingKeys;
use Filament\Actions\Action;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

class ManageFrontendCmsSettings extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-paint-brush';

    protected static ?string $navigationGroup = 'CMS';

    protected static ?int $navigationSort = 1;

    protected static ?string $navigationLabel = 'Website settings';

    protected static ?string $title = 'Website & theme settings';

    protected static string $view = 'filament.pages.manage-frontend-cms-settings';

    public ?array $data = [];

    public function mount(): void
    {
        $filled = [];
        foreach (array_keys(FrontendCmsSettingKeys::all()) as $key) {
            $filled[$key] = Setting::query()->where('key', $key)->value('value') ?? '';
        }
        $this->form->fill($filled);
    }

    public function form(Form $form): Form
    {
        $imageHelper = 'Paste a full image URL (e.g. from Cloudinary).';

        return $form
            ->schema([
                Section::make('Site identity')
                    ->description('Name, tagline, and images shown on the public website.')
                    ->schema([
                        TextInput::make(FrontendCmsSettingKeys::SITE_NAME)
                            ->label('Site name')
                            ->maxLength(255),
                        TextInput::make(FrontendCmsSettingKeys::SITE_TAGLINE)
                            ->label('Site tagline')
                            ->maxLength(255)
                            ->helperText('Short line under or near the site name.'),
                        TextInput::make(FrontendCmsSettingKeys::LOGO_URL)
                            ->label('Logo URL')
                            ->maxLength(2048)
                            ->helperText($imageHelper),
                        TextInput::make(FrontendCmsSettingKeys::FAVICON_URL)
                            ->label('Favicon URL')
                            ->maxLength(2048)
                            ->helperText($imageHelper),
                        TextInput::make(FrontendCmsSettingKeys::PRIMARY_CTA_LABEL)
                            ->label('Header CTA button label')
                            ->maxLength(100),
                        TextInput::make(FrontendCmsSettingKeys::PRIMARY_CTA_URL)
                            ->label('Header CTA link')
                            ->maxLength(2048)
                            ->helperText('Full URL or relative path (e.g. /#classes, https://…).'),
                    ])
                    ->columns(2),

                Section::make('Theme & brand colors')
                    ->description('Colours used when the public site reads these settings (hex values).')
                    ->schema([
                        ColorPicker::make(FrontendCmsSettingKeys::THEME_PRIMARY_COLOR)
                            ->label('Primary brand colour'),
                        ColorPicker::make(FrontendCmsSettingKeys::THEME_SECONDARY_COLOR)
                            ->label('Secondary colour'),
                        ColorPicker::make(FrontendCmsSettingKeys::THEME_ACCENT_COLOR)
                            ->label('Accent colour'),
                        ColorPicker::make(FrontendCmsSettingKeys::THEME_BACKGROUND_COLOR)
                            ->label('Page background'),
                        ColorPicker::make(FrontendCmsSettingKeys::THEME_TEXT_COLOR)
                            ->label('Body text'),
                        ColorPicker::make(FrontendCmsSettingKeys::THEME_HEADER_BACKGROUND_COLOR)
                            ->label('Header background'),
                        ColorPicker::make(FrontendCmsSettingKeys::THEME_FOOTER_BACKGROUND_COLOR)
                            ->label('Footer background'),
                    ])
                    ->columns(2),

                Section::make('SEO')
                    ->description('Titles and descriptions for search engines and social sharing.')
                    ->schema([
                        TextInput::make(FrontendCmsSettingKeys::SEO_HOMEPAGE_TITLE)
                            ->label('Homepage SEO title')
                            ->maxLength(255),
                        Textarea::make(FrontendCmsSettingKeys::SEO_HOMEPAGE_DESCRIPTION)
                            ->label('Homepage meta description')
                            ->rows(3)
                            ->maxLength(500),
                        TextInput::make(FrontendCmsSettingKeys::SEO_HOMEPAGE_OG_IMAGE_URL)
                            ->label('Homepage social share image URL')
                            ->maxLength(2048)
                            ->helperText($imageHelper . ' Used when the homepage is shared (e.g. Open Graph).'),
                        TextInput::make(FrontendCmsSettingKeys::SEO_DEFAULT_TITLE)
                            ->label('Default site title (other pages)')
                            ->maxLength(255)
                            ->helperText('Fallback browser title when a page does not set its own.'),
                        Textarea::make(FrontendCmsSettingKeys::SEO_DEFAULT_DESCRIPTION)
                            ->label('Default meta description')
                            ->rows(3)
                            ->maxLength(500),
                    ])
                    ->columns(1),

                Section::make('Footer & contact')
                    ->description('Text shown in the website footer and how visitors can reach you.')
                    ->schema([
                        Textarea::make(FrontendCmsSettingKeys::FOOTER_DESCRIPTION)
                            ->label('Footer intro text')
                            ->rows(4)
                            ->maxLength(2000)
                            ->helperText('Short paragraph beside your logo in the footer.'),
                        Textarea::make(FrontendCmsSettingKeys::FOOTER_BOTTOM_TEXT)
                            ->label('Copyright / bottom line')
                            ->rows(2)
                            ->maxLength(500)
                            ->helperText('e.g. © 2026 Your Academy. All rights reserved. Leave blank to use a simple default.'),
                        TextInput::make(FrontendCmsSettingKeys::CONTACT_EMAIL)
                            ->label('Contact email')
                            ->maxLength(255)
                            ->helperText('Shown in the footer and contact section.'),
                        TextInput::make(FrontendCmsSettingKeys::CONTACT_PHONE)
                            ->label('Contact phone')
                            ->maxLength(100),
                        Textarea::make(FrontendCmsSettingKeys::CONTACT_ADDRESS)
                            ->label('Address (optional)')
                            ->rows(3)
                            ->maxLength(500),
                        TextInput::make(FrontendCmsSettingKeys::SOCIAL_FACEBOOK_URL)
                            ->label('Facebook page URL')
                            ->maxLength(2048)
                            ->helperText('Full https:// link to your page.'),
                        TextInput::make(FrontendCmsSettingKeys::SOCIAL_INSTAGRAM_URL)
                            ->label('Instagram URL')
                            ->maxLength(2048),
                        TextInput::make(FrontendCmsSettingKeys::SOCIAL_LINKEDIN_URL)
                            ->label('LinkedIn URL')
                            ->maxLength(2048),
                    ])
                    ->columns(1),

                Section::make('Footer payment & trust')
                    ->description('Optional: the white “payment / SSL” card on the wide footer layout. Legal and login links are managed under CMS → Navigation.')
                    ->schema([
                        Select::make(FrontendCmsSettingKeys::FOOTER_SHOW_PAYMENT_CARD)
                            ->label('Show payment & trust card')
                            ->options([
                                '' => 'Yes (default)',
                                '1' => 'Yes',
                                '0' => 'No — hide the card',
                            ])
                            ->native(false),
                        TextInput::make(FrontendCmsSettingKeys::FOOTER_PAYMENT_HEADLINE)
                            ->label('Card headline')
                            ->maxLength(255)
                            ->helperText('Leave blank to use the default safe-payment line.'),
                        TextInput::make(FrontendCmsSettingKeys::FOOTER_SSL_BADGE_URL)
                            ->label('Trust badge image URL')
                            ->maxLength(2048)
                            ->helperText('Optional. Shown on the right of the footer strip; falls back to a built-in badge if empty.'),
                        Textarea::make(FrontendCmsSettingKeys::FOOTER_SSL_CAPTION)
                            ->label('Caption under badge')
                            ->rows(2)
                            ->maxLength(300)
                            ->helperText('e.g. Website secured with SSL encryption.'),
                    ])
                    ->columns(1),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        $data = $this->form->getState();

        foreach (array_keys(FrontendCmsSettingKeys::all()) as $key) {
            $value = $data[$key] ?? '';
            if (is_array($value)) {
                $value = json_encode($value);
            }
            Setting::query()->updateOrCreate(
                ['key' => $key],
                ['value' => (string) $value]
            );
        }

        Notification::make()
            ->title('Website settings saved')
            ->success()
            ->send();
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('save')
                ->label('Save settings')
                ->action('save'),
        ];
    }
}
