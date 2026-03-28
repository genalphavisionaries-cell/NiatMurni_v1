<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('class_sessions')) {
            return;
        }

        if (! Schema::hasColumn('class_sessions', 'tutor_id')) {
            Schema::table('class_sessions', function (Blueprint $table) {
                $table->foreignId('tutor_id')
                    ->nullable()
                    ->after('program_id')
                    ->constrained('tutors')
                    ->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        // No-op to avoid removing tutor_id in environments where it already existed.
    }
};
