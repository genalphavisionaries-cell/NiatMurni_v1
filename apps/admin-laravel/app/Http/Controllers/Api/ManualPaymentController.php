<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ManualPaymentController extends Controller
{
    public function uploadReceipt(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reservation_id' => ['required', 'integer', 'exists:reservations,id'],
            'receipt_file' => ['required', 'file', 'max:5120', 'mimes:jpg,jpeg,png,pdf,webp'],
        ]);

        $reservationId = (int) $validated['reservation_id'];
        $file = $request->file('receipt_file');
        $ext = (string) $file->getClientOriginalExtension();
        $fileName = now()->format('YmdHis') . '-' . Str::random(8) . ($ext ? ".{$ext}" : '');
        $path = $file->storeAs("receipts/{$reservationId}", $fileName, 'public');
        $receiptUrl = Storage::disk('public')->url($path);

        /** @var Reservation $reservation */
        $reservation = Reservation::query()->findOrFail($reservationId);
        $pending = Payment::query()
            ->where('provider', Payment::PROVIDER_MANUAL)
            ->where('reservation_id', $reservationId)
            ->where('status', Payment::STATUS_PENDING)
            ->orderByDesc('id')
            ->first();

        if ($pending) {
            $pending->update(['receipt_url' => $receiptUrl]);
        } else {
            Payment::query()->create([
                'reservation_id' => $reservationId,
                'provider' => Payment::PROVIDER_MANUAL,
                'method' => Payment::METHOD_BANK_TRANSFER,
                'amount_cents' => (int) round((float) ($reservation->total_amount ?? 0) * 100),
                'currency' => 'myr',
                'status' => Payment::STATUS_PENDING,
                'receipt_url' => $receiptUrl,
                'provider_payload' => ['source' => 'manual_upload_receipt'],
            ]);
        }

        Log::info('manual_payment.uploaded', [
            'reservation_id' => $reservationId,
            'receipt_url' => $receiptUrl,
        ]);

        return response()->json([
            'receipt_url' => $receiptUrl,
        ]);
    }

    public function submit(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reservation_id' => ['required', 'integer', 'exists:reservations,id'],
            'method' => ['required', 'string', 'in:bank_transfer,qr,cash'],
            'receipt_url' => ['nullable', 'string', 'max:2048'],
        ]);

        /** @var Reservation $reservation */
        $reservation = Reservation::query()->findOrFail((int) $validated['reservation_id']);

        $alreadyPaid = Payment::query()
            ->where(function ($q) use ($reservation): void {
                $q->where('reservation_id', $reservation->id);
                if ($reservation->converted_booking_id) {
                    $q->orWhere('booking_id', $reservation->converted_booking_id);
                }
            })
            ->where('status', Payment::STATUS_PAID)
            ->exists();

        if ($alreadyPaid) {
            throw ValidationException::withMessages([
                'reservation_id' => ['Reservation is already paid.'],
            ]);
        }

        $amountCents = (int) round((float) ($reservation->total_amount ?? 0) * 100);
        if ($amountCents <= 0) {
            throw ValidationException::withMessages([
                'reservation_id' => ['Reservation amount is invalid.'],
            ]);
        }

        $pending = Payment::query()
            ->where('provider', Payment::PROVIDER_MANUAL)
            ->where('reservation_id', $reservation->id)
            ->where('status', Payment::STATUS_PENDING)
            ->orderByDesc('id')
            ->first();

        if ($pending) {
            $pending->update([
                'method' => (string) $validated['method'],
                'receipt_url' => $validated['receipt_url'] ?? $pending->receipt_url,
                'amount_cents' => $amountCents,
                'currency' => (string) ($pending->currency ?: 'myr'),
            ]);
        } else {
            Payment::query()->create([
                'reservation_id' => $reservation->id,
                'provider' => Payment::PROVIDER_MANUAL,
                'method' => (string) $validated['method'],
                'amount_cents' => $amountCents,
                'currency' => 'myr',
                'status' => Payment::STATUS_PENDING,
                'receipt_url' => $validated['receipt_url'] ?? null,
                'provider_payload' => ['source' => 'manual_submit'],
            ]);
        }

        $reservation->update([
            'status' => Reservation::LEGACY_STATUS_PENDING_PAYMENT_REVIEW,
        ]);

        Log::info('manual_payment.submitted', [
            'reservation_id' => $reservation->id,
            'method' => (string) $validated['method'],
        ]);

        return response()->json([
            'message' => 'Manual payment submitted successfully.',
        ]);
    }
}
