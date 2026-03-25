<?php

use App\Support\AdminModules;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('users')) {
            return;
        }

        $allModules = json_encode(array_keys(AdminModules::labels()));

        DB::table('users')
            ->where('email', 'admin@niatmurniacademy.com')
            ->update([
                'role' => 'admin',
                'admin_role' => 'super_admin',
                'module_access' => $allModules,
                'is_active' => true,
                'updated_at' => now(),
            ]);

        DB::table('users')
            ->where('email', 'admin@niatmurni.my')
            ->update([
                'role' => 'admin',
                'admin_role' => 'super_admin',
                'module_access' => $allModules,
                'is_active' => true,
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        // Intentionally no-op: this migration enforces known admin safety.
    }
};
