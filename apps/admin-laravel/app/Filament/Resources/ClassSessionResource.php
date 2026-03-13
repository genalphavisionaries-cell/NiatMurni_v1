<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ClassSessionResource\Pages;
use App\Models\ClassSession;
use App\Services\ZoomService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ClassSessionResource extends Resource
{
    protected static ?string $model = ClassSession::class;

    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';

    protected static ?string $navigationGroup = 'Operations';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('program_id')
                    ->relationship('program', 'name')
                    ->required()
                    ->searchable()
                    ->preload(),
                Forms\Components\Select::make('trainer_id')
                    ->relationship('trainer', 'name')
                    ->searchable()
                    ->preload(),
                Forms\Components\DateTimePicker::make('starts_at')->required(),
                Forms\Components\DateTimePicker::make('ends_at')->required(),
                Forms\Components\Select::make('mode')
                    ->options(['online' => 'Online', 'physical' => 'Physical'])
                    ->required(),
                Forms\Components\TextInput::make('language')->maxLength(100),
                Forms\Components\TextInput::make('venue')->maxLength(255),
                Forms\Components\TextInput::make('location')->maxLength(200),
                Forms\Components\TextInput::make('capacity')->numeric()->default(30)->minValue(1),
                Forms\Components\TextInput::make('min_threshold')->numeric()->default(1)->minValue(1),
                Forms\Components\Select::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'confirmed' => 'Confirmed',
                        'ongoing' => 'Ongoing',
                        'completed' => 'Completed',
                        'cancelled' => 'Cancelled',
                        'archived' => 'Archived',
                    ])
                    ->default('draft'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('program.name')->sortable()->searchable(),
                Tables\Columns\TextColumn::make('trainer.name')->placeholder('—')->sortable(),
                Tables\Columns\TextColumn::make('starts_at')->dateTime()->sortable(),
                Tables\Columns\TextColumn::make('ends_at')->dateTime()->sortable(),
                Tables\Columns\TextColumn::make('mode')->badge(),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\TextColumn::make('bookings_count')->counts('bookings')->label('Bookings'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'confirmed' => 'Confirmed',
                        'ongoing' => 'Ongoing',
                        'completed' => 'Completed',
                        'cancelled' => 'Cancelled',
                        'archived' => 'Archived',
                    ]),
                Tables\Filters\SelectFilter::make('mode')
                    ->options(['online' => 'Online', 'physical' => 'Physical']),
            ])
            ->actions([
                Tables\Actions\Action::make('regenerate_zoom')
                    ->label('Regenerate meeting link')
                    ->icon('heroicon-o-link')
                    ->visible(fn (ClassSession $record) => $record->mode === 'online')
                    ->action(function (ClassSession $record, ZoomService $zoom): void {
                        $result = $zoom->getOrCreateMeetingLink($record);
                        if ($result) {
                            $record->updateQuietly([
                                'zoom_meeting_id' => $result['meeting_id'],
                                'zoom_join_url' => $result['join_url'],
                            ]);
                            \Filament\Notifications\Notification::make()
                                ->title('Zoom link updated')
                                ->success()
                                ->send();
                        } else {
                            \Filament\Notifications\Notification::make()
                                ->title('Could not create Zoom meeting. Check Zoom config.')
                                ->danger()
                                ->send();
                        }
                    }),
                Tables\Actions\Action::make('sync_zoom_attendance')
                    ->label('Sync Zoom attendance')
                    ->icon('heroicon-o-arrow-path')
                    ->visible(fn (ClassSession $record) => $record->mode === 'online' && $record->zoom_meeting_id)
                    ->action(function (ClassSession $record, ZoomService $zoom): void {
                        $count = $zoom->syncAttendanceFromZoom($record);
                        \Filament\Notifications\Notification::make()
                            ->title("Synced {$count} attendance record(s) from Zoom")
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
            $query->where('trainer_id', $user->id);
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
            'index' => Pages\ListClassSessions::route('/'),
            'create' => Pages\CreateClassSession::route('/create'),
            'edit' => Pages\EditClassSession::route('/{record}/edit'),
        ];
    }
}
