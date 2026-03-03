<?php

namespace Database\Seeders;

use App\Models\Program;
use Illuminate\Database\Seeder;

class ProgramSeeder extends Seeder
{
    public function run(): void
    {
        Program::firstOrCreate(
            ['slug' => 'kkm-food-handling'],
            [
                'name' => 'KKM Food Handling Course',
                'description' => 'Compliance-grade KKM Food Handler Training (online & physical).',
                'default_capacity' => 30,
                'min_threshold' => 1,
            ]
        );
    }
}
