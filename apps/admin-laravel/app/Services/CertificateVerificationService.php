<?php

namespace App\Services;

use App\Models\Certificate;

class CertificateVerificationService
{
    /**
     * Verify a certificate by its verification token. Returns full data contract for verification page/API.
     *
     * @return array{
     *   certificate_number: string,
     *   participant_name: string,
     *   participant_identity_no: string,
     *   program_name: string,
     *   attendance_date: string,
     *   completion_status: string,
     *   tutor_name: string,
     *   tutor_registration_number: string,
     *   issue_date: string|null,
     *   issued_at: string|null,
     *   status: string,
     *   revoked_at: string|null,
     *   revoked_reason: string|null
     * }
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function verifyByToken(string $token): array
    {
        $certificate = Certificate::query()
            ->where('verification_token', $token)
            ->with([
                'booking.participant',
                'booking.classSession.program',
                'booking.classSession.tutor.user',
            ])
            ->firstOrFail();

        $booking = $certificate->booking;
        $participant = $booking?->participant;
        $classSession = $booking?->classSession;
        $program = $classSession?->program;
        $tutor = $classSession?->tutor;

        $attendanceDate = $classSession?->starts_at
            ? $classSession->starts_at->format('Y-m-d')
            : ($booking?->completed_at?->format('Y-m-d') ?? $certificate->issued_at?->format('Y-m-d') ?? null);

        $base = [
            'certificate_number' => $certificate->certificate_number,
            'participant_name' => $participant?->full_name ?? '—',
            'participant_identity_no' => $participant?->nric_passport ?? '—',
            'program_name' => $program?->name ?? '—',
            'attendance_date' => $attendanceDate ?? '—',
            'completion_status' => 'Attended & Passed',
            'tutor_name' => $tutor?->user?->name ?? '—',
            'tutor_registration_number' => $tutor?->registration_number ?? '—',
            'issue_date' => $certificate->issued_at?->format('d F Y'),
            'issued_at' => $certificate->issued_at?->toIso8601String(),
            'status' => $certificate->status === 'revoked' ? 'revoked' : 'valid',
            'revoked_at' => $certificate->revoked_at?->toIso8601String(),
            'revoked_reason' => $certificate->revoked_reason ?? null,
        ];

        return $base;
    }
}
