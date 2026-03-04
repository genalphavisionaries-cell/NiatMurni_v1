<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Default admin credentials (change in production):
     * Email: admin@niatmurni.my
     * Password: NiatMurniAdmin!
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@niatmurni.my'],
            [
                'name' => 'Admin',
                'password' => Hash::make('NiatMurniAdmin!'),
                'role' => 'admin',
            ]
        );
    }
}
