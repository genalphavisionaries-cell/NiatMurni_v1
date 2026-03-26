<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            if (! Schema::hasColumn('programs', 'public_id')) {
                $table->uuid('public_id')->nullable()->after('id');
            }
        });

        Schema::table('class_sessions', function (Blueprint $table) {
            if (! Schema::hasColumn('class_sessions', 'public_id')) {
                $table->uuid('public_id')->nullable()->after('id');
            }
        });

        DB::table('programs')
            ->whereNull('public_id')
            ->orderBy('id')
            ->select(['id'])
            ->chunkById(200, function ($rows): void {
                foreach ($rows as $row) {
                    DB::table('programs')
                        ->where('id', $row->id)
                        ->update(['public_id' => (string) Str::uuid()]);
                }
            });

        DB::table('class_sessions')
            ->whereNull('public_id')
            ->orderBy('id')
            ->select(['id'])
            ->chunkById(200, function ($rows): void {
                foreach ($rows as $row) {
                    DB::table('class_sessions')
                        ->where('id', $row->id)
                        ->update(['public_id' => (string) Str::uuid()]);
                }
            });

        Schema::table('programs', function (Blueprint $table) {
            if (Schema::hasColumn('programs', 'public_id')) {
                $table->unique('public_id', 'programs_public_id_unique');
            }
        });

        Schema::table('class_sessions', function (Blueprint $table) {
            if (Schema::hasColumn('class_sessions', 'public_id')) {
                $table->unique('public_id', 'class_sessions_public_id_unique');
            }
        });
    }

    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            if (Schema::hasColumn('programs', 'public_id')) {
                $table->dropUnique('programs_public_id_unique');
                $table->dropColumn('public_id');
            }
        });

        Schema::table('class_sessions', function (Blueprint $table) {
            if (Schema::hasColumn('class_sessions', 'public_id')) {
                $table->dropUnique('class_sessions_public_id_unique');
                $table->dropColumn('public_id');
            }
        });
    }
};
