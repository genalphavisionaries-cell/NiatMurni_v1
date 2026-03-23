<?php

namespace App\Support;

/**
 * Canonical module keys used for per-admin access control.
 *
 * Each key maps to a nav group / resource in the Filament admin panel.
 * A user's `module_access` JSON column stores an array of these keys.
 * Super Admins bypass module checks entirely.
 */
final class AdminModules
{
    public const DASHBOARD    = 'dashboard';
    public const PROGRAMS     = 'programs';
    public const CLASSES      = 'classes';
    public const BOOKINGS     = 'bookings';
    public const PARTICIPANTS = 'participants';
    public const TUTORS       = 'tutors';
    public const CERTIFICATES = 'certificates';
    public const PAYMENTS     = 'payments';
    public const REFUNDS      = 'refunds';
    public const FINANCE      = 'finance';
    public const CMS          = 'cms';
    public const SETTINGS     = 'settings';
    public const USERS        = 'users';

    /** All module keys → human-readable labels (used in Filament CheckboxList). */
    public static function labels(): array
    {
        return [
            self::DASHBOARD    => 'Dashboard',
            self::PROGRAMS     => 'Programs',
            self::CLASSES      => 'Classes',
            self::BOOKINGS     => 'Bookings',
            self::PARTICIPANTS => 'Participants',
            self::TUTORS       => 'Tutors',
            self::CERTIFICATES => 'Certificates',
            self::PAYMENTS     => 'Payments',
            self::REFUNDS      => 'Refunds',
            self::FINANCE      => 'Finance',
            self::CMS          => 'CMS',
            self::SETTINGS     => 'Settings',
            self::USERS        => 'Users',
        ];
    }

    /**
     * Default modules granted per admin_role.
     * Used when module_access is null and the role is not super_admin.
     *
     * @return string[]
     */
    public static function defaultsForRole(string $adminRole): array
    {
        return match ($adminRole) {
            'super_admin'       => array_keys(self::labels()),
            'finance_admin'     => [self::DASHBOARD, self::BOOKINGS, self::PAYMENTS, self::REFUNDS, self::FINANCE, self::PARTICIPANTS],
            'operations_admin'  => [self::DASHBOARD, self::PROGRAMS, self::CLASSES, self::BOOKINGS, self::PARTICIPANTS, self::TUTORS, self::CERTIFICATES],
            'accountant'        => [self::DASHBOARD, self::PAYMENTS, self::REFUNDS, self::FINANCE],
            'cms_admin'         => [self::DASHBOARD, self::CMS],
            default             => [self::DASHBOARD],
        };
    }
}
