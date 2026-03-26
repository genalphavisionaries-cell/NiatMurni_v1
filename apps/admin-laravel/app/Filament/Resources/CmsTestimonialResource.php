<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CmsTestimonialResource\Pages;
use App\Models\CmsTestimonial;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class CmsTestimonialResource extends Resource
{
    protected static ?string $model = CmsTestimonial::class;

    public static function canViewAny(): bool
    {
        return true;
    }

    public static function canCreate(): bool
    {
        return true;
    }

    public static function canEdit(\Illuminate\Database\Eloquent\Model $record): bool
    {
        return true;
    }

    public static function canDelete(\Illuminate\Database\Eloquent\Model $record): bool
    {
        return true;
    }

    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-bottom-center-text';

    protected static ?string $navigationGroup = 'CMS';

    protected static ?int $navigationSort = 3;

    protected static ?string $navigationLabel = 'Testimonials';

    protected static ?string $modelLabel = 'Testimonial';

    protected static ?string $pluralModelLabel = 'Testimonials';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('image_url')
                    ->label('Image URL')
                    ->maxLength(2048)
                    ->url(),
                Forms\Components\TextInput::make('rating')
                    ->numeric()
                    ->minValue(1)
                    ->maxValue(5)
                    ->default(5)
                    ->required(),
                Forms\Components\Textarea::make('content')
                    ->required()
                    ->rows(4)
                    ->columnSpanFull(),
                Forms\Components\Toggle::make('is_active')
                    ->default(true),
                Forms\Components\TextInput::make('sort_order')
                    ->numeric()
                    ->default(0),
            ])
            ->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('rating')->sortable(),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
                Tables\Columns\TextColumn::make('sort_order')->sortable(),
                Tables\Columns\TextColumn::make('updated_at')->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('sort_order');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCmsTestimonials::route('/'),
            'create' => Pages\CreateCmsTestimonial::route('/create'),
            'edit' => Pages\EditCmsTestimonial::route('/{record}/edit'),
        ];
    }
}
