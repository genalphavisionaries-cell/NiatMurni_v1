<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Align cms_sections.section_key with public API keys: why_choose_us, cta.
     */
    public function up(): void
    {
        if (! Schema::hasTable('cms_sections')) {
            return;
        }

        DB::table('cms_sections')->where('section_key', 'usp')->update(['section_key' => 'why_choose_us']);
        DB::table('cms_sections')->where('section_key', 'promo')->update(['section_key' => 'cta']);
    }

    public function down(): void
    {
        if (! Schema::hasTable('cms_sections')) {
            return;
        }

        DB::table('cms_sections')->where('section_key', 'why_choose_us')->update(['section_key' => 'usp']);
        DB::table('cms_sections')->where('section_key', 'cta')->update(['section_key' => 'promo']);
    }
};
