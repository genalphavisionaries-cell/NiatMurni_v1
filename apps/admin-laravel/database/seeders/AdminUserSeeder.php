<?php

namespace Database\Seeders;

use App\Models\User;
use App\Support\AdminModules;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Two super-admin accounts (same password):
     * - admin@niatmurniacademy.com (official domain)
     * - admin@niatmurni.my (legacy)
     * Password: NiatMurniAdmin!
     */
    public function run(): void
    {
        $password = Hash::make('NiatMurniAdmin!');
        $allModules = array_keys(AdminModules::labels());

        User::updateOrCreate(
            ['email' => 'admin@niatmurniacademy.com'],
            [
                'name' => 'Admin',
                'password' => $password,
                'role' => 'admin',
                'admin_role' => 'super_admin',
                'module_access' => $allModules,
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@niatmurni.my'],
            [
                'name' => 'Admin (legacy)',
                'password' => $password,
                'role' => 'admin',
                'admin_role' => 'super_admin',
                'module_access' => $allModules,
                'is_active' => true,
            ]
        );
    }
}
