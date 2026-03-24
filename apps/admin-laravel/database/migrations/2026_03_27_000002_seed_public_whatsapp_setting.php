<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('settings') || ! Schema::hasColumn('settings', 'group')) {
            return;
        }

        $exists = DB::table('settings')
            ->where('group', 'public')
            ->where('key', 'whatsapp')
            ->exists();

        if ($exists) {
            return;
        }

        DB::table('settings')->insert([
            'group' => 'public',
            'key' => 'whatsapp',
            'value' => json_encode([
                'enabled' => false,
                'phone' => '',
                'welcome_text' => '',
                'default_message' => '',
                'helper_text' => '',
                'auto_open_delay_ms' => 0,
            ]),
            'is_encrypted' => false,
            'updated_by' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        if (! Schema::hasTable('settings')) {
            return;
        }

        DB::table('settings')->where('group', 'public')->where('key', 'whatsapp')->delete();
    }
};
