<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PaymentAdminController extends Controller
{
    public function __construct(private readonly PaymentService $paymentService) {}

    public function index(Request $request): JsonResponse
    {
        $query = Payment::query()
            ->with(['reservation', 'booking'])
            ->where('provider', Payment::PROVIDER_MANUAL)
            ->latest('id');

        if ($request->filled('status')) {
            $query->where('status', (string) $request->status);
        }

        $perPage = min(max((int) $request->get('per_page', 20), 1), 100);
        return response()->json($query->paginate($perPage));
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        /** @var Payment $payment */
        $payment = Payment::query()->findOrFail($id);

        if ((string) $payment->provider !== Payment::PROVIDER_MANUAL) {
            throw ValidationException::withMessages([
                'payment_id' => ['Only manual payments can be approved here.'],
            ]);
        }

        if ((string) $payment->status !== Payment::STATUS_PENDING && (string) $payment->status !== Payment::STATUS_PAID) {
            throw ValidationException::withMessages([
                'payment_id' => ['Payment is not in pending state.'],
            ]);
        }

        $reservationId = (int) $payment->reservation_id;
        if ($reservationId <= 0) {
            throw ValidationException::withMessages([
                'payment_id' => ['Manual payment is missing reservation reference.'],
            ]);
        }

        $result = $this->paymentService->handleManualPayment($reservationId);

        $payment->refresh();
        if ((string) $payment->status !== Payment::STATUS_PAID) {
            $payment->update([
                'status' => Payment::STATUS_PAID,
                'paid_at' => now(),
            ]);
        }

        Log::info('manual_payment.approved', [
            'payment_id' => $payment->id,
            'reservation_id' => $reservationId,
            'booking_id' => $result['booking_id'],
            'idempotent' => $result['idempotent'],
        ]);

        return response()->json([
            'message' => 'Manual payment approved.',
            'data' => $result,
        ]);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['nullable', 'string'],
        ]);

        /** @var Payment $payment */
        $payment = Payment::query()->findOrFail($id);
        if ((string) $payment->provider !== Payment::PROVIDER_MANUAL) {
            throw ValidationException::withMessages([
                'payment_id' => ['Only manual payments can be rejected here.'],
            ]);
        }
        if ((string) $payment->status !== Payment::STATUS_PENDING) {
            throw ValidationException::withMessages([
                'payment_id' => ['Only pending manual payments can be rejected.'],
            ]);
        }

        $payment->update([
            'status' => Payment::STATUS_FAILED,
            'admin_note' => $validated['reason'] ?? null,
        ]);

        Log::info('manual_payment.rejected', [
            'payment_id' => $payment->id,
            'reservation_id' => $payment->reservation_id,
            'reason' => $validated['reason'] ?? null,
        ]);

        return response()->json([
            'message' => 'Manual payment rejected.',
        ]);
    }
}
