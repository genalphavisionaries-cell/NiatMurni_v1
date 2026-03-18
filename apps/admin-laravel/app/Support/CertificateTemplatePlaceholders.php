<?php

namespace App\Support;

class CertificateTemplatePlaceholders
{
    /**
     * Allowed placeholders for phase 1 certificate template body/footer content.
     * Use these exact strings in template text; they will be replaced at render time.
     */
    public const PLACEHOLDERS = [
        'participant_name' => '{participant_name}',
        'participant_identity_no' => '{participant_identity_no}',
        'program_name' => '{program_name}',
        'attendance_date' => '{attendance_date}',
        'completion_status' => '{completion_status}',
        'tutor_name' => '{tutor_name}',
        'tutor_registration_number' => '{tutor_registration_number}',
        'issue_date' => '{issue_date}',
        'certificate_no' => '{certificate_no}',
        'verification_url' => '{verification_url}',
        'organization_name' => '{organization_name}',
        'organization_registration_no' => '{organization_registration_no}',
    ];

    /**
     * Human-readable labels and descriptions for admin UI / documentation.
     */
    public const LABELS = [
        'participant_name' => 'Participant name',
        'participant_identity_no' => 'NRIC / Passport number',
        'program_name' => 'Program name',
        'attendance_date' => 'Attendance / session date',
        'completion_status' => 'Completion status',
        'tutor_name' => 'Tutor / trainer name',
        'tutor_registration_number' => 'Tutor registration / license number',
        'issue_date' => 'Certificate issue date',
        'certificate_no' => 'Certificate number',
        'verification_url' => 'Verification URL',
        'organization_name' => 'Organization / academy name',
        'organization_registration_no' => 'Organization registration number',
    ];

    public const DESCRIPTIONS = [
        'participant_name' => 'Full name of the participant who completed the program.',
        'participant_identity_no' => 'Participant’s full NRIC or Passport number (not masked).',
        'program_name' => 'Name of the program/class the certificate is for.',
        'attendance_date' => 'Date the participant attended the class / session.',
        'completion_status' => 'Text describing completion, e.g. “Attended & Passed”.',
        'tutor_name' => 'Name of the tutor/trainer assigned to the class session.',
        'tutor_registration_number' => 'Tutor’s registration or license ID (from tutor profile).',
        'issue_date' => 'Date the certificate was issued (formatted).',
        'certificate_no' => 'Unique certificate number (e.g. NM-2026-0001).',
        'verification_url' => 'Full URL where the certificate can be verified online.',
        'organization_name' => 'Official name of the academy / organization issuing the certificate.',
        'organization_registration_no' => 'Company / academy registration number as registered with authorities.',
    ];

    /**
     * Return all placeholders with their labels and descriptions.
     *
     * @return array<string, array{placeholder: string, label: string, description: string}>
     */
    public static function all(): array
    {
        $result = [];
        foreach (array_keys(self::PLACEHOLDERS) as $key) {
            $result[$key] = [
                'placeholder' => self::PLACEHOLDERS[$key],
                'label' => self::LABELS[$key],
                'description' => self::DESCRIPTIONS[$key] ?? '',
            ];
        }
        return $result;
    }

    /**
     * Return the list of raw placeholder strings (for validation or replacement).
     *
     * @return array<string>
     */
    public static function placeholderStrings(): array
    {
        return array_values(self::PLACEHOLDERS);
    }

    /**
     * Check if a string is a known placeholder.
     */
    public static function isKnownPlaceholder(string $value): bool
    {
        return in_array($value, self::PLACEHOLDERS, true);
    }
}
