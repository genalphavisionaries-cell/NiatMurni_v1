<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ClassSessionResource\Pages;
use App\Models\ClassSession;
use App\Services\ZoomService;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Actions\Action;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ClassSessionResource extends Resource
{
    protected static ?string $model = ClassSession::class;

    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';

    protected static ?string $modelLabel = 'Class Session';

    protected static ?string $navigationGroup = 'Scheduling';

    public static function getEloquentQuery(): Builder
    {
        $q = parent::getEloquentQuery();
        $user = auth()->user();
        if ($user && $user->isTrainer()) {
            $q->where('trainer_id', $user->id);
        }
        return $q;
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                \Filament\Forms\Components\Select::make('program_id')->relationship('program', 'name')->required()->searchable()->preload(),
                \Filament\Forms\Components\Select::make('trainer_id')->relationship('trainer', 'name', fn ($q) => $q->where('role', 'trainer')->orWhere('role', 'admin'))->searchable()->preload(),
                \Filament\Forms\Components\DateTimePicker::make('starts_at')->required(),
                \Filament\Forms\Components\DateTimePicker::make('ends_at')->required(),
                \Filament\Forms\Components\Select::make('mode')->options(['online' => 'Online', 'physical' => 'Physical'])->required(),
                \Filament\Forms\Components\TextInput::make('language')->maxLength(255),
                \Filament\Forms\Components\TextInput::make('venue')->maxLength(255),
                \Filament\Forms\Components\TextInput::make('capacity')->numeric()->default(30),
                \Filament\Forms\Components\TextInput::make('min_threshold')->numeric()->default(1),
                \Filament\Forms\Components\Select::make('status')->options([
                    'draft' => 'Draft',
                    'confirmed' => 'Confirmed',
                    'ongoing' => 'Ongoing',
                    'completed' => 'Completed',
                    'cancelled' => 'Cancelled',
                    'archived' => 'Archived',
                ])->default('confirmed'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                \Filament\Tables\Columns\TextColumn::make('program.name'),
                \Filament\Tables\Columns\TextColumn::make('trainer.name'),
                \Filament\Tables\Columns\TextColumn::make('starts_at')->dateTime(),
                \Filament\Tables\Columns\TextColumn::make('ends_at')->dateTime(),
                \Filament\Tables\Columns\TextColumn::make('mode'),
                \Filament\Tables\Columns\TextColumn::make('status')->badge(),
                \Filament\Tables\Columns\TextColumn::make('capacity'),
                \Filament\Tables\Columns\TextColumn::make('zoom_join_url')->limit(30)->url(fn ($state) => $state)->openUrlInNewTab()->placeholder('—'),
            ])
            ->filters([])
            ->actions([
                \Filament\Tables\Actions\EditAction::make(),
                Action::make('regenerateZoomLink')
                    ->label('Regenerate meeting link')
                    ->icon('heroicon-o-link')
                    ->visible(fn (ClassSession $record): bool => $record->mode === 'online')
                    ->action(function (ClassSession $record): void {
                        $result = app(ZoomService::class)->getOrCreateMeetingLink($record);
                        if ($result) {
                            $record->updateQuietly([
                                'zoom_meeting_id' => $result['meeting_id'],
                                'zoom_join_url' => $result['join_url'],
                            ]);
                        }
                    }),
                Action::make('syncZoomAttendance')
                    ->label('Sync Zoom attendance')
                    ->icon('heroicon-o-user-group')
                    ->visible(fn (ClassSession $record): bool => $record->mode === 'online' && ! empty($record->zoom_meeting_id))
                    ->action(function (ClassSession $record): void {
                        $zoom = app(ZoomService::class);
                        $participants = $zoom->getMeetingParticipantReport($record->zoom_meeting_id);
                        if (! $participants) {
                            return;
                        }
                        foreach ($participants as $p) {
                            $email = $p['user_email'] ?? null;
                            $name = $p['name'] ?? '';
                            $joinTime = $p['join_time'] ?? null;
                            $leaveTime = $p['leave_time'] ?? null;
                            $duration = (int) ($p['duration'] ?? 0);
                            $booking = $record->bookings()->whereHas('participant', function ($q) use ($email, $name) {
                                if ($email) {
                                    $q->where('email', $email);
                                } else {
                                    $q->where('full_name', $name);
                                }
                            })->first();
                            if (! $booking) {
                                continue;
                            }
                            $checkIn = $joinTime ? \Carbon\Carbon::parse($joinTime) : null;
                            $checkOut = $leaveTime ? \Carbon\Carbon::parse($leaveTime) : null;
                            \App\Models\AttendanceRecord::updateOrCreate(
                                ['booking_id' => $booking->id],
                                [
                                    'check_in_at' => $checkIn,
                                    'check_out_at' => $checkOut,
                                    'duration_seconds' => $duration ?: null,
                                    'source' => 'zoom',
                                    'recorded_by' => null,
                                ]
                            );
                        }
                    }),
            ])
            ->bulkActions([]);
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
