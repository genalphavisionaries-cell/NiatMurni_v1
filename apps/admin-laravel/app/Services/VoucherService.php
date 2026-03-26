<?php

namespace App\Services;

use App\Models\Voucher;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class VoucherService
{
    public function validateVoucher(string $code, int $classSessionId, int $seatCount): Voucher
    {
        $voucher = Voucher::query()
            ->whereRaw('LOWER(code) = ?', [mb_strtolower(trim($code))])
            ->first();

        if (! $voucher) {
            throw ValidationException::withMessages([
                'code' => ['Voucher code is invalid.'],
            ]);
        }

        if ($voucher->status !== Voucher::STATUS_ACTIVE) {
            throw ValidationException::withMessages([
                'code' => ['Voucher is inactive.'],
            ]);
        }

        $now = Carbon::now();
        if ($voucher->valid_from && $now->lt($voucher->valid_from)) {
            throw ValidationException::withMessages([
                'code' => ['Voucher is not valid yet.'],
            ]);
        }
        if ($voucher->valid_until && $now->gt($voucher->valid_until)) {
            throw ValidationException::withMessages([
                'code' => ['Voucher has expired.'],
            ]);
        }

        if ($voucher->max_uses !== null && $voucher->used_count >= (int) $voucher->max_uses) {
            throw ValidationException::withMessages([
                'code' => ['Voucher usage limit reached.'],
            ]);
        }

        if ($voucher->min_seats !== null && $seatCount < (int) $voucher->min_seats) {
            throw ValidationException::withMessages([
                'code' => ['Voucher requires higher minimum seats.'],
            ]);
        }

        if ($voucher->applicable_class_session_id !== null && (int) $voucher->applicable_class_session_id !== $classSessionId) {
            throw ValidationException::withMessages([
                'code' => ['Voucher is not applicable for this class session.'],
            ]);
        }

        return $voucher;
    }

    public function calculateDiscount(Voucher $voucher, float $courseAmount, float $deliveryFee): float
    {
        if ($voucher->type === Voucher::TYPE_FIXED) {
            return round(min((float) ($voucher->value ?? 0), $courseAmount), 2);
        }

        if ($voucher->type === Voucher::TYPE_PERCENTAGE) {
            $discount = ((float) ($voucher->value ?? 0) / 100) * $courseAmount;
            return round($discount, 2);
        }

        if ($voucher->type === Voucher::TYPE_FREE_DELIVERY) {
            return round($deliveryFee, 2);
        }

        return 0.0;
    }
}

