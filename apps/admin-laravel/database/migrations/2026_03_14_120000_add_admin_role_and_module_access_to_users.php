<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Extend the users table to support fine-grained admin roles and per-module access control.
     *
     * - admin_role  : canonical admin role (super_admin, finance_admin, …)
     * - module_access : JSON array of granted module keys (null = use role defaults)
     * - recovery_email: optional secondary email for account recovery
     *
     * The existing `role` column (admin/tutor/staff) is kept for backward compatibility
     * and is still the primary Filament panel-access gate via canAccessAdmin().
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('admin_role', 50)->nullable()->after('role')
                ->comment('super_admin | finance_admin | operations_admin | accountant | cms_admin');
            $table->json('module_access')->nullable()->after('admin_role')
                ->comment('Explicit array of allowed module keys; null = derive from admin_role');
            $table->string('recovery_email', 255)->nullable()->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['admin_role', 'module_access', 'recovery_email']);
        });
    }
};
