<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Participant;
use App\Services\ParticipantAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ParticipantController extends Controller
{
    public function __construct(
        private readonly ParticipantAuthService $participantAuthService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $query = Participant::query()->orderByDesc('created_at');
        if ($request->filled('search')) {
            $q = trim((string) $request->search);
            $query->where(function ($qry) use ($q) {
                $qry->where('full_name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('nric_passport', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%");
            });
        }
        $perPage = (int) $request->get('per_page', 15);
        $perPage = min(max($perPage, 1), 100);
        $participants = $query->paginate($perPage)->through(function (Participant $participant) {
            return [
                'id' => $participant->id,
                'full_name' => $participant->full_name,
                'email' => $participant->email,
                'phone' => $participant->phone,
                'identity_no' => $participant->nric_passport,
                'created_at' => optional($participant->created_at)->toIso8601String(),
            ];
        });

        return response()->json($participants);
    }

    public function show(Participant $participant): JsonResponse
    {
        $participant->load([
            'employer',
            'bookings.classSession.program',
            'bookings.activePayment',
            'bookings.certificate',
        ]);

        $bookings = $participant->bookings->map(function ($booking) {
            return [
                'id' => $booking->id,
                'class_name' => $booking->classSession?->program?->name,
                'status' => $booking->status,
                'payment_status' => $booking->payment_status,
                'created_at' => optional($booking->created_at)->toIso8601String(),
            ];
        })->values()->all();

        $payments = $participant->bookings
            ->map(fn ($booking) => $booking->activePayment)
            ->filter()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'amount' => ((int) ($payment->amount_cents ?? 0)) / 100,
                    'status' => $payment->status,
                    'payment_date' => optional($payment->paid_at ?? $payment->created_at)->toIso8601String(),
                    'receipt_url' => $payment->receipt_url,
                ];
            })->values()->all();

        $certificates = $participant->bookings
            ->map(fn ($booking) => $booking->certificate)
            ->filter()
            ->map(function ($certificate) {
                return [
                    'id' => $certificate->id,
                    'certificate_number' => $certificate->certificate_number,
                    'issue_date' => optional($certificate->issued_at)->toIso8601String(),
                    'status' => $certificate->status,
                ];
            })->values()->all();

        return response()->json([
            'profile' => [
                'id' => $participant->id,
                'full_name' => $participant->full_name,
                'identity_no' => $participant->nric_passport,
                'email' => $participant->email,
                'phone' => $participant->phone,
                'employer' => $participant->employer ? [
                    'id' => $participant->employer->id,
                    'name' => $participant->employer->name,
                ] : null,
                'created_at' => optional($participant->created_at)->toIso8601String(),
            ],
            'bookings' => $bookings,
            'payments' => $payments,
            'certificates' => $certificates,
        ]);
    }

    public function resetPassword(int $id): JsonResponse
    {
        $participant = Participant::query()->find($id);
        if (! $participant) {
            return response()->json(['message' => 'Participant not found.'], 404);
        }

        $user = $participant->user;
        if (! $user) {
            return response()->json(['message' => 'Participant account is not linked to a user.'], 422);
        }

        $tempPassword = Str::random(12);
        $user->update([
            'password' => Hash::make($tempPassword),
            'is_active' => true,
        ]);
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Temporary password generated successfully.',
            'temp_password' => $tempPassword,
            'participant_id' => $participant->id,
        ]);
    }

    public function resendVerification(int $id): JsonResponse
    {
        $participant = Participant::query()->find($id);
        if (! $participant) {
            return response()->json(['message' => 'Participant not found.'], 404);
        }

        $user = $participant->user;
        if (! $user) {
            return response()->json(['message' => 'Participant account is not linked to a user.'], 422);
        }

        $this->participantAuthService->requestFirstTimeLogin(
            $user->email ?: $participant->email,
            $user->phone ?: $participant->phone
        );

        return response()->json([
            'message' => 'First-time login verification resent.',
            'participant_id' => $participant->id,
        ]);
    }

    public function disable(int $id): JsonResponse
    {
        $participant = Participant::query()->find($id);
        if (! $participant) {
            return response()->json(['message' => 'Participant not found.'], 404);
        }

        $user = $participant->user;
        if (! $user) {
            return response()->json(['message' => 'Participant account is not linked to a user.'], 422);
        }

        $user->update(['is_active' => false]);
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Participant account disabled successfully.',
            'participant_id' => $participant->id,
        ]);
    }
}
