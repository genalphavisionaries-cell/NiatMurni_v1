<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProgramResource\Pages;
use App\Models\Program;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Table;

class ProgramResource extends Resource
{
    protected static ?string $model = Program::class;

    protected static ?string $navigationIcon = 'heroicon-o-academic-cap';

    protected static ?string $modelLabel = 'Program';

    protected static ?string $navigationGroup = 'Courses';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                \Filament\Forms\Components\TextInput::make('name')->required()->maxLength(255),
                \Filament\Forms\Components\TextInput::make('slug')->required()->maxLength(255)->unique(ignoreRecord: true),
                \Filament\Forms\Components\Textarea::make('description')->rows(3),
                \Filament\Forms\Components\Select::make('delivery_mode')->options(['physical' => 'Physical', 'online' => 'Online', 'hybrid' => 'Hybrid']),
                \Filament\Forms\Components\TextInput::make('duration_hours')->numeric()->minValue(0)->suffix('hours'),
                \Filament\Forms\Components\TextInput::make('price')->numeric()->minValue(0)->prefix('RM'),
                \Filament\Forms\Components\Toggle::make('is_active')->default(true),
                \Filament\Forms\Components\TextInput::make('default_capacity')->numeric()->default(30),
                \Filament\Forms\Components\TextInput::make('min_threshold')->numeric()->default(1),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                \Filament\Tables\Columns\TextColumn::make('name')->searchable(),
                \Filament\Tables\Columns\TextColumn::make('slug'),
                \Filament\Tables\Columns\TextColumn::make('delivery_mode')->placeholder('—'),
                \Filament\Tables\Columns\TextColumn::make('duration_hours')->suffix('h')->placeholder('—'),
                \Filament\Tables\Columns\TextColumn::make('price')->money('MYR')->placeholder('—'),
                \Filament\Tables\Columns\IconColumn::make('is_active')->boolean(),
                \Filament\Tables\Columns\TextColumn::make('default_capacity'),
                \Filament\Tables\Columns\TextColumn::make('min_threshold'),
            ])
            ->filters([])
            ->actions([\Filament\Tables\Actions\EditAction::make()])
            ->bulkActions([]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPrograms::route('/'),
            'create' => Pages\CreateProgram::route('/create'),
            'edit' => Pages\EditProgram::route('/{record}/edit'),
        ];
    }
}
