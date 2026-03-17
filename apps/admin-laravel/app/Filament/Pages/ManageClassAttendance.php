<?php

namespace App\Filament\Pages;

use App\Models\Booking;
use App\Models\ClassSession;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Arr;

class ManageClassAttendance extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-check';

    protected static bool $shouldRegisterNavigation = false;

    protected static ?string $slug = 'manage-attendance';

    protected static string $view = 'filament.pages.manage-class-attendance';

    public ?int $classSessionId = null;

    public ?array $data = [];

    public function mount(?int $class_session_id = null): void
    {
        $this->classSessionId = $class_session_id ?? (int) request()->query('class_session_id');

        if (! $this->classSessionId) {
            Notification::make()
                ->title('No class session selected.')
                ->danger()
                ->send();

            return;
        }

        $classSession = ClassSession::query()
            ->with(['bookings.participant'])
            ->find($this->classSessionId);

        if (! $classSession) {
            Notification::make()
                ->title('Class session not found.')
                ->danger()
                ->send();

            return;
        }

        $bookings = $classSession->bookings()
            ->whereNull('cancelled_at')
            ->with('participant')
            ->orderBy('id')
            ->get();

        $items = $bookings->map(fn (Booking $booking) => [
            'booking_id' => $booking->id,
            'participant_name' => $booking->participant?->full_name ?? '—',
            'attendance_status' => $booking->attendance_status ?? null,
            'exam_passed' => (bool) $booking->exam_passed,
        ])->all();

        $this->form->fill(['bookings' => $items]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                \Filament\Forms\Components\Repeater::make('bookings')
                    ->schema([
                        \Filament\Forms\Components\Hidden::make('booking_id'),
                        \Filament\Forms\Components\TextInput::make('participant_name')
                            ->label('Participant')
                            ->disabled()
                            ->dehydrated(false),
                        \Filament\Forms\Components\Select::make('attendance_status')
                            ->label('Attendance')
                            ->options([
                                'present' => 'Present',
                                'absent' => 'Absent',
                            ])
                            ->nullable(),
                        \Filament\Forms\Components\Toggle::make('exam_passed')
                            ->label('Exam passed'),
                    ])
                    ->columns(3)
                    ->defaultItems(0)
                    ->addable(false)
                    ->deletable(false)
                    ->reorderable(false)
                    ->itemLabel(fn (array $state): ?string => $state['participant_name'] ?? null),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        $bookings = $this->form->getState()['bookings'] ?? [];

        foreach ($bookings as $row) {
            $bookingId = (int) Arr::get($row, 'booking_id', 0);
            if (! $bookingId) {
                continue;
            }

            Booking::query()->where('id', $bookingId)->update([
                'attendance_status' => $row['attendance_status'] ?? null,
                'exam_passed' => (bool) ($row['exam_passed'] ?? false),
            ]);
        }

        Notification::make()
            ->title('Attendance and exam status updated.')
            ->success()
            ->send();
    }

    public function markAllPresent(): void
    {
        $bookings = $this->data['bookings'] ?? [];
        foreach ($bookings as $i => $row) {
            $this->data['bookings'][$i]['attendance_status'] = 'present';
        }
        $this->form->fill($this->data);
    }

    public function markAllPassed(): void
    {
        $bookings = $this->data['bookings'] ?? [];
        foreach ($bookings as $i => $row) {
            $this->data['bookings'][$i]['exam_passed'] = true;
        }
        $this->form->fill($this->data);
    }

    protected function getHeaderActions(): array
    {
        $hasBookings = ! empty($this->data['bookings'] ?? []);

        return [
            \Filament\Actions\Action::make('mark_all_present')
                ->label('Mark all present')
                ->icon('heroicon-o-check-circle')
                ->color('success')
                ->visible($hasBookings)
                ->action('markAllPresent'),
            \Filament\Actions\Action::make('mark_all_passed')
                ->label('Mark all passed')
                ->icon('heroicon-o-academic-cap')
                ->color('success')
                ->visible($hasBookings)
                ->action('markAllPassed'),
            \Filament\Actions\Action::make('save')
                ->label('Save')
                ->submit('save'),
        ];
    }

    public function getTitle(): string
    {
        if (! $this->classSessionId) {
            return 'Manage Attendance';
        }

        $session = ClassSession::query()->with('program')->find($this->classSessionId);

        return $session
            ? 'Manage Attendance: ' . ($session->program?->name ?? 'Class') . ' (' . $session->starts_at?->format('d M Y') . ')'
            : 'Manage Attendance';
    }

    public function getSubheading(): ?string
    {
        return 'Update attendance and exam status for all participants in this class.';
    }
}
