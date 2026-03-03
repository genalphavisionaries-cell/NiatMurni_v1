<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BookingResource\Pages;
use App\Models\AuditLog;
use App\Models\Booking;
use App\Services\StripeService;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Actions\Action;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class BookingResource extends Resource
{
    protected static ?string $model = Booking::class;

    protected static ?string $navigationIcon = 'heroicon-o-ticket';

    protected static ?string $modelLabel = 'Booking';

    protected static ?string $navigationGroup = 'Operations';

    public static function getEloquentQuery(): Builder
    {
        $q = parent::getEloquentQuery();
        $user = auth()->user();
        if ($user && $user->isTrainer()) {
            $q->whereHas('classSession', fn ($q) => $q->where('trainer_id', $user->id));
        }
        return $q;
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                \Filament\Forms\Components\Select::make('participant_id')->relationship('participant', 'full_name')->required()->searchable()->preload(),
                \Filament\Forms\Components\Select::make('class_session_id')->relationship('classSession', 'id')->required()->searchable()->preload(),
                \Filament\Forms\Components\Select::make('status')->options([
                    'pending' => 'Pending',
                    'reserved' => 'Reserved',
                    'paid' => 'Paid',
                    'verified' => 'Verified',
                    'completed' => 'Completed',
                    'certified' => 'Certified',
                    'cancelled' => 'Cancelled',
                    'transferred' => 'Transferred',
                ])->required(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                \Filament\Tables\Columns\TextColumn::make('participant.full_name'),
                \Filament\Tables\Columns\TextColumn::make('classSession.program.name'),
                \Filament\Tables\Columns\TextColumn::make('classSession.starts_at')->dateTime(),
                \Filament\Tables\Columns\TextColumn::make('status')->badge(),
                \Filament\Tables\Columns\TextColumn::make('paid_at')->dateTime()->placeholder('—'),
            ])
            ->filters([])
            ->actions([
                \Filament\Tables\Actions\EditAction::make(),
                Action::make('payWithStripe')
                    ->label('Pay with Stripe')
                    ->icon('heroicon-o-credit-card')
                    ->visible(fn (Booking $record): bool => in_array($record->status, ['pending', 'reserved'], true))
                    ->action(function (Booking $record) {
                        $stripe = app(StripeService::class);
                        $url = $stripe->createCheckoutSession($record);
                        return redirect($url);
                    }),
                Action::make('refund')
                    ->label('Refund')
                    ->icon('heroicon-o-arrow-uturn-left')
                    ->color('danger')
                    ->visible(fn (Booking $record): bool => $record->status === 'paid' && (auth()->user()?->isAdmin() ?? false))
                    ->form([
                        \Filament\Forms\Components\Textarea::make('reason')->label('Reason (for audit)')->required()->rows(2),
                    ])
                    ->action(function (Booking $record, array $data): void {
                        $stripe = app(StripeService::class);
                        if (! $stripe->refund($record, $data['reason'] ?? null)) {
                            throw new \RuntimeException('Refund failed. Check Stripe or payment intent.');
                        }
                        $oldStatus = $record->status;
                        $record->update(['status' => 'cancelled']);
                        AuditLog::create([
                            'user_id' => Auth::id(),
                            'action' => 'booking.refund',
                            'entity_type' => 'booking',
                            'entity_id' => $record->id,
                            'reason' => $data['reason'] ?? null,
                            'old_values' => ['status' => $oldStatus],
                            'new_values' => ['status' => 'cancelled'],
                        ]);
                    }),
                Action::make('overrideStatus')
                    ->label('Override status')
                    ->icon('heroicon-o-pencil-square')
                    ->visible(fn (): bool => auth()->user()?->isAdmin() ?? false)
                    ->form([
                        \Filament\Forms\Components\Select::make('status')->options([
                            'pending' => 'Pending',
                            'reserved' => 'Reserved',
                            'paid' => 'Paid',
                            'verified' => 'Verified',
                            'completed' => 'Completed',
                            'certified' => 'Certified',
                            'cancelled' => 'Cancelled',
                            'transferred' => 'Transferred',
                        ])->required(),
                        \Filament\Forms\Components\Textarea::make('reason')->label('Reason (required for audit)')->required()->rows(3),
                    ])
                    ->action(function (Booking $record, array $data): void {
                        $oldStatus = $record->status;
                        $record->update(['status' => $data['status']]);
                        AuditLog::create([
                            'user_id' => Auth::id(),
                            'action' => 'booking.status_override',
                            'entity_type' => 'booking',
                            'entity_id' => $record->id,
                            'reason' => $data['reason'],
                            'old_values' => ['status' => $oldStatus],
                            'new_values' => ['status' => $data['status']],
                        ]);
                    }),
            ])
            ->bulkActions([]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListBookings::route('/'),
            'create' => Pages\CreateBooking::route('/create'),
            'edit' => Pages\EditBooking::route('/{record}/edit'),
        ];
    }
}
