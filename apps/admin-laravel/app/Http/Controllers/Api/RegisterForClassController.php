<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Participant;
use App\Services\StripeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Legacy: Registration and payment redirect belong in Go (see docs/ARCHITECTURE_SPLIT.md).
 * Keep this controller until Go implements POST /public/register returning { redirect_url }.
 */
class RegisterForClassController extends Controller
{
    public function __invoke(Request $request, StripeService $stripe): JsonResponse
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
                try {
                    $url = $stripe->createCheckoutSession($existing);
                    return response()->json(['redirect_url' => $url]);
                } catch (\Throwable $e) {
                    return response()->json(['error' => 'Could not create payment session'], 500);
                }
            }
            return response()->json(['error' => 'Already registered for this class'], 409);
        }

        $booking = Booking::create([
            'participant_id' => $participant->id,
            'class_session_id' => $validated['class_session_id'],
            'status' => 'pending',
        ]);

        try {
            $url = $stripe->createCheckoutSession($booking);
            return response()->json(['redirect_url' => $url]);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Could not create payment session'], 500);
        }
    }
}
