<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

Artisan::command('admin:ensure-admin', function () {
    $password = 'NiatMurniAdmin!';
    $hashed = Hash::make($password);

    $admins = [
        ['email' => 'admin@niatmurniacademy.com', 'name' => 'Admin'],
        ['email' => 'admin@niatmurni.my', 'name' => 'Admin (legacy)'],
    ];

    try {
        foreach ($admins as $admin) {
            $user = User::updateOrCreate(
                ['email' => $admin['email']],
                [
                    'name' => $admin['name'],
                    'password' => $hashed,
                    'role' => 'admin',
                    'is_active' => true,
                ]
            );
            if (! Hash::check($password, $user->getAuthPassword())) {
                $this->warn("Password verification failed for {$user->email}; re-hashing.");
                $user->update(['password' => Hash::make($password)]);
            }
            $this->info("Admin ready: {$user->email}");
        }
        $this->newLine();
        $this->info('Log in at /admin with:');
        $this->line('  Email:    admin@niatmurni.my (or admin@niatmurniacademy.com)');
        $this->line('  Password: NiatMurniAdmin!');
        $this->newLine();
        $this->comment('If login still fails: run "php artisan migrate" first, then run this command again.');
    } catch (\Throwable $e) {
        $this->error('Failed to create admin: ' . $e->getMessage());
        $this->newLine();
        $this->warn('Try running: php artisan migrate');
        $this->warn('Then run: php artisan admin:ensure-admin');
        return 1;
    }

    return 0;
})->purpose('Ensure admin accounts exist with known password (fix login)');
