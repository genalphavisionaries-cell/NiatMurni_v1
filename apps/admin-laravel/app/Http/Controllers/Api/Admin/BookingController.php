<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClassSession;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Booking::query()
            ->with([
                'participant:id,full_name,nric_passport,phone,email,employer_id',
                'participant.employer:id,name',
                'reservation:id,seats_reserved',
                'activePayment:id,booking_id,provider,method,status,amount_cents,receipt_url,paid_at',
                'classSession:id,program_id,tutor_id,starts_at',
                'classSession.program:id,name',
                'classSession.tutor:id,user_id',
                'classSession.tutor.user:id,name',
                'certificate:id,booking_id,status,certificate_number,pdf_path',
                'latestTutorEarning:id,booking_id,status',
            ])
            ->orderBy('created_at', 'desc');
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('payment_status')) {
            $query->whereHas('payments', function ($q) use ($request): void {
                $q->where('status', (string) $request->payment_status);
            });
        }
        if ($request->filled('payment_method')) {
            $provider = (string) $request->payment_method === 'manual' ? 'manual' : 'stripe';
            $query->whereHas('payments', function ($q) use ($provider): void {
                $q->where('provider', $provider);
            });
        }
        if ($request->filled('class_session_id')) {
            $query->where('class_session_id', $request->class_session_id);
        }
        if ($request->filled('participant_id')) {
            $query->where('participant_id', $request->participant_id);
        }
        if ($request->filled('search')) {
            $term = (string) $request->search;
            $op = DB::getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';
            $query->whereHas('participant', function ($q) use ($term, $op): void {
                $like = "%{$term}%";
                $q->where('full_name', $op, $like)
                    ->orWhere('nric_passport', $op, $like)
                    ->orWhere('phone', $op, $like);
            });
        }
        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }
        $perPage = (int) $request->get('per_page', 15);
        $perPage = min(max($perPage, 1), 100);
        $bookings = $query->paginate($perPage);

        $bookings->getCollection()->transform(function (Booking $booking): Booking {
            $reservation = $booking->reservation;
            $booking->setAttribute('seat_count', (int) ($reservation->seats_reserved ?? 1));

            $activePayment = $booking->activePayment;
            $booking->setAttribute('active_payment', $activePayment);

            $booking->setAttribute('payment_status', $activePayment?->status ?? $booking->payment_status);
            $booking->setAttribute(
                'payment_amount',
                $activePayment?->amount_cents !== null
                    ? number_format(((float) $activePayment->amount_cents / 100), 2, '.', '')
                    : $booking->payment_amount
            );

            if ($booking->classSession instanceof ClassSession) {
                $trainerUser = $booking->classSession->tutor?->user;
                $booking->classSession->setAttribute('trainer_id', $trainerUser?->id);
                if ($trainerUser) {
                    $booking->classSession->setRelation('trainer', $trainerUser);
                }
            }

            $latestEarning = $booking->latestTutorEarning;
            $booking->setAttribute('tutor_earning_status', $latestEarning?->status);

            return $booking;
        });

        return response()->json($bookings);
    }

    public function show(Booking $booking): JsonResponse
    {
        $booking->load([
            'participant:id,full_name,nric_passport,phone,email,employer_id',
            'participant.employer:id,name',
            'reservation:id,seats_reserved',
            'payments',
            'activePayment:id,booking_id,provider,method,status,amount_cents,receipt_url,paid_at',
            'classSession:id,program_id,tutor_id,starts_at',
            'classSession.program:id,name',
            'classSession.tutor:id,user_id',
            'classSession.tutor.user:id,name',
            'certificate:id,booking_id,status,certificate_number,pdf_path',
            'latestTutorEarning:id,booking_id,status',
        ]);

        $reservation = $booking->reservation;
        $booking->setAttribute('seat_count', (int) ($reservation->seats_reserved ?? 1));

        $activePayment = $booking->activePayment ?? $booking->payments->sortByDesc('id')->first();
        $booking->setAttribute('active_payment', $activePayment);

        $booking->setAttribute('payment_status', $activePayment?->status ?? $booking->payment_status);
        $booking->setAttribute(
            'payment_amount',
            $activePayment?->amount_cents !== null
                ? number_format(((float) $activePayment->amount_cents / 100), 2, '.', '')
                : $booking->payment_amount
        );

        if ($booking->classSession instanceof ClassSession) {
            $trainerUser = $booking->classSession->tutor?->user;
            $booking->classSession->setAttribute('trainer_id', $trainerUser?->id);
            if ($trainerUser) {
                $booking->classSession->setRelation('trainer', $trainerUser);
            }
        }

        $latestEarning = $booking->latestTutorEarning;
        $booking->setAttribute('tutor_earning_status', $latestEarning?->status);

        return response()->json($booking);
    }

    public function update(Request $request, Booking $booking): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'string|in:pending,confirmed,paid,cancelled,completed,no_show',
            'payment_status' => 'string|in:pending,paid,failed,refunded',
        ]);
        $booking->update($validated);
        $booking->load(['participant', 'classSession.program', 'classSession.trainer']);
        return response()->json($booking);
    }

    /**
     * Admin action endpoint (POST) for updating booking status.
     *
     * UI calls POST /api/admin/bookings/{booking}/status.
     */
    public function status(Request $request, Booking $booking): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,confirmed,paid,cancelled,completed,no_show',
        ]);

        $booking->update([
            'status' => (string) $validated['status'],
        ]);

        $booking->load([
            'participant:id,full_name,nric_passport,phone,email,employer_id',
            'participant.employer:id,name',
            'reservation:id,seats_reserved',
            'activePayment:id,booking_id,provider,method,status,amount_cents,receipt_url,paid_at',
            'classSession:id,program_id,tutor_id,starts_at',
            'classSession.program:id,name',
            'classSession.tutor:id,user_id',
            'classSession.tutor.user:id,name',
            'certificate:id,booking_id,status,certificate_number,pdf_path',
            'latestTutorEarning:id,booking_id,status',
        ]);

        $reservation = $booking->reservation;
        $booking->setAttribute('seat_count', (int) ($reservation->seats_reserved ?? 1));

        $activePayment = $booking->activePayment;
        $booking->setAttribute('active_payment', $activePayment);
        $booking->setAttribute('payment_status', $activePayment?->status ?? $booking->payment_status);
        $booking->setAttribute(
            'payment_amount',
            $activePayment?->amount_cents !== null
                ? number_format(((float) $activePayment->amount_cents / 100), 2, '.', '')
                : $booking->payment_amount
        );

        if ($booking->classSession instanceof ClassSession) {
            $trainerUser = $booking->classSession->tutor?->user;
            $booking->classSession->setAttribute('trainer_id', $trainerUser?->id);
            if ($trainerUser) {
                $booking->classSession->setRelation('trainer', $trainerUser);
            }
        }

        $latestEarning = $booking->latestTutorEarning;
        $booking->setAttribute('tutor_earning_status', $latestEarning?->status);

        return response()->json($booking);
    }
}
