<?php

namespace App\Filament\Resources;

use App\Filament\Resources\HomepageSectionResource\Pages;
use App\Models\HomepageSection;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
class HomepageSectionResource extends Resource
{
    protected static ?string $model = HomepageSection::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    protected static ?string $navigationGroup = 'CMS';

    protected static ?int $navigationSort = 3;

    protected static ?string $navigationLabel = 'Homepage sections';

    protected static ?string $modelLabel = 'homepage section';

    protected static ?string $pluralModelLabel = 'homepage sections';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Section identity')
                    ->schema([
                        Forms\Components\TextInput::make('section_key')
                            ->label('Section key')
                            ->required()
                            ->maxLength(100)
                            ->regex('/^[a-z0-9][a-z0-9_-]*$/i')
                            ->helperText('Stable ID for developers (e.g. hero, trust_badges). Letters, numbers, dashes, underscores only. Cannot be changed after creation.')
                            ->unique(HomepageSection::class, 'section_key', ignorable: fn (?HomepageSection $record): ?HomepageSection => $record)
                            ->disabled(fn (?HomepageSection $record): bool => $record !== null)
                            ->dehydrated(),
                        Forms\Components\TextInput::make('name')
                            ->label('Admin name')
                            ->required()
                            ->maxLength(255)
                            ->helperText('Friendly name shown only in admin.'),
                        Forms\Components\Toggle::make('is_active')
                            ->label('Active on site')
                            ->default(true)
                            ->helperText('When the public site uses these sections, inactive ones can be hidden.'),
                        Forms\Components\TextInput::make('sort_order')
                            ->label('Sort order')
                            ->numeric()
                            ->default(0)
                            ->helperText('Lower numbers appear first on the homepage.'),
                    ])
                    ->columns(2),
                Forms\Components\Section::make('Content')
                    ->schema([
                        Forms\Components\TextInput::make('title')
                            ->label('Heading')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('subtitle')
                            ->label('Subheading')
                            ->maxLength(255),
                        Forms\Components\Textarea::make('description')
                            ->label('Description')
                            ->rows(4)
                            ->columnSpanFull(),
                        Forms\Components\TextInput::make('image_url')
                            ->label('Image URL')
                            ->maxLength(2048)
                            ->helperText('Full URL to an image (e.g. Cloudinary). No file upload here.'),
                    ])
                    ->columns(1),
                Forms\Components\Section::make('Buttons')
                    ->schema([
                        Forms\Components\TextInput::make('button_primary_label')
                            ->label('Primary button label')
                            ->maxLength(100),
                        Forms\Components\TextInput::make('button_primary_url')
                            ->label('Primary button link')
                            ->maxLength(2048),
                        Forms\Components\TextInput::make('button_secondary_label')
                            ->label('Secondary button label')
                            ->maxLength(100),
                        Forms\Components\TextInput::make('button_secondary_url')
                            ->label('Secondary button link')
                            ->maxLength(2048),
                    ])
                    ->columns(2),
                Forms\Components\Section::make('Extra data')
                    ->description('Optional key/value pairs for future layout options.')
                    ->schema([
                        Forms\Components\KeyValue::make('extra_data')
                            ->keyLabel('Key')
                            ->valueLabel('Value')
                            ->addActionLabel('Add row')
                            ->helperText('All values are stored as text. Leave empty if not needed.'),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('sort_order')
                    ->label('#')
                    ->sortable(),
                Tables\Columns\TextColumn::make('section_key')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->wrap(),
                Tables\Columns\IconColumn::make('is_active')
                    ->label('Active')
                    ->boolean(),
                Tables\Columns\TextColumn::make('title')
                    ->limit(40)
                    ->placeholder('—'),
            ])
            ->defaultSort('sort_order')
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')->label('Active'),
            ])
            ->actions([
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
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListHomepageSections::route('/'),
            'create' => Pages\CreateHomepageSection::route('/create'),
            'edit' => Pages\EditHomepageSection::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->orderBy('sort_order');
    }
}
