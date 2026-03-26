<?php

namespace App\Services;

use App\Models\Booking;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AttendanceService
{
    /**
     * @param  array{class_session_id:int, booking_id:int, attendance_status:?string, exam_passed?:bool}  $payload
     * @return array{booking_id:int, attendance_status:?string, exam_passed:bool}
     */
    public function updateAttendance(array $payload): array
    {
        $booking = Booking::query()
            ->where('id', $payload['booking_id'])
            ->where('class_session_id', $payload['class_session_id'])
            ->whereNull('cancelled_at')
            ->first();

        if (! $booking) {
            throw ValidationException::withMessages([
                'booking_id' => ['Booking does not belong to the provided class_session_id or is cancelled.'],
            ]);
        }

        $normalized = $this->normalizeRow($payload['attendance_status'] ?? null, (bool) ($payload['exam_passed'] ?? false));

        $booking->update($normalized);

        return [
            'booking_id' => $booking->id,
            'attendance_status' => $booking->attendance_status,
            'exam_passed' => (bool) $booking->exam_passed,
        ];
    }

    /**
     * @param  int  $classSessionId
     * @param  array<int, array{booking_id:int, attendance_status:?string, exam_passed?:bool}>  $rows
     * @return array<int, array{booking_id:int, attendance_status:?string, exam_passed:bool}>
     */
    public function bulkUpdateAttendance(int $classSessionId, array $rows): array
    {
        $bookingIds = Collection::make($rows)
            ->pluck('booking_id')
            ->filter(fn ($id) => is_int($id) || ctype_digit((string) $id))
            ->map(fn ($id) => (int) $id)
            ->values();

        if ($bookingIds->isEmpty()) {
            return [];
        }

        $allowedIds = Booking::query()
            ->where('class_session_id', $classSessionId)
            ->whereNull('cancelled_at')
            ->whereIn('id', $bookingIds)
            ->pluck('id')
            ->all();

        $allowedMap = array_fill_keys($allowedIds, true);
        $invalidIds = $bookingIds
            ->filter(fn (int $id) => ! isset($allowedMap[$id]))
            ->values()
            ->all();

        if ($invalidIds !== []) {
            throw ValidationException::withMessages([
                'rows' => ['Some bookings do not belong to the provided class_session_id or are cancelled: ' . implode(', ', $invalidIds)],
            ]);
        }

        $result = [];

        DB::transaction(function () use ($rows, $allowedMap, &$result): void {
            foreach ($rows as $row) {
                $bookingId = (int) ($row['booking_id'] ?? 0);
                if ($bookingId === 0 || ! isset($allowedMap[$bookingId])) {
                    continue;
                }

                $normalized = $this->normalizeRow($row['attendance_status'] ?? null, (bool) ($row['exam_passed'] ?? false));

                Booking::query()
                    ->where('id', $bookingId)
                    ->update($normalized);

                $result[] = [
                    'booking_id' => $bookingId,
                    'attendance_status' => $normalized['attendance_status'],
                    'exam_passed' => (bool) $normalized['exam_passed'],
                ];
            }
        });

        return $result;
    }

    /**
     * @return array<int, array{booking_id:int, attendance_status:?string, exam_passed:bool}>
     */
    public function markAllPresent(int $classSessionId): array
    {
        $rows = $this->classBookings($classSessionId)->map(fn (Booking $booking) => [
            'booking_id' => $booking->id,
            'attendance_status' => 'present',
            'exam_passed' => (bool) $booking->exam_passed,
        ])->all();

        return $this->bulkUpdateAttendance($classSessionId, $rows);
    }

    /**
     * @return array<int, array{booking_id:int, attendance_status:?string, exam_passed:bool}>
     */
    public function markAllPassed(int $classSessionId): array
    {
        $rows = $this->classBookings($classSessionId)->map(fn (Booking $booking) => [
            'booking_id' => $booking->id,
            'attendance_status' => $booking->attendance_status,
            'exam_passed' => $booking->attendance_status !== 'absent',
        ])->all();

        return $this->bulkUpdateAttendance($classSessionId, $rows);
    }

    /**
     * @return array{attendance_status:?string, exam_passed:bool}
     */
    private function normalizeRow(?string $attendanceStatus, bool $examPassed): array
    {
        if ($attendanceStatus === 'absent') {
            $examPassed = false;
        }

        return [
            'attendance_status' => $attendanceStatus,
            'exam_passed' => $examPassed,
        ];
    }

    /**
     * @return Collection<int, Booking>
     */
    private function classBookings(int $classSessionId): Collection
    {
        return Booking::query()
            ->where('class_session_id', $classSessionId)
            ->whereNull('cancelled_at')
            ->orderBy('id')
            ->get();
    }
}

