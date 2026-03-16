<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Align schema with finalized design:
     * - Create tutors table and backfill from existing trainer users
     * - Replace class_sessions.trainer_id (→ users) with tutor_id (→ tutors)
     * - Rename min_threshold → min_threshold_minutes, add location & price_cents if missing
     */
    public function up(): void
    {
        // ─── A. Create tutors table ───────────────────────────────────────
        Schema::create('tutors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->text('bio')->nullable();
            $table->integer('hourly_rate_cents')->nullable();
            $table->decimal('default_share_percent', 5, 2)->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_account_name')->nullable();
            $table->string('bank_account_number', 64)->nullable();
            $table->string('status', 32)->default('active');
            $table->timestamps();
        });

        // ─── B. Backfill tutors for existing trainer users ─────────────────
        // One tutor row per user that is currently referenced as trainer_id in class_sessions
        $trainerUserIds = DB::table('class_sessions')
            ->whereNotNull('trainer_id')
            ->distinct()
            ->pluck('trainer_id');

        foreach ($trainerUserIds as $userId) {
            DB::table('tutors')->insertOrIgnore([
                'user_id' => $userId,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ─── C. Add new columns to class_sessions (before dropping trainer_id) ─
        Schema::table('class_sessions', function (Blueprint $table) {
            $table->foreignId('tutor_id')->nullable()->after('program_id')->constrained('tutors')->nullOnDelete();
        });

        // Backfill tutor_id from trainer_id (same user → we just created tutor rows for them)
        DB::statement("
            UPDATE class_sessions cs
            SET tutor_id = t.id
            FROM tutors t
            WHERE t.user_id = cs.trainer_id
              AND cs.trainer_id IS NOT NULL
        ");

        // Rename min_threshold → min_threshold_minutes (raw SQL avoids doctrine/dbal dependency)
        if (Schema::hasColumn('class_sessions', 'min_threshold') && !Schema::hasColumn('class_sessions', 'min_threshold_minutes')) {
            DB::statement('ALTER TABLE class_sessions RENAME COLUMN min_threshold TO min_threshold_minutes');
        }

        // Add location only if not already present (e.g. from add_schema_spec_v1_columns)
        if (!Schema::hasColumn('class_sessions', 'location')) {
            Schema::table('class_sessions', function (Blueprint $table) {
                $table->string('location')->nullable()->after('language');
            });
        }

        // Add price_cents if not present (after capacity; min_threshold_minutes may have been renamed above)
        if (!Schema::hasColumn('class_sessions', 'price_cents')) {
            Schema::table('class_sessions', function (Blueprint $table) {
                $table->integer('price_cents')->nullable()->after('capacity');
            });
        }

        // ─── D. Drop old trainer_id FK and column ───────────────────────────
        Schema::table('class_sessions', function (Blueprint $table) {
            $table->dropForeign(['trainer_id']);
        });
        Schema::table('class_sessions', function (Blueprint $table) {
            $table->dropColumn('trainer_id');
        });

        // ─── E. Optional: make tutor_id non-nullable where we have data ─────
        // Keep nullable to allow class_sessions without a tutor (existing rows may have had null trainer_id)
    }

    public function down(): void
    {
        // Re-add trainer_id to class_sessions and repoint to users
        Schema::table('class_sessions', function (Blueprint $table) {
            $table->foreignId('trainer_id')->nullable()->after('program_id')->constrained('users')->nullOnDelete();
        });

        // Backfill trainer_id from tutor_id (tutor.user_id)
        DB::statement("
            UPDATE class_sessions cs
            SET trainer_id = t.user_id
            FROM tutors t
            WHERE t.id = cs.tutor_id
        ");

        Schema::table('class_sessions', function (Blueprint $table) {
            $table->dropForeign(['tutor_id']);
            $table->dropColumn('tutor_id');
        });

        if (Schema::hasColumn('class_sessions', 'min_threshold_minutes')) {
            DB::statement('ALTER TABLE class_sessions RENAME COLUMN min_threshold_minutes TO min_threshold');
        }

        // Only drop price_cents (we are the only migration that adds it). Do not drop location
        // as it may have been added by add_schema_spec_v1_columns.
        if (Schema::hasColumn('class_sessions', 'price_cents')) {
            Schema::table('class_sessions', function (Blueprint $table) {
                $table->dropColumn('price_cents');
            });
        }

        Schema::dropIfExists('tutors');
    }
};
