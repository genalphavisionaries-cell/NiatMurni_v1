<?php

namespace App\Services;

use App\Models\Certificate;

class CertificateVerificationService
{
    /**
     * Verify a certificate by its verification token. Returns structured data or throws.
     *
     * @return array{certificate_number: string, participant_name: string, course_name: string, issued_at: string|null, status: string}
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function verifyByToken(string $token): array
    {
        $certificate = Certificate::query()
            ->where('verification_token', $token)
            ->with([
                'booking.participant',
                'booking.classSession.program',
            ])
            ->firstOrFail();

        $booking = $certificate->booking;
        $participant = $booking?->participant;
        $program = $booking?->classSession?->program;

        return [
            'certificate_number' => $certificate->certificate_number,
            'participant_name' => $participant?->full_name ?? '—',
            'course_name' => $program?->name ?? '—',
            'issued_at' => $certificate->issued_at?->toIso8601String(),
            'status' => 'valid',
        ];
    }
}
