<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Align cms_sections.section_key with public API: testimonials (legacy: trust).
     */
    public function up(): void
    {
        if (! Schema::hasTable('cms_sections')) {
            return;
        }

        DB::table('cms_sections')->where('section_key', 'trust')->update(['section_key' => 'testimonials']);
    }

    public function down(): void
    {
        if (! Schema::hasTable('cms_sections')) {
            return;
        }

        DB::table('cms_sections')->where('section_key', 'testimonials')->update(['section_key' => 'trust']);
    }
};
