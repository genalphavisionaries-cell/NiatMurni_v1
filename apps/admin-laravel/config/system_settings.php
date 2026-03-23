<?php

/**
 * System Settings (Settings → System) — schema only. Values live in `settings` (group + key).
 *
 * Storage: group = tab id (e.g. general, security). key = field name (snake_case).
 * Sensitive fields: encrypt => true (stored with Laravel Crypt).
 *
 * @see App\Filament\Pages\SystemSettings
 */
return [
    'timezone_options' => [
        'Asia/Kuala_Lumpur' => 'Asia/Kuala_Lumpur (MY)',
        'Asia/Singapore' => 'Asia/Singapore',
        'Asia/Jakarta' => 'Asia/Jakarta',
        'Asia/Bangkok' => 'Asia/Bangkok',
        'Asia/Manila' => 'Asia/Manila',
        'Asia/Hong_Kong' => 'Asia/Hong Kong',
        'Asia/Tokyo' => 'Asia/Tokyo',
        'Australia/Sydney' => 'Australia/Sydney',
        'Europe/London' => 'Europe/London',
        'UTC' => 'UTC',
    ],

    'tabs' => [
        'general' => [
            'label' => 'General',
            'group' => 'general',
            'visible' => true,
            'sections' => [
                'Organisation' => [
                    'platform_name' => [
                        'type' => 'text', 'label' => 'Platform name', 'default' => 'Niat Murni Academy',
                        'helper' => 'Shown in admin and system emails.',
                        'rules' => ['nullable', 'string', 'max:255'],
                    ],
                    'company_name' => [
                        'type' => 'text', 'label' => 'Legal / company name', 'default' => '',
                        'rules' => ['nullable', 'string', 'max:255'],
                    ],
                    'registration_number' => [
                        'type' => 'text', 'label' => 'Business registration number (SSM)', 'default' => '',
                        'rules' => ['nullable', 'string', 'max:100'],
                    ],
                ],
                'Support & locale' => [
                    'support_email' => [
                        'type' => 'text', 'label' => 'Support email', 'default' => '',
                        'helper' => 'Public-facing support address.',
                        'rules' => ['nullable', 'email', 'max:255'],
                    ],
                    'support_phone' => [
                        'type' => 'text', 'label' => 'Support phone', 'default' => '',
                        'rules' => ['nullable', 'string', 'max:50'],
                    ],
                    'timezone' => [
                        'type' => 'select', 'label' => 'Default timezone',
                        'options' => 'timezone_options',
                        'default' => 'Asia/Kuala_Lumpur',
                        'rules' => ['nullable', 'string', 'max:64'],
                    ],
                    'default_language' => [
                        'type' => 'select', 'label' => 'Default language',
                        'options' => ['en' => 'English', 'bm' => 'Bahasa Melayu'],
                        'default' => 'en',
                        'rules' => ['nullable', 'in:en,bm'],
                    ],
                    'currency' => [
                        'type' => 'text', 'label' => 'Currency code', 'default' => 'MYR',
                        'helper' => 'ISO 4217 (e.g. MYR, SGD).',
                        'rules' => ['nullable', 'string', 'max:10'],
                    ],
                ],
                'Maintenance' => [
                    'maintenance_mode' => [
                        'type' => 'toggle', 'label' => 'Maintenance mode', 'default' => false,
                        'helper' => 'When enabled, public site behaviour depends on your frontend implementation.',
                    ],
                    'maintenance_message' => [
                        'type' => 'textarea', 'label' => 'Maintenance message', 'default' => '',
                        'rules' => ['nullable', 'string', 'max:2000'],
                    ],
                ],
            ],
        ],

        'security' => [
            'label' => 'Security',
            'group' => 'security',
            'visible' => 'super_admin_only',
            'sections' => [
                'Authentication' => [
                    'allow_login_with_email' => [
                        'type' => 'toggle', 'label' => 'Allow login with email', 'default' => true,
                    ],
                    'password_min_length' => [
                        'type' => 'number', 'label' => 'Minimum password length', 'default' => 8,
                        'rules' => ['nullable', 'integer', 'min:6', 'max:128'],
                    ],
                    'require_strong_password' => [
                        'type' => 'toggle', 'label' => 'Require strong password', 'default' => false,
                        'helper' => 'Requires mix of letters, numbers, and symbols (when enforced server-side).',
                    ],
                ],
                'Session & lockout' => [
                    'session_timeout_minutes' => [
                        'type' => 'number', 'label' => 'Session timeout (minutes)', 'default' => 120,
                        'rules' => ['nullable', 'integer', 'min:5', 'max:10080'],
                    ],
                    'max_login_attempts' => [
                        'type' => 'number', 'label' => 'Max login attempts before lockout', 'default' => 5,
                        'rules' => ['nullable', 'integer', 'min:1', 'max:50'],
                    ],
                    'lockout_duration_minutes' => [
                        'type' => 'number', 'label' => 'Lockout duration (minutes)', 'default' => 15,
                        'rules' => ['nullable', 'integer', 'min:1', 'max:1440'],
                    ],
                ],
                'Policies' => [
                    'require_email_verification' => [
                        'type' => 'toggle', 'label' => 'Require email verification', 'default' => false,
                    ],
                    'allow_password_reset' => [
                        'type' => 'toggle', 'label' => 'Allow password reset', 'default' => true,
                    ],
                    'admin_inactive_auto_disable_days' => [
                        'type' => 'number', 'label' => 'Auto-disable inactive admin accounts (days)', 'default' => 0,
                        'helper' => '0 = disabled (no automatic deactivation).',
                        'rules' => ['nullable', 'integer', 'min:0', 'max:3650'],
                    ],
                ],
            ],
        ],

        'class_booking' => [
            'label' => 'Classes & bookings',
            'group' => 'class_booking',
            'visible' => true,
            'sections' => [
                'Booking' => [
                    'allow_quantity_booking' => ['type' => 'toggle', 'label' => 'Allow quantity booking', 'default' => true],
                    'max_seats_per_booking' => [
                        'type' => 'number', 'label' => 'Max seats per booking', 'default' => 10,
                        'rules' => ['nullable', 'integer', 'min:1', 'max:500'],
                    ],
                    'auto_close_when_full' => ['type' => 'toggle', 'label' => 'Auto-close when full', 'default' => true],
                    'allow_waitlist' => ['type' => 'toggle', 'label' => 'Allow waitlist', 'default' => false],
                    'booking_cutoff_hours' => [
                        'type' => 'number', 'label' => 'Booking cutoff (hours before start)', 'default' => 24,
                        'rules' => ['nullable', 'integer', 'min:0', 'max:8760'],
                    ],
                    'allow_reschedule' => ['type' => 'toggle', 'label' => 'Allow reschedule', 'default' => true],
                    'allow_cancellation' => ['type' => 'toggle', 'label' => 'Allow cancellation', 'default' => true],
                    'cancellation_cutoff_hours' => [
                        'type' => 'number', 'label' => 'Cancellation cutoff (hours before start)', 'default' => 48,
                        'rules' => ['nullable', 'integer', 'min:0', 'max:8760'],
                    ],
                ],
                'Certificates & completion' => [
                    'attendance_required_for_certificate' => [
                        'type' => 'toggle', 'label' => 'Attendance required before certificate',
                        'default' => true,
                        'helper' => 'Mirrors legacy “require attendance” for booking completion.',
                    ],
                    'exam_required_for_certificate' => [
                        'type' => 'toggle', 'label' => 'Exam pass required before certificate',
                        'default' => true,
                        'helper' => 'Mirrors legacy “require exam pass”.',
                    ],
                    'auto_issue_certificate' => [
                        'type' => 'toggle', 'label' => 'Auto-issue certificate on completion',
                        'default' => true,
                    ],
                ],
            ],
        ],

        'payment_finance' => [
            'label' => 'Payments & finance',
            'group' => 'payment_finance',
            'visible' => 'finance_or_super',
            'sections' => [
                'Stripe' => [
                    'stripe_enabled' => ['type' => 'toggle', 'label' => 'Enable Stripe', 'default' => false],
                    'stripe_publishable_key' => [
                        'type' => 'text', 'label' => 'Publishable key (pk_…)', 'default' => '',
                        'rules' => ['nullable', 'string', 'max:500'],
                    ],
                    'stripe_secret_key' => [
                        'type' => 'password', 'label' => 'Secret key', 'default' => '',
                        'encrypt' => true,
                    ],
                    'stripe_webhook_secret' => [
                        'type' => 'password', 'label' => 'Webhook signing secret', 'default' => '',
                        'encrypt' => true,
                    ],
                    'payment_mode' => [
                        'type' => 'select', 'label' => 'Payment mode',
                        'options' => ['sandbox' => 'Sandbox', 'live' => 'Live'],
                        'default' => 'sandbox',
                        'rules' => ['nullable', 'in:sandbox,live'],
                    ],
                ],
                'Policies' => [
                    'allow_manual_payment' => ['type' => 'toggle', 'label' => 'Allow manual payment recording', 'default' => true],
                    'allow_partial_refund' => ['type' => 'toggle', 'label' => 'Allow partial refunds', 'default' => true],
                    'allow_full_refund' => ['type' => 'toggle', 'label' => 'Allow full refunds', 'default' => true],
                    'refund_requires_approval' => ['type' => 'toggle', 'label' => 'Refunds require approval', 'default' => false],
                    'refund_window_days' => [
                        'type' => 'number', 'label' => 'Refund window (days)', 'default' => 14,
                        'rules' => ['nullable', 'integer', 'min:0', 'max:365'],
                    ],
                    'invoice_prefix' => ['type' => 'text', 'label' => 'Invoice number prefix', 'default' => 'INV-', 'rules' => ['nullable', 'string', 'max:20']],
                    'receipt_prefix' => ['type' => 'text', 'label' => 'Receipt number prefix', 'default' => 'RCP-', 'rules' => ['nullable', 'string', 'max:20']],
                ],
            ],
        ],

        'certificate' => [
            'label' => 'Certificates',
            'group' => 'certificate',
            'visible' => true,
            'sections' => [
                'Issuance' => [
                    'certificate_prefix' => ['type' => 'text', 'label' => 'Certificate number prefix', 'default' => 'NM-', 'rules' => ['nullable', 'string', 'max:32']],
                    'verification_url_base' => [
                        'type' => 'text', 'label' => 'Verification URL base', 'default' => '',
                        'helper' => 'Optional public base URL for QR verification links.',
                        'rules' => ['nullable', 'string', 'max:500'],
                    ],
                    'show_full_identity' => ['type' => 'toggle', 'label' => 'Show full identity on certificate', 'default' => false],
                ],
                'Reissue & revoke' => [
                    'allow_reissue' => ['type' => 'toggle', 'label' => 'Allow re-issue', 'default' => true],
                    'reissue_requires_revoke' => ['type' => 'toggle', 'label' => 'Re-issue requires revoke first', 'default' => true],
                    'revoke_requires_reason' => ['type' => 'toggle', 'label' => 'Revoke requires reason', 'default' => true],
                ],
            ],
        ],

        'email_delivery' => [
            'label' => 'Email',
            'group' => 'email_delivery',
            'visible' => true,
            'sections' => [
                'Transport' => [
                    'mail_driver' => [
                        'type' => 'select', 'label' => 'Mail driver',
                        'options' => ['smtp' => 'SMTP', 'sendmail' => 'Sendmail', 'log' => 'Log (dev)'],
                        'default' => 'smtp',
                    ],
                    'smtp_host' => ['type' => 'text', 'label' => 'SMTP host', 'default' => '', 'rules' => ['nullable', 'string', 'max:255']],
                    'smtp_port' => ['type' => 'number', 'label' => 'SMTP port', 'default' => 587, 'rules' => ['nullable', 'integer', 'min:1', 'max:65535']],
                    'smtp_username' => ['type' => 'text', 'label' => 'SMTP username', 'default' => '', 'rules' => ['nullable', 'string', 'max:255']],
                    'smtp_password' => [
                        'type' => 'password', 'label' => 'SMTP password', 'default' => '',
                        'encrypt' => true,
                        'helper' => 'Leave blank to keep the current password.',
                    ],
                ],
                'From & reply' => [
                    'from_name' => ['type' => 'text', 'label' => 'From name', 'default' => 'Niat Murni Academy', 'rules' => ['nullable', 'string', 'max:255']],
                    'from_email' => ['type' => 'text', 'label' => 'From email', 'default' => '', 'rules' => ['nullable', 'email', 'max:255']],
                    'reply_to_email' => ['type' => 'text', 'label' => 'Reply-to email', 'default' => '', 'rules' => ['nullable', 'email', 'max:255']],
                ],
                'Notifications' => [
                    'enable_booking_email' => ['type' => 'toggle', 'label' => 'Booking emails', 'default' => true],
                    'enable_payment_email' => ['type' => 'toggle', 'label' => 'Payment emails', 'default' => true],
                    'enable_certificate_email' => ['type' => 'toggle', 'label' => 'Certificate emails', 'default' => true],
                ],
            ],
        ],
    ],
];
