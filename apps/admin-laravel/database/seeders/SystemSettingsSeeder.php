<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SystemSettingsSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('settings')->insert([
            [
                'key' => 'require_attendance',
                'value' => 'true',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'require_exam_pass',
                'value' => 'true',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'auto_issue_certificate',
                'value' => 'true',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
