<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add historical-safety fields so issued certificates remain correct after template edits.
     * Existing rows stay NULL; no backfill in this step.
     */
    public function up(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->foreignId('certificate_template_id')->nullable()->after('booking_id')->constrained('certificate_templates')->nullOnDelete();
            $table->string('template_name_snapshot')->nullable()->after('certificate_template_id');
        });
    }

    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->dropForeign(['certificate_template_id']);
            $table->dropColumn('template_name_snapshot');
        });
    }
};
