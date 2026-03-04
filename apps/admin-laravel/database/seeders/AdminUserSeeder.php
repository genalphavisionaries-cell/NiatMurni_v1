<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

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
        $attributes = [
            'name' => 'Admin',
            'password' => 'NiatMurniAdmin!',
            'role' => 'admin',
            'is_active' => true,
        ];

        User::updateOrCreate(
            ['email' => 'admin@niatmurniacademy.com'],
            $attributes
        );

        User::updateOrCreate(
            ['email' => 'admin@niatmurni.my'],
            [
                'name' => 'Admin (legacy)',
                'password' => 'NiatMurniAdmin!',
                'role' => 'admin',
                'is_active' => true,
            ]
        );
    }
}
