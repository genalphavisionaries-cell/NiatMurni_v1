<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ParticipantResource\Pages;
use App\Models\Participant;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ParticipantResource extends Resource
{
    protected static ?string $model = Participant::class;

    protected static ?string $navigationIcon = 'heroicon-o-user-group';

    protected static ?string $modelLabel = 'Participant';

    public static function getEloquentQuery(): Builder
    {
        $q = parent::getEloquentQuery();
        $user = auth()->user();
        if ($user && $user->isTrainer()) {
            $q->whereHas('bookings.classSession', fn ($q) => $q->where('trainer_id', $user->id));
        }
        return $q;
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                \Filament\Forms\Components\TextInput::make('full_name')->required()->maxLength(255),
                \Filament\Forms\Components\TextInput::make('nric_passport')->required()->maxLength(255)->unique(ignoreRecord: true),
                \Filament\Forms\Components\TextInput::make('phone')->tel()->maxLength(255),
                \Filament\Forms\Components\TextInput::make('email')->email()->maxLength(255),
                \Filament\Forms\Components\Select::make('employer_id')->relationship('employer', 'name')->searchable()->preload(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                \Filament\Tables\Columns\TextColumn::make('full_name')->searchable(),
                \Filament\Tables\Columns\TextColumn::make('nric_passport'),
                \Filament\Tables\Columns\TextColumn::make('email'),
                \Filament\Tables\Columns\TextColumn::make('employer.name'),
            ])
            ->filters([])
            ->actions([\Filament\Tables\Actions\EditAction::make()])
            ->bulkActions([]);
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
