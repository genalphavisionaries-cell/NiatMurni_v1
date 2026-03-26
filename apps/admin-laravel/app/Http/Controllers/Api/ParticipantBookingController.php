<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Participant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParticipantBookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = (int) (auth()->id() ?? 0);
        if ($userId <= 0) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $participant = Participant::query()->where('user_id', $userId)->first();
        if (! $participant) {
            return response()->json(['message' => 'Participant profile not found'], 403);
        }

        $bookings = Booking::query()
            ->where('participant_id', $participant->id)
            ->with([
                'classSession:id,program_id,starts_at,ends_at',
                'classSession.program:id,name',
                'certificate:id,booking_id,status',
                'activePayment:id,booking_id,status',
            ])
            ->orderByDesc('id')
            ->get()
            ->map(function (Booking $booking): array {
                $startsAt = $booking->classSession?->starts_at;
                $endsAt = $booking->classSession?->ends_at;

                return [
                    'id' => (int) $booking->id,
                    'class_name' => (string) ($booking->classSession?->program?->name ?? '—'),
                    'class_date' => $startsAt?->toDateString(),
                    'class_time' => $this->formatTimeRange($startsAt?->format('H:i'), $endsAt?->format('H:i')),
                    'status' => $this->normalizeBookingStatus((string) $booking->status),
                    'payment_status' => (string) ($booking->activePayment?->status ?? $booking->payment_status ?? 'pending'),
                    'has_certificate' => $booking->certificate !== null,
                ];
            })
            ->values()
            ->all();

        return response()->json($bookings);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $userId = (int) (auth()->id() ?? 0);
        if ($userId <= 0) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $participant = Participant::query()->where('user_id', $userId)->first();
        if (! $participant) {
            return response()->json(['message' => 'Participant profile not found'], 403);
        }

        $booking = Booking::query()
            ->with([
                'classSession:id,program_id,tutor_id,starts_at,ends_at,zoom_join_url',
                'classSession.program:id,name',
                'classSession.tutor:id,user_id',
                'classSession.tutor.user:id,name',
                'activePayment:id,booking_id,status',
            ])
            ->findOrFail($id);

        if ((int) $booking->participant_id !== (int) $participant->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $startsAt = $booking->classSession?->starts_at;
        $endsAt = $booking->classSession?->ends_at;

        return response()->json([
            'id' => (int) $booking->id,
            'class_name' => (string) ($booking->classSession?->program?->name ?? '—'),
            'class_date' => $startsAt?->toDateString(),
            'class_time' => $this->formatTimeRange($startsAt?->format('H:i'), $endsAt?->format('H:i')),
            'trainer_name' => (string) ($booking->classSession?->tutor?->user?->name ?? ''),
            'zoom_link' => $booking->classSession?->zoom_join_url,
            'status' => $this->normalizeBookingStatus((string) $booking->status),
            'payment_status' => (string) ($booking->activePayment?->status ?? $booking->payment_status ?? 'pending'),
            'attendance_status' => $booking->attendance_status,
            'exam_status' => $booking->exam_passed === null
                ? 'pending'
                : ($booking->exam_passed ? 'passed' : 'failed'),
        ]);
    }

    private function formatTimeRange(?string $start, ?string $end): ?string
    {
        if (! $start && ! $end) {
            return null;
        }

        if ($start && $end) {
            return "{$start} - {$end}";
        }

        return $start ?: $end;
    }

    private function normalizeBookingStatus(string $status): string
    {
        $normalized = Booking::normalizeStatus($status);

        return match ($normalized) {
            Booking::STATUS_COMPLETED => 'completed',
            Booking::STATUS_CONFIRMED => 'paid',
            default => 'pending',
        };
    }
}

