<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Participant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * Legacy: Registration and payment redirect belong in Go (see docs/ARCHITECTURE_SPLIT.md).
 * Keep this controller until Go implements POST /public/register returning { redirect_url }.
 */
class RegisterForClassController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'nric_passport' => 'required|string|max:255',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'employer_id' => 'nullable|exists:employers,id',
            'class_session_id' => 'required|exists:class_sessions,id',
        ])->validate();

        $participant = Participant::firstOrCreate(
            ['nric_passport' => $validated['nric_passport']],
            [
                'full_name' => $validated['full_name'],
                'phone' => $validated['phone'] ?? null,
                'email' => $validated['email'] ?? null,
                'employer_id' => $validated['employer_id'] ?? null,
            ]
        );

        if ($participant->wasRecentlyCreated === false) {
            $participant->update([
                'full_name' => $validated['full_name'],
                'phone' => $validated['phone'] ?? $participant->phone,
                'email' => $validated['email'] ?? $participant->email,
                'employer_id' => $validated['employer_id'] ?? $participant->employer_id,
            ]);
        }

        $existing = Booking::where('participant_id', $participant->id)
            ->where('class_session_id', $validated['class_session_id'])
            ->first();

        if ($existing) {
            if ($existing->status === 'pending' || $existing->status === 'reserved') {
                // DEPRECATED: Booking-based Stripe checkout disabled.
                // Use reservation -> payment flow instead.
                Log::warning('register.deprecated_stripe_flow', [
                    'participant_id' => (int) $participant->id,
                    'class_session_id' => (int) $validated['class_session_id'],
                    'booking_id' => (int) $existing->id,
                ]);

                return response()->json([
                    'error' => 'This flow is deprecated. Please use reservation-based checkout.',
                ], 410);
            }
            return response()->json(['error' => 'Already registered for this class'], 409);
        }

        // DEPRECATED: Booking-based Stripe checkout disabled.
        // Use reservation -> payment flow instead.
        Log::warning('register.deprecated_stripe_flow', [
            'participant_id' => (int) $participant->id,
            'class_session_id' => (int) $validated['class_session_id'],
        ]);

        return response()->json([
            'error' => 'This flow is deprecated. Please use reservation-based checkout.',
        ], 410);
    }
}
