<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Certificate;
use Illuminate\Support\Str;

class CertificateService
{
    /**
     * Generate a unique certificate number (non-sequential).
     */
    public function generateCertificateNumber(): string
    {
        $prefix = 'NM';
        do {
            $suffix = strtoupper(Str::random(8));
            $number = $prefix . '-' . $suffix;
        } while (Certificate::where('certificate_number', $number)->exists());

        return $number;
    }

    /**
     * Generate a unique QR token for public verification URL.
     */
    public function generateQrToken(): string
    {
        do {
            $token = Str::random(32);
        } while (Certificate::where('qr_token', $token)->exists());

        return $token;
    }

    /**
     * Issue a certificate for a booking. Booking must be in status 'completed'.
     * Creates certificate, sets booking to certified.
     */
    public function issueForBooking(Booking $booking): ?Certificate
    {
        if ($booking->status !== 'completed') {
            return null;
        }
        if ($booking->certificate()->exists()) {
            return $booking->certificate;
        }

        $certificate = Certificate::create([
            'booking_id' => $booking->id,
            'certificate_number' => $this->generateCertificateNumber(),
            'qr_token' => $this->generateQrToken(),
            'status' => 'valid',
            'issued_at' => now(),
        ]);

        $booking->update([
            'status' => 'certified',
            'certified_at' => now(),
        ]);

        return $certificate;
    }
}
