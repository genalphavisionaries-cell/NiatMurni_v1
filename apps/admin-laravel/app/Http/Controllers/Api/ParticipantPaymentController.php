<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Participant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParticipantPaymentController extends Controller
{
    /**
     * GET /api/participant/payments
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user || $user->role !== 'participant') {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $participant = Participant::query()->where('user_id', $user->id)->first();
        if (! $participant) {
            return response()->json(['message' => 'Participant profile not found'], 403);
        }

        $payments = $participant->bookings()
            ->with('payments')
            ->get()
            ->flatMap(fn ($booking) => $booking->payments)
            ->sortByDesc('id')
            ->values()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'amount' => ((int) ($payment->amount_cents ?? 0)) / 100,
                    'status' => (string) ($payment->status ?? 'pending'),
                    'payment_date' => optional($payment->paid_at ?? $payment->created_at)->toDateString(),
                    'receipt_url' => $payment->receipt_url,
                ];
            })
            ->all();

        return response()->json($payments);
    }
}

