<?php

namespace App\Filament\Resources;

use App\Filament\Resources\VerificationRecordResource\Pages;
use App\Models\VerificationRecord;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class VerificationRecordResource extends Resource
{
    protected static ?string $model = VerificationRecord::class;

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-check';

    protected static ?string $modelLabel = 'Verification Record';

    protected static ?string $navigationGroup = 'Certificates & Compliance';
    protected static ?int $navigationSort = 8;

    public static function getEloquentQuery(): Builder
    {
        $q = parent::getEloquentQuery();
        $user = auth()->user();
        if ($user && $user->isTrainer()) {
            $q->whereHas('booking.classSession', fn ($q) => $q->where('trainer_id', $user->id));
        }
        return $q;
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                \Filament\Forms\Components\Select::make('booking_id')
                    ->relationship('booking', 'id', fn ($q) => $q->with('participant', 'classSession.program'))
                    ->getOptionLabelFromRecordUsing(fn ($record) => sprintf('#%s – %s – %s', $record->id, $record->participant?->full_name ?? '—', $record->classSession?->program?->name ?? '—'))
                    ->required()
                    ->searchable()
                    ->preload()
                    ->disabled(),
                \Filament\Forms\Components\Select::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'approved' => 'Approved',
                        'rejected' => 'Rejected',
                        'overridden' => 'Overridden',
                    ])
                    ->required(),
                \Filament\Forms\Components\Select::make('reviewed_by')
                    ->relationship('reviewedBy', 'name')
                    ->searchable()
                    ->preload(),
                \Filament\Forms\Components\DateTimePicker::make('reviewed_at'),
                \Filament\Forms\Components\Textarea::make('notes')->rows(3),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                \Filament\Tables\Columns\TextColumn::make('booking_id')->label('Booking')->sortable(),
                \Filament\Tables\Columns\TextColumn::make('booking.participant.full_name')->label('Participant'),
                \Filament\Tables\Columns\TextColumn::make('booking.classSession.program.name')->label('Program'),
                \Filament\Tables\Columns\TextColumn::make('status')->badge(),
                \Filament\Tables\Columns\TextColumn::make('reviewedBy.name')->placeholder('—'),
                \Filament\Tables\Columns\TextColumn::make('reviewed_at')->dateTime()->placeholder('—'),
                \Filament\Tables\Columns\TextColumn::make('notes')->limit(40)->placeholder('—'),
            ])
            ->filters([
                \Filament\Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'approved' => 'Approved',
                        'rejected' => 'Rejected',
                        'overridden' => 'Overridden',
                    ]),
            ])
            ->actions([\Filament\Tables\Actions\ViewAction::make(), \Filament\Tables\Actions\EditAction::make()])
            ->bulkActions([]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListVerificationRecords::route('/'),
            'view' => Pages\ViewVerificationRecord::route('/{record}'),
            'edit' => Pages\EditVerificationRecord::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }
}
