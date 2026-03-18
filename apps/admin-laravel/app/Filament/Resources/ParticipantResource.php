<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ParticipantResource\Pages;
use App\Models\Participant;
use App\Services\ParticipantPortalAccessService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Notifications\Notification;

class ParticipantResource extends Resource
{
    protected static ?string $model = Participant::class;

    protected static ?string $navigationIcon = 'heroicon-o-user-group';

    protected static ?string $navigationGroup = 'Catalog';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('full_name')->required()->maxLength(255),
                Forms\Components\TextInput::make('nric_passport')
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->maxLength(255),
                Forms\Components\TextInput::make('phone')->tel()->maxLength(50),
                Forms\Components\TextInput::make('email')->email()->maxLength(255),
                Forms\Components\Select::make('employer_id')
                    ->relationship('employer', 'name')
                    ->searchable()
                    ->preload(),
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name', fn ($query) => $query->where('role', 'participant'))
                    ->searchable()
                    ->preload()
                    ->helperText('Linked portal account (role=participant). Use "Create portal access" action to create/link.'),
                Forms\Components\TextInput::make('nationality')->maxLength(100),
                Forms\Components\DatePicker::make('date_of_birth'),
                Forms\Components\TextInput::make('gender')->maxLength(20),
                Forms\Components\Toggle::make('is_blacklisted')->default(false),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('full_name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('nric_passport')->searchable(),
                Tables\Columns\TextColumn::make('email')->searchable(),
                Tables\Columns\TextColumn::make('user_id')
                    ->label('Portal access')
                    ->badge()
                    ->formatStateUsing(function ($state, Participant $record): string {
                        if (! $record->user_id) {
                            return 'No';
                        }
                        $user = $record->user;
                        return $user ? 'Linked (' . $user->email . ')' : 'Linked (user missing)';
                    })
                    ->color(fn ($state): string => $state ? 'success' : 'gray')
                    ->placeholder('No'),
                Tables\Columns\TextColumn::make('employer.name')->placeholder('—'),
                Tables\Columns\IconColumn::make('is_blacklisted')->boolean(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_blacklisted'),
                Tables\Filters\TernaryFilter::make('portal_linked')
                    ->label('Portal linked')
                    ->queries(
                        true: fn ($q) => $q->whereNotNull('user_id'),
                        false: fn ($q) => $q->whereNull('user_id'),
                    ),
            ])
            ->actions([
                Tables\Actions\Action::make('create_portal_access')
                    ->label('Create portal access')
                    ->icon('heroicon-o-key')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalHeading('Create participant portal access?')
                    ->modalDescription(fn (Participant $record): string => $record->user_id
                        ? 'This participant is already linked. You will see a confirmation message.'
                        : ($record->email
                            ? "A login account will be created for {$record->email} with a temporary password. Copy the password and share it with the participant."
                            : 'This participant has no email. Add an email first, then run this action.'))
                    ->action(function (Participant $record, ParticipantPortalAccessService $service): void {
                        $result = $service->createOrLinkAccess($record);
                        if ($result['success']) {
                            $body = $result['message'];
                            if (isset($result['temporary_password'])) {
                                $body .= ' Temporary password: ' . $result['temporary_password'] . ' (copy and share securely).';
                            }
                            Notification::make()
                                ->title('Portal access')
                                ->body($body)
                                ->success()
                                ->send();
                        } else {
                            Notification::make()
                                ->title('Cannot create portal access')
                                ->body($result['message'])
                                ->danger()
                                ->send();
                        }
                    }),
                Tables\Actions\Action::make('reset_portal_password')
                    ->label('Reset portal password')
                    ->icon('heroicon-o-arrow-path')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->modalHeading('Reset participant portal password?')
                    ->modalDescription('A new temporary password will be generated. Share it with the participant; they can use it to log in at /participant/login.')
                    ->visible(fn (Participant $record): bool => (bool) $record->user_id)
                    ->action(function (Participant $record, ParticipantPortalAccessService $service): void {
                        $result = $service->resetPassword($record);
                        if ($result['success']) {
                            $body = $result['message'];
                            if (isset($result['temporary_password'])) {
                                $body .= ' New temporary password: ' . $result['temporary_password'] . ' (copy and share securely).';
                            }
                            Notification::make()
                                ->title('Password reset')
                                ->body($body)
                                ->success()
                                ->send();
                        } else {
                            Notification::make()
                                ->title('Reset failed')
                                ->body($result['message'])
                                ->danger()
                                ->send();
                        }
                    }),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListParticipants::route('/'),
            'create' => Pages\CreateParticipant::route('/create'),
            'edit' => Pages\EditParticipant::route('/{record}/edit'),
        ];
    }
}
