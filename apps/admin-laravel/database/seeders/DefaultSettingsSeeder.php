<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class DefaultSettingsSeeder extends Seeder
{
    /**
     * Default system settings (key-value). Safe to run multiple times.
     */
    public function run(): void
    {
        $defaults = [
            'require_attendance' => 'true',
            'require_exam_pass' => 'true',
            'auto_issue_certificate' => 'true',
        ];

        foreach ($defaults as $key => $value) {
            Setting::query()->updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }
    }
}
