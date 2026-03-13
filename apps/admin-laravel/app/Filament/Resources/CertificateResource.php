<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CertificateResource\Pages;
use App\Models\AuditLog;
use App\Models\Certificate;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class CertificateResource extends Resource
{
    protected static ?string $model = Certificate::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-check';

    protected static ?string $navigationGroup = 'Operations';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('booking_id')
                    ->relationship('booking')
                    ->getOptionLabelFromRecordUsing(fn ($record) => 'Booking #' . $record->id . ' — ' . ($record->participant?->full_name ?? ''))
                    ->required()
                    ->searchable()
                    ->preload(),
                Forms\Components\TextInput::make('certificate_number')->required()->maxLength(255),
                Forms\Components\TextInput::make('qr_token')->required()->maxLength(255),
                Forms\Components\Select::make('status')
                    ->options(['valid' => 'Valid', 'revoked' => 'Revoked'])
                    ->required(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('certificate_number')->searchable(),
                Tables\Columns\TextColumn::make('booking.participant.full_name')->label('Participant'),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\TextColumn::make('issued_at')->dateTime()->placeholder('—'),
                Tables\Columns\TextColumn::make('revoked_at')->dateTime()->placeholder('—'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['valid' => 'Valid', 'revoked' => 'Revoked']),
            ])
            ->actions([
                Tables\Actions\Action::make('revoke')
                    ->label('Revoke')
                    ->icon('heroicon-o-no-symbol')
                    ->color('danger')
                    ->visible(fn (Certificate $record) => $record->status === 'valid' && auth()->user()?->isAdmin())
                    ->form([
                        Forms\Components\Textarea::make('reason')
                            ->label('Reason (required for audit)')
                            ->required()
                            ->rows(3),
                    ])
                    ->action(function (Certificate $record, array $data): void {
                        AuditLog::create([
                            'user_id' => auth()->id(),
                            'action' => 'certificate_revoked',
                            'entity_type' => 'certificate',
                            'entity_id' => $record->id,
                            'reason' => $data['reason'],
                            'old_values' => ['status' => $record->status],
                            'new_values' => ['status' => 'revoked'],
                        ]);
                        $record->update([
                            'status' => 'revoked',
                            'revoked_at' => now(),
                            'revoked_reason' => $data['reason'],
                            'revoked_by' => auth()->id(),
                        ]);
                        \Filament\Notifications\Notification::make()
                            ->title('Certificate revoked (audit logged)')
                            ->success()
                            ->send();
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
            'index' => Pages\ListCertificates::route('/'),
            'edit' => Pages\EditCertificate::route('/{record}/edit'),
        ];
    }
}
