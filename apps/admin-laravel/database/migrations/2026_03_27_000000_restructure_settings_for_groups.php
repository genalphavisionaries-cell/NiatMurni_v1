<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add group + is_encrypted; unique (group, key). Keeps `value` as text for backward compatibility
     * with existing CMS / SystemSettings readers (plain string values).
     */
    public function up(): void
    {
        if (! Schema::hasTable('settings')) {
            return;
        }

        if (Schema::hasColumn('settings', 'group')) {
            return;
        }

        Schema::table('settings', function (Blueprint $table) {
            $table->string('group', 64)->default('system')->after('id');
            $table->boolean('is_encrypted')->default(false)->after('value');
        });

        $this->backfillGroups();

        $this->dropLegacyKeyUniqueIfPresent();

        Schema::table('settings', function (Blueprint $table) {
            $table->unique(['group', 'key']);
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('settings') || ! Schema::hasColumn('settings', 'group')) {
            return;
        }

        try {
            Schema::table('settings', function (Blueprint $table) {
                $table->dropUnique(['group', 'key']);
            });
        } catch (\Throwable) {
            try {
                Schema::table('settings', function (Blueprint $table) {
                    $table->dropUnique('settings_group_key_unique');
                });
            } catch (\Throwable) {
                //
            }
        }

        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn(['group', 'is_encrypted']);
        });

        Schema::table('settings', function (Blueprint $table) {
            $table->string('key', 191)->unique()->change();
        });
    }

    private function backfillGroups(): void
    {
        DB::table('settings')->where('key', 'like', 'cms_%')->update(['group' => 'branding']);
        DB::table('settings')->whereIn('key', [
            'require_attendance',
            'require_exam_pass',
            'auto_issue_certificate',
        ])->update(['group' => 'system']);
    }

    private function dropLegacyKeyUniqueIfPresent(): void
    {
        try {
            Schema::table('settings', function (Blueprint $table) {
                $table->dropUnique(['key']);
            });
        } catch (\Throwable) {
            try {
                DB::statement('ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_key_unique');
            } catch (\Throwable) {
                //
            }
        }
    }
};
