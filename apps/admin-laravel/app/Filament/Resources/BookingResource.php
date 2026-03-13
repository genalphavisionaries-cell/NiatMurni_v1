<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BookingResource\Pages;
use App\Models\AuditLog;
use App\Models\Booking;
use App\Services\StripeService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class BookingResource extends Resource
{
    protected static ?string $model = Booking::class;

    protected static ?string $navigationIcon = 'heroicon-o-ticket';

    protected static ?string $navigationGroup = 'Operations';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('participant_id')
                    ->relationship('participant', 'full_name')
                    ->required()
                    ->searchable()
                    ->preload(),
                Forms\Components\Select::make('class_session_id')
                    ->relationship('classSession')
                    ->getOptionLabelFromRecordUsing(fn ($record) => ($record->program?->name ?? 'Class') . ' — ' . $record->starts_at?->format('Y-m-d H:i'))
                    ->required()
                    ->searchable()
                    ->preload(),
                Forms\Components\Select::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'reserved' => 'Reserved',
                        'paid' => 'Paid',
                        'verified' => 'Verified',
                        'completed' => 'Completed',
                        'certified' => 'Certified',
                        'cancelled' => 'Cancelled',
                        'transferred' => 'Transferred',
                    ])
                    ->required(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('participant.full_name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('classSession.program.name')->label('Program'),
                Tables\Columns\TextColumn::make('classSession.starts_at')->dateTime()->sortable(),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\TextColumn::make('payment_status')->badge()->placeholder('—'),
                Tables\Columns\TextColumn::make('paid_at')->dateTime()->placeholder('—'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'reserved' => 'Reserved',
                        'paid' => 'Paid',
                        'verified' => 'Verified',
                        'completed' => 'Completed',
                        'certified' => 'Certified',
                        'cancelled' => 'Cancelled',
                        'transferred' => 'Transferred',
                    ]),
            ])
            ->actions([
                Tables\Actions\Action::make('override_status')
                    ->label('Override status')
                    ->icon('heroicon-o-pencil-square')
                    ->visible(fn () => auth()->user()?->isAdmin())
                    ->form([
                        Forms\Components\Select::make('new_status')
                            ->label('New status')
                            ->options([
                                'pending' => 'Pending',
                                'reserved' => 'Reserved',
                                'paid' => 'Paid',
                                'verified' => 'Verified',
                                'completed' => 'Completed',
                                'certified' => 'Certified',
                                'cancelled' => 'Cancelled',
                                'transferred' => 'Transferred',
                            ])
                            ->required(),
                        Forms\Components\Textarea::make('reason')
                            ->label('Reason (required for audit)')
                            ->required()
                            ->rows(3),
                    ])
                    ->action(function (Booking $record, array $data): void {
                        $oldStatus = $record->status;
                        AuditLog::create([
                            'user_id' => auth()->id(),
                            'action' => 'booking_status_override',
                            'entity_type' => 'booking',
                            'entity_id' => $record->id,
                            'reason' => $data['reason'],
                            'old_values' => ['status' => $oldStatus],
                            'new_values' => ['status' => $data['new_status']],
                        ]);
                        $record->update(['status' => $data['new_status']]);
                        \Filament\Notifications\Notification::make()
                            ->title('Booking status updated (audit logged)')
                            ->success()
                            ->send();
                    }),
                Tables\Actions\Action::make('refund')
                    ->label('Refund')
                    ->icon('heroicon-o-arrow-uturn-left')
                    ->color('warning')
                    ->visible(fn (Booking $record) => auth()->user()?->isAdmin() && $record->status === 'paid' && $record->stripe_payment_intent_id)
                    ->form([
                        Forms\Components\Textarea::make('reason')
                            ->label('Reason (for audit)')
                            ->required()
                            ->rows(2),
                    ])
                    ->action(function (Booking $record, array $data, StripeService $stripe): void {
                        if (!$stripe->refund($record, $data['reason'])) {
                            \Filament\Notifications\Notification::make()
                                ->title('Refund failed (check Stripe or payment intent)')
                                ->danger()
                                ->send();
                            return;
                        }
                        AuditLog::create([
                            'user_id' => auth()->id(),
                            'action' => 'booking_refund',
                            'entity_type' => 'booking',
                            'entity_id' => $record->id,
                            'reason' => $data['reason'],
                            'old_values' => ['status' => $record->status],
                            'new_values' => ['refunded' => true],
                        ]);
                        \Filament\Notifications\Notification::make()
                            ->title('Refund initiated (audit logged)')
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

    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery();
        $user = auth()->user();
        if ($user && $user->isTrainer()) {
            $query->whereHas('classSession', fn (Builder $q) => $q->where('trainer_id', $user->id));
        }
        return $query;
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
            'index' => Pages\ListBookings::route('/'),
            'create' => Pages\CreateBooking::route('/create'),
            'edit' => Pages\EditBooking::route('/{record}/edit'),
        ];
    }
}
