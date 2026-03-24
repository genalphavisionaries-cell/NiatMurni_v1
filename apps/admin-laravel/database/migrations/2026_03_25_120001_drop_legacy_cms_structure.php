<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Remove legacy CMS tables and cms_* settings keys (not integrations / Stripe).
     */
    public function up(): void
    {
        Schema::dropIfExists('homepage_sections');
        Schema::dropIfExists('site_navigation_items');

        if (Schema::hasTable('settings')) {
            DB::table('settings')->where('key', 'like', 'cms_%')->delete();
        }
    }

    public function down(): void
    {
        // Legacy tables are not recreated; restore from older migrations if needed.
    }
};
