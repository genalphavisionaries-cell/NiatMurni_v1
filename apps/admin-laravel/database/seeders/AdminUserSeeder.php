<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Two admin accounts (same password):
     * - admin@niatmurniacademy.com (official domain)
     * - admin@niatmurni.my (legacy)
     * Password: NiatMurniAdmin!
     */
    public function run(): void
    {
        $password = Hash::make('NiatMurniAdmin!');

        User::updateOrCreate(
            ['email' => 'admin@niatmurniacademy.com'],
            [
                'name' => 'Admin',
                'password' => $password,
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@niatmurni.my'],
            [
                'name' => 'Admin (legacy)',
                'password' => $password,
                'role' => 'admin',
                'is_active' => true,
            ]
        );
    }
}
