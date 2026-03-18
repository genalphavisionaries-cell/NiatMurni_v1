<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SiteNavigationItemResource\Pages;
use App\Filament\Resources\SiteNavigationItemResource\Pages\EditSiteNavigationItem;
use App\Models\SiteNavigationItem;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class SiteNavigationItemResource extends Resource
{
    protected static ?string $model = SiteNavigationItem::class;

    protected static ?string $navigationIcon = 'heroicon-o-bars-3';

    protected static ?string $navigationGroup = 'CMS';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Navigation';

    protected static ?string $modelLabel = 'menu item';

    protected static ?string $pluralModelLabel = 'navigation items';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Menu item')
                    ->schema([
                        Forms\Components\Select::make('location')
                            ->label('Show in')
                            ->options([
                                SiteNavigationItem::LOCATION_HEADER => 'Header (top of site)',
                                SiteNavigationItem::LOCATION_FOOTER => 'Footer — main columns (with optional submenus)',
                                SiteNavigationItem::LOCATION_FOOTER_LEGAL => 'Footer — legal / policy links (bottom row)',
                                SiteNavigationItem::LOCATION_FOOTER_LOGIN => 'Footer — login / portal buttons',
                            ])
                            ->required()
                            ->native(false)
                            ->live(),
                        Forms\Components\Select::make('parent_id')
                            ->label('Submenu under')
                            ->helperText('Only for Header and main Footer. Legal and login areas are flat lists — no submenu.')
                            ->visible(fn (Get $get): bool => in_array($get('location'), [
                                SiteNavigationItem::LOCATION_HEADER,
                                SiteNavigationItem::LOCATION_FOOTER,
                            ], true))
                            ->options(function (Get $get, $livewire): array {
                                $loc = $get('location');
                                if (! in_array($loc, [SiteNavigationItem::LOCATION_HEADER, SiteNavigationItem::LOCATION_FOOTER], true)) {
                                    return [];
                                }
                                $q = SiteNavigationItem::query()
                                    ->where('location', $loc)
                                    ->whereNull('parent_id')
                                    ->orderBy('sort_order');
                                if ($livewire instanceof EditSiteNavigationItem) {
                                    $q->where('id', '!=', $livewire->getRecord()->getKey());
                                }
                                return $q->pluck('label', 'id')->all();
                            })
                            ->searchable()
                            ->preload(),
                        Forms\Components\TextInput::make('label')
                            ->label('Label')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('url')
                            ->label('Link (URL or path)')
                            ->maxLength(2048)
                            ->helperText('e.g. https://… or /#contact. Leave empty for a parent row that only opens a dropdown.'),
                        Forms\Components\TextInput::make('sort_order')
                            ->label('Sort order')
                            ->numeric()
                            ->default(0)
                            ->helperText('Lower numbers appear first.'),
                        Forms\Components\Toggle::make('is_active')
                            ->label('Active')
                            ->default(true),
                        Forms\Components\Toggle::make('open_in_new_tab')
                            ->label('Open in new tab'),
                        Forms\Components\Toggle::make('is_button')
                            ->label('Style as button (header / login row when supported)')
                            ->helperText('Mainly for header CTAs; ignored for legal links.'),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('sort_order')
                    ->label('#')
                    ->sortable(),
                Tables\Columns\TextColumn::make('label')
                    ->searchable()
                    ->description(fn (SiteNavigationItem $r): string => $r->parent_id ? '↳ Submenu item' : 'Top level'),
                Tables\Columns\TextColumn::make('location')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        SiteNavigationItem::LOCATION_HEADER => 'Header',
                        SiteNavigationItem::LOCATION_FOOTER => 'Footer',
                        SiteNavigationItem::LOCATION_FOOTER_LEGAL => 'Legal',
                        SiteNavigationItem::LOCATION_FOOTER_LOGIN => 'Login',
                        default => $state,
                    })
                    ->color(fn (string $state): string => match ($state) {
                        SiteNavigationItem::LOCATION_HEADER => 'info',
                        SiteNavigationItem::LOCATION_FOOTER => 'gray',
                        SiteNavigationItem::LOCATION_FOOTER_LEGAL => 'warning',
                        SiteNavigationItem::LOCATION_FOOTER_LOGIN => 'success',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('parent.label')
                    ->label('Under')
                    ->placeholder('—'),
                Tables\Columns\TextColumn::make('url')
                    ->limit(40)
                    ->tooltip(fn (SiteNavigationItem $r): ?string => $r->url)
                    ->placeholder('—'),
                Tables\Columns\IconColumn::make('is_active')->boolean()->label('On'),
                Tables\Columns\IconColumn::make('is_button')->boolean()->label('Btn'),
            ])
            ->defaultSort('sort_order')
            ->filters([
                Tables\Filters\SelectFilter::make('location')
                    ->options([
                        SiteNavigationItem::LOCATION_HEADER => 'Header',
                        SiteNavigationItem::LOCATION_FOOTER => 'Footer',
                        SiteNavigationItem::LOCATION_FOOTER_LEGAL => 'Legal',
                        SiteNavigationItem::LOCATION_FOOTER_LOGIN => 'Login',
                    ]),
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
            'index' => Pages\ListSiteNavigationItems::route('/'),
            'create' => Pages\CreateSiteNavigationItem::route('/create'),
            'edit' => Pages\EditSiteNavigationItem::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->orderBy('location')
            ->orderByRaw('CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END')
            ->orderBy('sort_order');
    }
}
