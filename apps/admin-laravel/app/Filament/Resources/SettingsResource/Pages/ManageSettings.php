<?php

namespace App\Filament\Resources\SettingsResource\Pages;

use App\Filament\Resources\SettingsResource;
use App\Services\SettingService;
use Filament\Actions\Action;
use Filament\Forms;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\Page;

class ManageSettings extends Page implements HasForms
{
    use InteractsWithForms;

    protected static string $resource = SettingsResource::class;

    protected static string $view = 'filament.resources.settings-resource.pages.manage-settings';

    protected static ?string $title = 'Platform settings';

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill($this->loadState());
    }

    public function form(Form $form): Form
    {
        $tabs = [];
        $labels = [
            'system' => 'System',
            'email' => 'Email',
            'security' => 'Security',
            'integrations' => 'Integrations',
            'branding' => 'Branding',
            'feature_flags' => 'Feature flags',
        ];

        foreach (config('platform_settings', []) as $group => $keys) {
            $schema = [];
            foreach ($keys as $key => $meta) {
                $fieldName = $this->flatKey($group, $key);
                $label = $meta['label'] ?? $key;
                $helper = $meta['helper'] ?? null;
                $default = $meta['default'] ?? null;
                $type = $meta['type'] ?? 'text';

                if ($type === 'password') {
                    $schema[] = Forms\Components\TextInput::make($fieldName)
                        ->label($label)
                        ->password()
                        ->revealable()
                        ->helperText($helper ?? 'Leave blank to keep the current value.')
                        ->maxLength(5000)
                        ->default('');
                } elseif ($type === 'toggle') {
                    $schema[] = Forms\Components\Toggle::make($fieldName)
                        ->label($label)
                        ->helperText($helper)
                        ->default((bool) $default);
                } elseif ($type === 'select') {
                    $schema[] = Forms\Components\Select::make($fieldName)
                        ->label($label)
                        ->options($meta['options'] ?? [])
                        ->native(false)
                        ->default($default);
                } elseif ($type === 'color') {
                    $schema[] = ColorPicker::make($fieldName)
                        ->label($label)
                        ->helperText($helper)
                        ->default(is_string($default) ? $default : '#000000');
                } else {
                    $schema[] = Forms\Components\TextInput::make($fieldName)
                        ->label($label)
                        ->helperText($helper)
                        ->default($default)
                        ->maxLength(255);
                }
            }

            $tabs[] = Forms\Components\Tabs\Tab::make($labels[$group] ?? ucfirst($group))
                ->schema([
                    Forms\Components\Section::make()
                        ->schema($schema)
                        ->columns(2),
                ]);
        }

        return $form
            ->schema([
                Forms\Components\Tabs::make('settings_tabs')
                    ->tabs($tabs)
                    ->columnSpanFull(),
            ])
            ->statePath('data');
    }

    protected function getFormActions(): array
    {
        return [
            Action::make('save')
                ->label('Save settings')
                ->submit('save'),
        ];
    }

    public function save(): void
    {
        $state = $this->form->getState();
        /** @var SettingService $svc */
        $svc = app(SettingService::class);

        foreach (config('platform_settings', []) as $group => $keys) {
            foreach ($keys as $key => $meta) {
                $fieldName = $this->flatKey($group, $key);
                $value = $state[$fieldName] ?? null;
                $encrypt = (bool) ($meta['encrypt'] ?? false);
                $type = $meta['type'] ?? 'text';

                if ($type === 'password' && ($value === null || $value === '')) {
                    continue;
                }

                if ($type === 'toggle') {
                    $value = $value ? 'true' : 'false';
                }

                $svc->set($group, $key, $value ?? '', $encrypt);
            }
        }

        $this->form->fill($this->loadState());

        Notification::make()
            ->title('Platform settings saved.')
            ->success()
            ->send();
    }

    /**
     * @return array<string, mixed>
     */
    private function loadState(): array
    {
        /** @var SettingService $svc */
        $svc = app(SettingService::class);
        $out = [];

        foreach (config('platform_settings', []) as $group => $keys) {
            foreach ($keys as $key => $meta) {
                $fieldName = $this->flatKey($group, $key);
                $default = $meta['default'] ?? null;
                $current = $svc->get($group, $key, $default);
                $type = $meta['type'] ?? 'text';

                if ($type === 'password') {
                    $out[$fieldName] = '';
                } elseif ($type === 'toggle') {
                    if (is_bool($current)) {
                        $out[$fieldName] = $current;
                    } else {
                        $out[$fieldName] = in_array(strtolower((string) $current), ['1', 'true', 'yes'], true);
                    }
                } else {
                    $out[$fieldName] = $current ?? '';
                }
            }
        }

        return $out;
    }

    private function flatKey(string $group, string $key): string
    {
        return $group.'__'.$key;
    }
}
