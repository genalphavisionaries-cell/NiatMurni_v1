<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ClassSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class PublicController extends Controller
{
    public function upcomingClasses(): JsonResponse
    {
        $now = Carbon::now();

        $sessions = ClassSession::query()
            ->with(['program:id,name,is_active', 'tutor.user:id,name'])
            ->where('starts_at', '>=', $now)
            ->whereIn('status', ['draft', 'scheduled', 'confirmed', 'ongoing', 'in_progress'])
            ->whereHas('program', fn ($q) => $q->where('is_active', true))
            ->orderBy('starts_at')
            ->get();

        $data = $sessions->map(function (ClassSession $session): array {
            $bookedCount = (int) $session->bookings()
                ->whereNotIn('status', ['cancelled'])
                ->count();
            $capacity = (int) ($session->capacity ?? 0);
            $availableSlots = max($capacity - $bookedCount, 0);
            $programBasePriceCents = $session->program?->base_price_cents ?? null;
            $priceCents = $session->price_cents ?? $programBasePriceCents;
            $price = $priceCents !== null ? ((float) $priceCents / 100) : ($session->program?->price ?? null);

            return [
                'id' => (int) $session->id,
                'program_id' => (int) $session->program_id,
                'program_name' => (string) ($session->program?->name ?? ''),
                'title' => (string) ($session->program?->name ?? ''),
                'trainer_name' => $session->tutor?->user?->name,
                'starts_at' => optional($session->starts_at)->toIso8601String(),
                'ends_at' => optional($session->ends_at)->toIso8601String(),
                'mode' => $session->mode,
                'language' => $session->language,
                'venue' => $session->venue,
                'location' => $session->location,
                'capacity' => $capacity,
                'available_slots' => $availableSlots,
                'min_threshold' => (int) ($session->min_threshold_minutes ?? 0),
                'status' => $session->status,
                'zoom_join_url' => $session->zoom_join_url,
                'price' => $price,
                'price_cents' => $priceCents,
            ];
        })->values();

        return response()->json(['data' => $data]);
    }

    public function classDetail(int $id): JsonResponse
    {
        $session = ClassSession::query()
            ->with(['program:id,name,description,price,is_active', 'tutor.user:id,name,email'])
            ->whereKey($id)
            ->first();

        if (! $session) {
            return response()->json(['message' => 'Class not found'], 404);
        }

        $bookedCount = (int) $session->bookings()
            ->whereNotIn('status', ['cancelled'])
            ->count();
        $capacity = (int) ($session->capacity ?? 0);
        $availableSlots = max($capacity - $bookedCount, 0);

        $data = [
            'id' => (int) $session->id,
            'program_id' => (int) $session->program_id,
            'program_name' => (string) ($session->program?->name ?? ''),
            'title' => (string) ($session->program?->name ?? ''),
            'description' => $session->program?->description,
            'trainer_name' => $session->tutor?->user?->name,
            'starts_at' => optional($session->starts_at)->toIso8601String(),
            'ends_at' => optional($session->ends_at)->toIso8601String(),
            'mode' => $session->mode,
            'language' => $session->language,
            'venue' => $session->venue,
            'location' => $session->location,
            'capacity' => $capacity,
            'available_slots' => $availableSlots,
            'min_threshold' => (int) ($session->min_threshold_minutes ?? 0),
            'status' => $session->status,
            'zoom_join_url' => $session->zoom_join_url,
            'price' => $session->price_cents !== null
                ? ((float) $session->price_cents / 100)
                : (
                    ($session->program?->base_price_cents ?? null) !== null
                        ? ((float) $session->program->base_price_cents / 100)
                        : $session->program?->price
                ),
            'price_cents' => $session->price_cents ?? $session->program?->base_price_cents,
            'tutor' => $session->tutor ? [
                'id' => (int) $session->tutor->id,
                'name' => $session->tutor->user?->name,
            ] : null,
        ];

        return response()->json(['data' => $data]);
    }

    public function bookingDetail(int $id): JsonResponse
    {
        $booking = Booking::query()
            ->with([
                'participant:id,full_name,email,phone',
                'classSession.program:id,name,price',
                'classSession.tutor.user:id,name',
            ])
            ->whereKey($id)
            ->first();

        if (! $booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        $session = $booking->classSession;
        $data = [
            'id' => (int) $booking->id,
            'status' => (string) $booking->status,
            'payment_status' => $booking->payment_status,
            'paid_at' => optional($booking->paid_at)->toIso8601String(),
            'created_at' => optional($booking->created_at)->toIso8601String(),
            'updated_at' => optional($booking->updated_at)->toIso8601String(),
            'participant' => $booking->participant ? [
                'id' => (int) $booking->participant->id,
                'full_name' => $booking->participant->full_name,
                'email' => $booking->participant->email,
                'phone' => $booking->participant->phone,
            ] : null,
            'class_session' => $session ? [
                'id' => (int) $session->id,
                'program_id' => (int) $session->program_id,
                'program_name' => (string) ($session->program?->name ?? ''),
                'starts_at' => optional($session->starts_at)->toIso8601String(),
                'ends_at' => optional($session->ends_at)->toIso8601String(),
                'mode' => $session->mode,
                'language' => $session->language,
                'venue' => $session->venue,
                'location' => $session->location,
                'trainer_name' => $session->tutor?->user?->name,
                'price' => $session->price_cents !== null
                    ? ((float) $session->price_cents / 100)
                    : (
                        ($session->program?->base_price_cents ?? null) !== null
                            ? ((float) $session->program->base_price_cents / 100)
                            : $session->program?->price
                    ),
                'price_cents' => $session->price_cents ?? $session->program?->base_price_cents,
            ] : null,
            // Backward-friendly key for existing frontend booking page adapter.
            'class_session_id' => $session ? (int) $session->id : null,
        ];

        return response()->json(['data' => $data]);
    }
}
