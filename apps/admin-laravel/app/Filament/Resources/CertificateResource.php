<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CertificateResource\Pages;
use App\Models\AuditLog;
use App\Models\Certificate;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables\Actions\Action;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class CertificateResource extends Resource
{
    protected static ?string $model = Certificate::class;

    protected static ?string $navigationIcon = 'heroicon-o-academic-cap';

    protected static ?string $modelLabel = 'Certificate';

    protected static ?string $navigationGroup = 'Operations';

    public static function getEloquentQuery(): Builder
    {
        $q = parent::getEloquentQuery();
        $user = auth()->user();
        if ($user && $user->isTrainer()) {
            $q->whereHas('booking', fn ($q) => $q->whereHas('classSession', fn ($q2) => $q2->where('trainer_id', $user->id)));
        }
        return $q;
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                \Filament\Infolists\Components\TextEntry::make('certificate_number'),
                \Filament\Infolists\Components\TextEntry::make('qr_token'),
                \Filament\Infolists\Components\TextEntry::make('status'),
                \Filament\Infolists\Components\TextEntry::make('issued_at')->dateTime(),
                \Filament\Infolists\Components\TextEntry::make('booking.participant.full_name'),
                \Filament\Infolists\Components\TextEntry::make('booking.classSession.program.name'),
                \Filament\Infolists\Components\TextEntry::make('revoked_at')->dateTime()->placeholder('—'),
                \Filament\Infolists\Components\TextEntry::make('revoked_reason')->placeholder('—'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                \Filament\Tables\Columns\TextColumn::make('certificate_number'),
                \Filament\Tables\Columns\TextColumn::make('booking.participant.full_name'),
                \Filament\Tables\Columns\TextColumn::make('booking.classSession.program.name'),
                \Filament\Tables\Columns\TextColumn::make('status')->badge(),
                \Filament\Tables\Columns\TextColumn::make('issued_at')->dateTime(),
                \Filament\Tables\Columns\TextColumn::make('revoked_at')->dateTime()->placeholder('—'),
            ])
            ->filters([])
            ->actions([
                \Filament\Tables\Actions\ViewAction::make(),
                Action::make('revoke')
                    ->label('Revoke')
                    ->icon('heroicon-o-no-symbol')
                    ->color('danger')
                    ->visible(fn (Certificate $record): bool => $record->status === 'valid' && (auth()->user()?->isAdmin() ?? false))
                    ->form([
                        \Filament\Forms\Components\Textarea::make('reason')->label('Reason (required for audit)')->required()->rows(3),
                    ])
                    ->action(function (Certificate $record, array $data): void {
                        $oldStatus = $record->status;
                        $record->update([
                            'status' => 'revoked',
                            'revoked_at' => now(),
                            'revoked_reason' => $data['reason'],
                            'revoked_by' => Auth::id(),
                        ]);
                        AuditLog::create([
                            'user_id' => Auth::id(),
                            'action' => 'certificate.revoke',
                            'entity_type' => 'certificate',
                            'entity_id' => $record->id,
                            'reason' => $data['reason'],
                            'old_values' => ['status' => $oldStatus],
                            'new_values' => ['status' => 'revoked'],
                        ]);
                    }),
            ])
            ->bulkActions([]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCertificates::route('/'),
            'view' => Pages\ViewCertificate::route('/{record}'),
        ];
    }
}
