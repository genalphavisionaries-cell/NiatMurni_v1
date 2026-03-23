<?php

/**
 * SaaS platform settings schema (group => key => meta).
 * Used by Filament ManageSettings + PlatformSettingsDefaultsSeeder.
 *
 * @see App\Services\SettingService
 */
return [
    'system' => [
        'platform_name' => [
            'label' => 'Platform name',
            'type' => 'text',
            'default' => 'Niat Murni Academy',
            'helper' => 'Shown in admin and API metadata.',
        ],
        'timezone' => [
            'label' => 'Default timezone',
            'type' => 'text',
            'default' => 'Asia/Kuala_Lumpur',
        ],
        'currency' => [
            'label' => 'Default currency code',
            'type' => 'text',
            'default' => 'MYR',
        ],
        'locale' => [
            'label' => 'Default locale',
            'type' => 'text',
            'default' => 'ms_MY',
        ],
    ],

    'email' => [
        'mail_from_address' => [
            'label' => 'From email address',
            'type' => 'text',
            'default' => '',
        ],
        'mail_from_name' => [
            'label' => 'From name',
            'type' => 'text',
            'default' => 'Niat Murni Academy',
        ],
        'smtp_host' => [
            'label' => 'SMTP host',
            'type' => 'text',
            'default' => '',
        ],
        'smtp_port' => [
            'label' => 'SMTP port',
            'type' => 'text',
            'default' => '587',
        ],
        'smtp_username' => [
            'label' => 'SMTP username',
            'type' => 'text',
            'default' => '',
        ],
        'smtp_password' => [
            'label' => 'SMTP password',
            'type' => 'password',
            'default' => '',
            'encrypt' => true,
        ],
        'smtp_encryption' => [
            'label' => 'SMTP encryption',
            'type' => 'select',
            'options' => ['tls' => 'TLS', 'ssl' => 'SSL', 'none' => 'None'],
            'default' => 'tls',
        ],
    ],

    'security' => [
        'session_lifetime_minutes' => [
            'label' => 'Session lifetime (minutes)',
            'type' => 'text',
            'default' => '120',
        ],
        'password_min_length' => [
            'label' => 'Minimum password length',
            'type' => 'text',
            'default' => '8',
        ],
        'enforce_2fa' => [
            'label' => 'Enforce 2FA (future)',
            'type' => 'toggle',
            'default' => false,
        ],
    ],

    'integrations' => [
        'stripe_publishable_key' => [
            'label' => 'Stripe publishable key (pk_…)',
            'type' => 'text',
            'default' => '',
        ],
        'stripe_public_webhook_secret' => [
            'label' => 'Stripe webhook signing secret (optional)',
            'type' => 'password',
            'default' => '',
            'encrypt' => true,
        ],
        'api_base_url' => [
            'label' => 'Public API base URL (for webhooks / callbacks)',
            'type' => 'text',
            'default' => '',
            'helper' => 'Optional. Used for absolute URLs in emails.',
        ],
    ],

    'branding' => [
        'public_site_name' => [
            'label' => 'Public site display name',
            'type' => 'text',
            'default' => 'Niat Murni Academy',
            'helper' => 'Separate from CMS keys; use for API/JSON consumers.',
        ],
    ],

    'feature_flags' => [
        'maintenance_mode' => [
            'label' => 'Maintenance mode',
            'type' => 'toggle',
            'default' => false,
        ],
        'enable_beta_features' => [
            'label' => 'Enable beta features',
            'type' => 'toggle',
            'default' => false,
        ],
    ],
];
