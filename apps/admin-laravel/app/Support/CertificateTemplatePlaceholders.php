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
        'program_name' => '{program_name}',
        'tutor_name' => '{tutor_name}',
        'tutor_registration_number' => '{tutor_registration_number}',
        'issue_date' => '{issue_date}',
        'certificate_no' => '{certificate_no}',
    ];

    /**
     * Human-readable labels and descriptions for admin UI / documentation.
     */
    public const LABELS = [
        'participant_name' => 'Participant name',
        'program_name' => 'Program name',
        'tutor_name' => 'Tutor / trainer name',
        'tutor_registration_number' => 'Tutor registration / license number',
        'issue_date' => 'Certificate issue date',
        'certificate_no' => 'Certificate number',
    ];

    public const DESCRIPTIONS = [
        'participant_name' => 'Full name of the participant who completed the program.',
        'program_name' => 'Name of the program/class the certificate is for.',
        'tutor_name' => 'Name of the tutor/trainer assigned to the class session.',
        'tutor_registration_number' => 'Tutor’s registration or license ID (from tutor profile).',
        'issue_date' => 'Date the certificate was issued (formatted).',
        'certificate_no' => 'Unique certificate number (e.g. NM-2026-0001).',
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
