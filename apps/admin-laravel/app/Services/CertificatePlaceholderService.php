<?php

namespace App\Services;

use App\Models\Certificate;
use App\Models\CertificateTemplate;
use App\Support\CertificateTemplatePlaceholders;

/**
 * Builds placeholder values for certificate PDF rendering.
 * Sources: certificate, booking, participant, class session, program, tutor, and template (for org fields).
 */
class CertificatePlaceholderService
{
    /**
     * Build a map of placeholder string => value for a certificate.
     * Keys are the exact placeholder strings (e.g. '{participant_name}').
     * Missing or unavailable data is replaced with a safe fallback (e.g. '—' or '').
     *
     * @return array<string, string>
     */
    public function buildPlaceholders(Certificate $certificate, ?CertificateTemplate $template = null): array
    {
        $certificate->loadMissing([
            'booking.participant',
            'booking.classSession.program',
            'booking.classSession.tutor.user',
        ]);

        $booking = $certificate->booking;
        $participant = $booking?->participant;
        $classSession = $booking?->classSession;
        $program = $classSession?->program;
        $tutor = $classSession?->tutor;

        $issueDate = $certificate->issued_at?->format('d M Y') ?? '—';
        $verificationUrl = $this->buildVerificationUrl($certificate);

        $values = [
            CertificateTemplatePlaceholders::PLACEHOLDERS['participant_name'] =>
                $participant?->full_name ?? '—',
            CertificateTemplatePlaceholders::PLACEHOLDERS['participant_identity_no'] =>
                $participant?->nric_passport ?? '—',
            CertificateTemplatePlaceholders::PLACEHOLDERS['program_name'] =>
                $program?->name ?? '—',
            CertificateTemplatePlaceholders::PLACEHOLDERS['attendance_date'] =>
                $this->resolveAttendanceDate($certificate),
            CertificateTemplatePlaceholders::PLACEHOLDERS['completion_status'] =>
                'Attended & Passed',
            CertificateTemplatePlaceholders::PLACEHOLDERS['tutor_name'] =>
                $tutor?->user?->name ?? '—',
            CertificateTemplatePlaceholders::PLACEHOLDERS['tutor_registration_number'] =>
                $tutor?->registration_number ?? '—',
            CertificateTemplatePlaceholders::PLACEHOLDERS['issue_date'] =>
                $issueDate,
            CertificateTemplatePlaceholders::PLACEHOLDERS['certificate_no'] =>
                $certificate->certificate_number ?? '—',
            CertificateTemplatePlaceholders::PLACEHOLDERS['verification_url'] =>
                $verificationUrl,
            CertificateTemplatePlaceholders::PLACEHOLDERS['organization_name'] =>
                $template?->organization_name ?? '',
            CertificateTemplatePlaceholders::PLACEHOLDERS['organization_registration_no'] =>
                $template?->organization_registration_no ?? '',
        ];

        return $values;
    }

    /**
     * Verification URL used for QR code and {verification_url} placeholder.
     * Same pattern as existing CertificatePdfService and CertificateService (qr_code path).
     */
    public function buildVerificationUrl(Certificate $certificate): string
    {
        $base = rtrim((string) config('app.url'), '/');
        $path = $certificate->qr_code ?? '/certificate/verify/' . $certificate->verification_token;

        return $base . $path;
    }

    /**
     * Resolve the most appropriate attendance/session date for display.
     * Order: class session starts_at → booking completed_at → certificate issued_at.
     */
    private function resolveAttendanceDate(Certificate $certificate): string
    {
        $booking = $certificate->booking;
        $classSession = $booking?->classSession;

        if ($classSession?->starts_at) {
            return $classSession->starts_at->format('d M Y');
        }
        if ($booking?->completed_at) {
            return $booking->completed_at->format('d M Y');
        }
        if ($certificate->issued_at) {
            return $certificate->issued_at->format('d M Y');
        }

        return '—';
    }

    /**
     * Replace all known placeholders in a string with values from the map.
     * Unknown placeholders are left unchanged.
     */
    public function replacePlaceholders(string $text, array $placeholderMap): string
    {
        if ($text === '') {
            return '';
        }

        return strtr($text, $placeholderMap);
    }
}
