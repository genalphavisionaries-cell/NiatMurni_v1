<?php

namespace App\Filament\Pages;

use App\Filament\Concerns\EnforcesModuleAccessPage;
use App\Models\User;
use App\Services\SettingService;
use App\Support\AdminModules;
use Filament\Actions\Action;
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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

/**
 * Settings → System. Stored as `settings.group` + `settings.key` (see config/system_settings.php).
 */
class SystemSettings extends Page implements HasForms
{
    use EnforcesModuleAccessPage;
    use InteractsWithForms;

    protected static string $requiredModule = AdminModules::SETTINGS;

    protected static ?string $navigationIcon = 'heroicon-o-cog-8-tooth';

    protected static ?string $navigationGroup = 'Settings';

    protected static ?string $navigationLabel = 'System Settings';

    protected static ?int $navigationSort = 6;

    protected static ?string $title = 'System Settings';

    protected static string $view = 'filament.pages.system-settings';

    public ?array $data = [];

    /** Tab id => Heroicon name */
    private const TAB_ICONS = [
        'general' => 'heroicon-o-building-office-2',
        'security' => 'heroicon-o-shield-check',
        'class_booking' => 'heroicon-o-academic-cap',
        'payment_finance' => 'heroicon-o-banknotes',
        'certificate' => 'heroicon-o-identification',
        'email_delivery' => 'heroicon-o-envelope',
    ];

    public function mount(): void
    {
        $this->loadFormFromDatabase();
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Tabs::make('systemSettings')
                    ->persistTabInQueryString()
                    ->tabs($this->buildTabs())
                    ->columnSpanFull(),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        /** @var array<string, mixed> $data */
        $data = $this->form->getState();

        $rules = [];
        $attributes = [];
        foreach ($this->eachFieldMeta() as $meta) {
            ['group' => $group, 'key' => $key, 'def' => $def] = $meta;
            $flat = $this->flatName($group, $key);
            if (! empty($def['rules'])) {
                $rules[$flat] = $def['rules'];
            }
            $attributes[$flat] = $def['label'] ?? $key;
        }

        Validator::make($data, $rules, [], $attributes)->validate();

        /** @var SettingService $svc */
        $svc = app(SettingService::class);
        $uid = auth()->id();

        DB::transaction(function () use ($data, $svc, $uid) {
            foreach ($this->eachFieldMeta() as $meta) {
                ['group' => $group, 'key' => $key, 'def' => $def] = $meta;
                $flat = $this->flatName($group, $key);
                if (! array_key_exists($flat, $data)) {
                    continue;
                }
                $raw = $data[$flat];
                $encrypt = $def['encrypt'] ?? false;
                if ($encrypt && ($raw === null || $raw === '')) {
                    continue;
                }
                $value = $this->normalizeForStorage($def, $raw);
                $svc->set($group, $key, $value, $encrypt, $uid);
            }

            if (in_array('class_booking', $this->visibleTabIds(), true)) {
                $this->mirrorLegacyCertificateKeys($svc, $data, $uid);
            }
        });

        Notification::make()
            ->title('All settings saved')
            ->body('Your changes were applied in one transaction.')
            ->success()
            ->send();

        $this->loadFormFromDatabase();
    }

    public function sendTestEmail(): void
    {
        Notification::make()
            ->title('Test email (preview)')
            ->body('This action is not wired to your mail transport yet. Configure SMTP below, then connect this button to a queued Mailable.')
            ->info()
            ->send();
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('sendTestEmail')
                ->label('Send test email')
                ->icon('heroicon-o-paper-airplane')
                ->color('gray')
                ->action(fn () => $this->sendTestEmail())
                ->visible(fn () => $this->user()?->hasModuleAccess(AdminModules::SETTINGS) ?? false),
            Action::make('save')
                ->label('Save all settings')
                ->icon('heroicon-o-check')
                ->action(fn () => $this->save()),
        ];
    }

    /**
     * @return array<int, Tab>
     */
    private function buildTabs(): array
    {
        $out = [];
        foreach ($this->visibleTabIds() as $tabId) {
            $tabConfig = config('system_settings.tabs.'.$tabId);
            if (! is_array($tabConfig)) {
                continue;
            }
            $sections = [];
            foreach ($tabConfig['sections'] as $sectionLabel => $fields) {
                $sections[] = Section::make($sectionLabel)
                    ->schema($this->buildFields((string) $tabConfig['group'], $fields))
                    ->columns(2)
                    ->collapsible();
            }

            $out[] = Tab::make($tabConfig['label'])
                ->icon(self::TAB_ICONS[$tabId] ?? 'heroicon-o-cog-6-tooth')
                ->schema($sections);
        }

        return $out;
    }

    /**
     * @param  array<string, array<string, mixed>>  $fields
     * @return array<int, mixed>
     */
    private function buildFields(string $group, array $fields): array
    {
        $components = [];
        foreach ($fields as $key => $meta) {
            $components[] = $this->buildOneField($group, (string) $key, $meta);
        }

        return $components;
    }

    /**
     * @param  array<string, mixed>  $meta
     */
    private function buildOneField(string $group, string $key, array $meta): mixed
    {
        $name = $this->flatName($group, $key);
        $type = $meta['type'] ?? 'text';
        $label = $meta['label'] ?? $key;
        $helper = $meta['helper'] ?? null;

        if ($type === 'password') {
            return TextInput::make($name)
                ->label($label)
                ->password()
                ->revealable()
                ->maxLength(2000)
                ->dehydrated(fn ($state) => filled($state))
                ->helperText($helper ?? 'Leave blank to keep the current secret. Saved values are encrypted and never shown again in this form.');
        }

        $component = match ($type) {
            'textarea' => Textarea::make($name)->label($label)->rows(4)->maxLength(4000),
            'toggle' => Toggle::make($name)->label($label)->inline(false),
            'number' => TextInput::make($name)->label($label)->numeric()->integer()->minValue(0),
            'select' => $this->buildSelect($name, $label, $meta),
            default => $this->buildTextInput($name, $label, $key),
        };

        if ($helper !== null && method_exists($component, 'helperText')) {
            $component->helperText($helper);
        }

        return $component;
    }

    private function buildTextInput(string $name, string $label, string $key): TextInput
    {
        $input = TextInput::make($name)->label($label)->maxLength(2000);
        if (str_ends_with($key, '_email')) {
            $input->email();
        }

        return $input;
    }

    /**
     * @param  array<string, mixed>  $meta
     */
    private function buildSelect(string $name, string $label, array $meta): Select
    {
        $opts = $meta['options'] ?? [];
        if (is_string($opts)) {
            $opts = config('system_settings.'.$opts) ?? [];
        }
        if (! is_array($opts)) {
            $opts = [];
        }

        return Select::make($name)
            ->label($label)
            ->options($opts)
            ->searchable()
            ->native(false);
    }

    private function loadFormFromDatabase(): void
    {
        /** @var SettingService $svc */
        $svc = app(SettingService::class);
        $data = [];

        foreach ($this->eachFieldMeta() as $meta) {
            ['group' => $group, 'key' => $key, 'def' => $def] = $meta;
            $flat = $this->flatName($group, $key);
            $stored = $svc->get($group, $key);
            if (($stored === null || $stored === '') && $group === 'class_booking' && $this->isLegacyCertificateField($key)) {
                $stored = $this->legacyCertificateValue($svc, $key);
            }
            if ($stored === null || $stored === '') {
                $stored = $def['default'] ?? null;
            }
            if (($def['encrypt'] ?? false) && $stored !== null && $stored !== '') {
                $stored = '';
            }
            $data[$flat] = $this->formValueFromStored($def, $stored);
        }

        $this->form->fill($data);
    }

    private function isLegacyCertificateField(string $key): bool
    {
        return in_array($key, [
            'attendance_required_for_certificate',
            'exam_required_for_certificate',
            'auto_issue_certificate',
        ], true);
    }

    private function legacyCertificateValue(SettingService $svc, string $key): mixed
    {
        return match ($key) {
            'attendance_required_for_certificate' => $svc->get('system', 'require_attendance') ?? $svc->getByKey('require_attendance'),
            'exam_required_for_certificate' => $svc->get('system', 'require_exam_pass') ?? $svc->getByKey('require_exam_pass'),
            'auto_issue_certificate' => $svc->get('system', 'auto_issue_certificate') ?? $svc->getByKey('auto_issue_certificate'),
            default => null,
        };
    }

    /**
     * @param  array<string, mixed>  $def
     */
    private function formValueFromStored(array $def, mixed $stored): mixed
    {
        $type = $def['type'] ?? 'text';
        if ($type === 'toggle') {
            return $this->boolFromSetting($stored);
        }
        if ($type === 'number') {
            if ($stored === null || $stored === '') {
                return $def['default'] ?? null;
            }

            return (int) $stored;
        }

        return $stored ?? '';
    }

    private function boolFromSetting(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }
        $s = strtolower(trim((string) $value));

        return $s === 'true' || $s === '1';
    }

    /**
     * @param  array<string, mixed>  $def
     */
    private function normalizeForStorage(array $def, mixed $raw): mixed
    {
        $type = $def['type'] ?? 'text';
        if ($type === 'toggle') {
            return (bool) $raw;
        }
        if ($type === 'number') {
            if ($raw === null || $raw === '') {
                return null;
            }

            return (int) $raw;
        }
        if ($type === 'password' || $type === 'text' || $type === 'textarea') {
            return is_string($raw) ? trim($raw) : $raw;
        }

        return $raw;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function mirrorLegacyCertificateKeys(SettingService $svc, array $data, ?int $uid): void
    {
        $att = $this->boolFromSetting($data[$this->flatName('class_booking', 'attendance_required_for_certificate')] ?? false);
        $exam = $this->boolFromSetting($data[$this->flatName('class_booking', 'exam_required_for_certificate')] ?? false);
        $auto = $this->boolFromSetting($data[$this->flatName('class_booking', 'auto_issue_certificate')] ?? false);

        $svc->set('system', 'require_attendance', $att, false, $uid);
        $svc->set('system', 'require_exam_pass', $exam, false, $uid);
        $svc->set('system', 'auto_issue_certificate', $auto, false, $uid);
    }

    private function flatName(string $group, string $key): string
    {
        return $group.'__'.$key;
    }

    /**
     * @return list<string>
     */
    private function visibleTabIds(): array
    {
        $user = $this->user();
        $tabs = config('system_settings.tabs', []);
        $out = [];
        foreach ($tabs as $tabId => $tab) {
            if (! is_array($tab)) {
                continue;
            }
            $v = $tab['visible'] ?? true;
            if ($v === true) {
                $out[] = (string) $tabId;
            } elseif ($v === 'super_admin_only' && $user?->isSuperAdmin()) {
                $out[] = (string) $tabId;
            } elseif ($v === 'finance_or_super' && $user?->canAccessPaymentFinanceSettings()) {
                $out[] = (string) $tabId;
            }
        }

        return $out;
    }

    /**
     * Yields ['group' => string, 'key' => string, 'def' => array].
     *
     * @return \Generator<int, array{group: string, key: string, def: array<string, mixed>}>
     */
    private function eachFieldMeta(): \Generator
    {
        foreach ($this->visibleTabIds() as $tabId) {
            $tab = config('system_settings.tabs.'.$tabId);
            if (! is_array($tab)) {
                continue;
            }
            $group = (string) $tab['group'];
            foreach ($tab['sections'] ?? [] as $fields) {
                if (! is_array($fields)) {
                    continue;
                }
                foreach ($fields as $key => $def) {
                    if (! is_array($def)) {
                        continue;
                    }
                    yield [
                        'group' => $group,
                        'key' => (string) $key,
                        'def' => $def,
                    ];
                }
            }
        }
    }

    private function user(): ?User
    {
        /** @var User|null $u */
        $u = auth()->user();

        return $u;
    }
}
