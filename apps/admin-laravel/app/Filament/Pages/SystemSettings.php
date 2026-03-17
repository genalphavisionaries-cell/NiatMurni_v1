<?php

namespace App\Filament\Pages;

use App\Models\Setting;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Actions\Action;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

class SystemSettings extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static ?string $navigationGroup = 'Settings';

    protected static ?string $title = 'System Settings';

    protected static string $view = 'filament.pages.system-settings';

    public ?array $data = [];

    protected static array $settingKeys = [
        'require_attendance',
        'require_exam_pass',
        'auto_issue_certificate',
    ];

    public function mount(): void
    {
        $data = [];
        foreach (self::$settingKeys as $key) {
            $value = Setting::query()->where('key', $key)->value('value');
            $data[$key] = $value === 'true' || $value === '1';
        }
        $this->form->fill($data);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                \Filament\Forms\Components\Section::make('Certificate & Completion Rules')
                    ->description('Control whether attendance and exam are required before completion and certificate issuance.')
                    ->schema([
                        \Filament\Forms\Components\Toggle::make('require_attendance')
                            ->label('Require attendance (present) before completing a booking')
                            ->helperText('Booking completion will be blocked unless attendance status is "present".'),
                        \Filament\Forms\Components\Toggle::make('require_exam_pass')
                            ->label('Require exam passed before completing a booking')
                            ->helperText('Booking completion will be blocked unless exam is marked as passed.'),
                        \Filament\Forms\Components\Toggle::make('auto_issue_certificate')
                            ->label('Auto-issue certificate on completion')
                            ->helperText('When a booking is marked completed, a certificate is issued automatically.'),
                    ])
                    ->columns(1),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        $data = $this->form->getState();

        foreach ($data as $key => $value) {
            Setting::query()->updateOrCreate(
                ['key' => $key],
                ['value' => $value ? 'true' : 'false']
            );
        }

        Notification::make()
            ->title('System settings saved.')
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
