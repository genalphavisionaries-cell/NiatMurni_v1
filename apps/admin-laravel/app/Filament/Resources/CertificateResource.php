<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CertificateResource\Pages;
use App\Models\Certificate;
use App\Services\CertificatePdfService;
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
                Forms\Components\TextInput::make('qr_code')->maxLength(255),
                Forms\Components\DateTimePicker::make('issued_at'),
                Forms\Components\TextInput::make('pdf_path')->maxLength(255),
                Forms\Components\Select::make('status')
                    ->options(['issued' => 'Issued', 'revoked' => 'Revoked'])
                    ->default('issued'),
                Forms\Components\DateTimePicker::make('revoked_at'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('certificate_number')->searchable(),
                Tables\Columns\TextColumn::make('booking.participant.full_name')->label('Participant'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => $state === 'revoked' ? 'danger' : 'success'),
                Tables\Columns\TextColumn::make('issued_at')->dateTime()->placeholder('—'),
                Tables\Columns\TextColumn::make('revoked_at')->dateTime()->placeholder('—'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['issued' => 'Issued', 'revoked' => 'Revoked']),
            ])
            ->actions([
                Tables\Actions\Action::make('revoke')
                    ->label('Revoke Certificate')
                    ->icon('heroicon-o-no-symbol')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->visible(fn (Certificate $record): bool => ($record->status ?? 'issued') !== 'revoked')
                    ->action(function (Certificate $record): void {
                        $record->update([
                            'status' => 'revoked',
                            'revoked_at' => now(),
                        ]);
                        \Filament\Notifications\Notification::make()
                            ->title('Certificate revoked.')
                            ->success()
                            ->send();
                    }),
                Tables\Actions\Action::make('reissue')
                    ->label('Reissue Certificate')
                    ->icon('heroicon-o-arrow-path')
                    ->visible(fn (Certificate $record): bool => ($record->status ?? 'issued') !== 'revoked')
                    ->action(function (Certificate $record, CertificatePdfService $pdfService): void {
                        $pdfService->generatePdf($record->fresh());
                        \Filament\Notifications\Notification::make()
                            ->title('Certificate PDF regenerated.')
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
