<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use App\Support\AdminModules;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Hash;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $navigationGroup = 'Settings';

    protected static ?int $navigationSort = 10;

    protected static ?string $navigationLabel = 'Users';

    protected static ?string $modelLabel = 'Admin User';

    protected static ?string $pluralModelLabel = 'Admin Users';

    /** Pin the URL slug so it stays /admin/users regardless of label changes. */
    protected static ?string $slug = 'users';

    // ─────────────────────────────────────────────────────────────────────────
    // Access control — only users with the 'users' module may manage this
    // ─────────────────────────────────────────────────────────────────────────

    public static function canViewAny(): bool
    {
        return auth()->user()?->hasModuleAccess(AdminModules::USERS) ?? false;
    }

    public static function canCreate(): bool
    {
        return auth()->user()?->isSuperAdmin() ?? false;
    }

    public static function canEdit(\Illuminate\Database\Eloquent\Model $record): bool
    {
        /** @var User $actor */
        $actor = auth()->user();
        if (!$actor) {
            return false;
        }

        // Super admin can edit anyone; others can only edit themselves.
        return $actor->isSuperAdmin() || $actor->id === $record->id;
    }

    public static function canDelete(\Illuminate\Database\Eloquent\Model $record): bool
    {
        /** @var User $actor */
        $actor = auth()->user();
        if (!$actor || !$actor->isSuperAdmin()) {
            return false;
        }

        // Cannot delete self.
        if ($actor->id === $record->id) {
            return false;
        }

        return true;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Scope: only show admin / staff accounts (not participants via Participant model)
    // ─────────────────────────────────────────────────────────────────────────

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->whereIn('role', ['admin', 'staff', 'tutor']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Form
    // ─────────────────────────────────────────────────────────────────────────

    public static function form(Form $form): Form
    {
        $isSuperAdmin = auth()->user()?->isSuperAdmin() ?? false;

        return $form->schema([
            Forms\Components\Section::make('Account details')
                ->columns(2)
                ->schema([
                    Forms\Components\TextInput::make('name')
                        ->label('Full name')
                        ->required()
                        ->maxLength(255),

                    Forms\Components\TextInput::make('email')
                        ->label('Email address')
                        ->email()
                        ->required()
                        ->maxLength(255)
                        ->unique(User::class, 'email', ignoreRecord: true),

                    Forms\Components\TextInput::make('recovery_email')
                        ->label('Recovery email (optional)')
                        ->email()
                        ->maxLength(255)
                        ->helperText('Secondary email for account recovery.'),

                    Forms\Components\TextInput::make('phone')
                        ->label('Phone number')
                        ->tel()
                        ->maxLength(30),
                ]),

            Forms\Components\Section::make('Password')
                ->columns(2)
                ->description('Leave blank on edit to keep the current password.')
                ->schema([
                    Forms\Components\TextInput::make('password')
                        ->label('Password')
                        ->password()
                        ->revealable()
                        ->minLength(8)
                        ->maxLength(255)
                        ->dehydrated(fn ($state) => filled($state))
                        ->required(fn (string $operation) => $operation === 'create')
                        ->dehydrateStateUsing(fn ($state) => Hash::make($state))
                        ->helperText('Minimum 8 characters.'),

                    Forms\Components\TextInput::make('password_confirmation')
                        ->label('Confirm password')
                        ->password()
                        ->revealable()
                        ->same('password')
                        ->dehydrated(false)
                        ->required(fn (string $operation) => $operation === 'create'),
                ]),

            Forms\Components\Section::make('Role & status')
                ->columns(2)
                ->description('Role determines default module access. You can override with explicit module assignments below.')
                ->schema([
                    Forms\Components\Select::make('role')
                        ->label('Account type')
                        ->options([
                            'admin' => 'Admin',
                            'staff' => 'Staff',
                            'tutor' => 'Tutor / Trainer',
                        ])
                        ->required()
                        ->native(false)
                        ->helperText('Determines whether this account can access the admin panel.')
                        ->disabled(!$isSuperAdmin),

                    Forms\Components\Select::make('admin_role')
                        ->label('Admin role')
                        ->options(User::adminRoleLabels())
                        ->nullable()
                        ->native(false)
                        ->helperText('Fine-grained role for module access defaults.')
                        ->disabled(!$isSuperAdmin),

                    Forms\Components\Toggle::make('is_active')
                        ->label('Account active')
                        ->helperText('Inactive accounts cannot log in to the admin panel.')
                        ->disabled(!$isSuperAdmin)
                        ->default(true),

                    Forms\Components\Placeholder::make('email_verified_at')
                        ->label('Email verified')
                        ->content(fn ($record) => $record?->email_verified_at
                            ? '✓ Verified on ' . $record->email_verified_at->format('d M Y, H:i')
                            : '✗ Not verified'),

                    Forms\Components\Placeholder::make('last_login_at')
                        ->label('Last login')
                        ->content(fn ($record) => $record?->last_login_at
                            ? $record->last_login_at->diffForHumans() . ' (' . $record->last_login_at->format('d M Y, H:i') . ')'
                            : 'Never'),
                ]),

            Forms\Components\Section::make('Module access')
                ->description(
                    'Check the modules this admin can access. Leave all unchecked to use the role\'s default access. '
                    . 'Super Admins always have full access regardless of this list.'
                )
                ->schema([
                    Forms\Components\CheckboxList::make('module_access')
                        ->label('Allowed modules')
                        ->options(AdminModules::labels())
                        ->columns(3)
                        ->gridDirection('row')
                        ->helperText('If nothing is checked, access defaults to the assigned admin role\'s built-in module list.')
                        ->disabled(!$isSuperAdmin),
                ])
                ->hidden(!$isSuperAdmin),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Table
    // ─────────────────────────────────────────────────────────────────────────

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Name')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('email')
                    ->label('Email')
                    ->searchable()
                    ->copyable(),

                Tables\Columns\TextColumn::make('admin_role')
                    ->label('Admin role')
                    ->formatStateUsing(fn ($state) => User::adminRoleLabels()[$state] ?? ucfirst((string) $state))
                    ->placeholder('—')
                    ->badge()
                    ->color(fn ($state) => match ($state) {
                        'super_admin'      => 'danger',
                        'finance_admin'    => 'warning',
                        'operations_admin' => 'info',
                        'accountant'       => 'gray',
                        'cms_admin'        => 'success',
                        default            => 'gray',
                    }),

                Tables\Columns\IconColumn::make('is_active')
                    ->label('Active')
                    ->boolean()
                    ->sortable(),

                Tables\Columns\IconColumn::make('email_verified_at')
                    ->label('Verified')
                    ->boolean()
                    ->getStateUsing(fn ($record) => $record->email_verified_at !== null)
                    ->trueIcon('heroicon-o-check-badge')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger'),

                Tables\Columns\TextColumn::make('last_login_at')
                    ->label('Last login')
                    ->dateTime('d M Y, H:i')
                    ->sortable()
                    ->placeholder('Never'),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Created')
                    ->dateTime('d M Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('admin_role')
                    ->label('Admin role')
                    ->options(User::adminRoleLabels()),

                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Status')
                    ->trueLabel('Active only')
                    ->falseLabel('Inactive only')
                    ->placeholder('All'),

                Tables\Filters\TernaryFilter::make('email_verified')
                    ->label('Verified')
                    ->query(fn (Builder $q, $value) => $value === true
                        ? $q->whereNotNull('email_verified_at')
                        : ($value === false ? $q->whereNull('email_verified_at') : $q)
                    ),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),

                // Reset password — super admin only
                Tables\Actions\Action::make('resetPassword')
                    ->label('Reset password')
                    ->icon('heroicon-o-key')
                    ->color('warning')
                    ->requiresConfirmation(false)
                    ->form([
                        Forms\Components\TextInput::make('new_password')
                            ->label('New password')
                            ->password()
                            ->revealable()
                            ->required()
                            ->minLength(8)
                            ->maxLength(255),
                        Forms\Components\TextInput::make('new_password_confirmation')
                            ->label('Confirm new password')
                            ->password()
                            ->revealable()
                            ->required()
                            ->same('new_password'),
                    ])
                    ->action(function (User $record, array $data): void {
                        $record->update(['password' => Hash::make($data['new_password'])]);

                        Notification::make()
                            ->title('Password reset for ' . $record->name . '.')
                            ->success()
                            ->send();
                    })
                    ->modalHeading(fn (User $record) => 'Reset password — ' . $record->name)
                    ->modalSubmitActionLabel('Reset password')
                    ->visible(fn () => auth()->user()?->isSuperAdmin()),

                // Toggle active/inactive — super admin only (with safety checks)
                Tables\Actions\Action::make('toggleActive')
                    ->label(fn (User $record) => $record->is_active ? 'Deactivate' : 'Activate')
                    ->icon(fn (User $record) => $record->is_active
                        ? 'heroicon-o-x-circle'
                        : 'heroicon-o-check-circle')
                    ->color(fn (User $record) => $record->is_active ? 'danger' : 'success')
                    ->requiresConfirmation()
                    ->modalHeading(fn (User $record) => $record->is_active
                        ? 'Deactivate ' . $record->name . '?'
                        : 'Activate ' . $record->name . '?')
                    ->modalDescription(fn (User $record) => $record->is_active
                        ? 'This account will no longer be able to log in to the admin panel.'
                        : 'This account will be able to log in to the admin panel again.')
                    ->action(function (User $record): void {
                        /** @var User $actor */
                        $actor = auth()->user();

                        // Prevent deactivating self.
                        if ($actor->id === $record->id) {
                            Notification::make()
                                ->title('You cannot deactivate your own account.')
                                ->danger()
                                ->send();
                            return;
                        }

                        // Prevent removing the last active Super Admin.
                        if ($record->admin_role === 'super_admin' && $record->is_active) {
                            $count = User::where('admin_role', 'super_admin')
                                ->where('is_active', true)
                                ->count();
                            if ($count <= 1) {
                                Notification::make()
                                    ->title('Cannot deactivate the only active Super Admin.')
                                    ->body('Promote another user to Super Admin first.')
                                    ->danger()
                                    ->send();
                                return;
                            }
                        }

                        $record->update(['is_active' => !$record->is_active]);

                        Notification::make()
                            ->title($record->is_active ? 'Account activated.' : 'Account deactivated.')
                            ->success()
                            ->send();
                    })
                    ->visible(fn (User $record) => auth()->user()?->isSuperAdmin()
                        && auth()->id() !== $record->id),

                Tables\Actions\DeleteAction::make()
                    ->visible(fn (User $record) => auth()->user()?->isSuperAdmin()
                        && auth()->id() !== $record->id),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make()
                        ->visible(fn () => auth()->user()?->isSuperAdmin()),
                ]),
            ])
            ->defaultSort('name');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Pages
    // ─────────────────────────────────────────────────────────────────────────

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit'   => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
