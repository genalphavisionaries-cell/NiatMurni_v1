<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AuditLogResource\Pages;
use App\Models\AuditLog;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables\Table;

class AuditLogResource extends Resource
{
    protected static ?string $model = AuditLog::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $modelLabel = 'Audit Log';

    protected static ?string $navigationGroup = 'System';
    protected static ?int $navigationSort = 9;

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                \Filament\Infolists\Components\TextEntry::make('id'),
                \Filament\Infolists\Components\TextEntry::make('user.name')->label('User')->placeholder('—'),
                \Filament\Infolists\Components\TextEntry::make('action'),
                \Filament\Infolists\Components\TextEntry::make('entity_type'),
                \Filament\Infolists\Components\TextEntry::make('entity_id'),
                \Filament\Infolists\Components\TextEntry::make('reason')->placeholder('—'),
                \Filament\Infolists\Components\KeyValueEntry::make('old_values')->label('Old values'),
                \Filament\Infolists\Components\KeyValueEntry::make('new_values')->label('New values'),
                \Filament\Infolists\Components\TextEntry::make('created_at')->dateTime(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                \Filament\Tables\Columns\TextColumn::make('id')->sortable(),
                \Filament\Tables\Columns\TextColumn::make('user.name')->label('User')->placeholder('—'),
                \Filament\Tables\Columns\TextColumn::make('action'),
                \Filament\Tables\Columns\TextColumn::make('entity_type'),
                \Filament\Tables\Columns\TextColumn::make('entity_id'),
                \Filament\Tables\Columns\TextColumn::make('reason')->limit(50)->placeholder('—'),
                \Filament\Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                \Filament\Tables\Filters\SelectFilter::make('entity_type')
                    ->options(fn () => AuditLog::query()->distinct()->pluck('entity_type', 'entity_type')->all()),
                \Filament\Tables\Filters\Filter::make('created_at')
                    ->form([
                        \Filament\Forms\Components\DatePicker::make('created_from')->label('From'),
                        \Filament\Forms\Components\DatePicker::make('created_until')->label('Until'),
                    ])
                    ->query(function ($query, array $data) {
                        if ($data['created_from'] ?? null) {
                            $query->whereDate('created_at', '>=', $data['created_from']);
                        }
                        if ($data['created_until'] ?? null) {
                            $query->whereDate('created_at', '<=', $data['created_until']);
                        }
                        return $query;
                    }),
            ])
            ->actions([\Filament\Tables\Actions\ViewAction::make()])
            ->bulkActions([])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAuditLogs::route('/'),
            'view' => Pages\ViewAuditLog::route('/{record}'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit($record): bool
    {
        return false;
    }

    public static function canDelete($record): bool
    {
        return false;
    }
}
