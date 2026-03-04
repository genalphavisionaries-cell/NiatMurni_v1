<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

Artisan::command('admin:ensure-admin', function () {
    $password = Hash::make('NiatMurniAdmin!');

    foreach (
        [
            ['email' => 'admin@niatmurniacademy.com', 'name' => 'Admin'],
            ['email' => 'admin@niatmurni.my', 'name' => 'Admin (legacy)'],
        ] as $admin
    ) {
        $user = User::updateOrCreate(
            ['email' => $admin['email']],
            [
                'name' => $admin['name'],
                'password' => $password,
                'role' => 'admin',
                'is_active' => true,
            ]
        );
        $this->info("Admin ready: {$user->email}");
    }
    $this->info('Login with password: NiatMurniAdmin!');
})->purpose('Ensure admin accounts exist with known password (fix login)');
