<?php

namespace App\Filament\Widgets;

use App\Models\ClassSession;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class UpcomingClassesWidget extends BaseWidget
{
    protected static ?int $sort = 0;

    protected int|string|array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        $query = ClassSession::query()
            ->where('starts_at', '>', now())
            ->whereIn('status', ['draft', 'confirmed'])
            ->orderBy('starts_at')
            ->limit(10);
        if (auth()->user()?->isTrainer()) {
            $query->where('trainer_id', auth()->id());
        }
        return $table
            ->query($query)
            ->columns([
                TextColumn::make('program.name'),
                TextColumn::make('trainer.name'),
                TextColumn::make('starts_at')->dateTime(),
                TextColumn::make('ends_at')->dateTime(),
                TextColumn::make('mode'),
                TextColumn::make('status')->badge(),
            ])
            ->paginated(false);
    }

    protected static ?string $heading = 'Upcoming classes';
}
