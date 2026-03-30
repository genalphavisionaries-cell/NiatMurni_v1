<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Add data integrity constraints for CMS tables.
     */
    public function up(): void
    {
        // 1. Add index on cms_sections.section_key for faster lookups
        if (!$this->indexExists('cms_sections', 'cms_sections_section_key_index')) {
            Schema::table('cms_sections', function (Blueprint $table) {
                $table->index('section_key');
            });
        }

        // 2. Add index on cms_items for common queries  
        if (!$this->indexExists('cms_items', 'cms_items_section_type_index')) {
            Schema::table('cms_items', function (Blueprint $table) {
                $table->index(['section_id', 'type']);
            });
        }

        // 3. Add index on cms_items.is_active for active item filtering
        if (!$this->indexExists('cms_items', 'cms_items_is_active_index')) {
            Schema::table('cms_items', function (Blueprint $table) {
                $table->index('is_active');
            });
        }

        // 4. Add index on cms_testimonials for sorting
        if (!$this->indexExists('cms_testimonials', 'cms_testimonials_active_sort_index')) {
            Schema::table('cms_testimonials', function (Blueprint $table) {
                $table->index(['is_active', 'sort_order']);
            });
        }

        // 5. Cleanup any malformed JSON data
        $this->cleanupMalformedJson();
    }

    /**
     * Remove the constraints.
     */
    public function down(): void
    {
        // Drop indexes if they exist
        if ($this->indexExists('cms_sections', 'cms_sections_section_key_index')) {
            Schema::table('cms_sections', function (Blueprint $table) {
                $table->dropIndex('cms_sections_section_key_index');
            });
        }

        if ($this->indexExists('cms_items', 'cms_items_section_type_index')) {
            Schema::table('cms_items', function (Blueprint $table) {
                $table->dropIndex('cms_items_section_type_index');
            });
        }

        if ($this->indexExists('cms_items', 'cms_items_is_active_index')) {
            Schema::table('cms_items', function (Blueprint $table) {
                $table->dropIndex('cms_items_is_active_index');
            });
        }

        if ($this->indexExists('cms_testimonials', 'cms_testimonials_active_sort_index')) {
            Schema::table('cms_testimonials', function (Blueprint $table) {
                $table->dropIndex('cms_testimonials_active_sort_index');
            });
        }
    }

    private function indexExists(string $table, string $index): bool
    {
        $driver = DB::connection()->getDriverName();
        
        if ($driver === 'mysql') {
            $result = DB::select(
                "SHOW INDEX FROM `{$table}` WHERE Key_name = ?",
                [$index]
            );
            return count($result) > 0;
        }

        if ($driver === 'pgsql') {
            $result = DB::select(
                "SELECT indexname FROM pg_indexes WHERE tablename = ? AND indexname = ?",
                [$table, $index]
            );
            return count($result) > 0;
        }

        // For other drivers, assume index doesn't exist to avoid errors
        return false;
    }

    private function cleanupMalformedJson(): void
    {
        try {
            // Fix any malformed content_json in cms_sections
            $sections = DB::table('cms_sections')->whereNotNull('content_json')->get();
            foreach ($sections as $section) {
                $decoded = json_decode($section->content_json, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    // Malformed JSON - replace with empty object
                    DB::table('cms_sections')
                        ->where('id', $section->id)
                        ->update(['content_json' => json_encode([])]);
                }
            }

            // Fix any malformed extra_json in cms_items
            $items = DB::table('cms_items')->whereNotNull('extra_json')->get();
            foreach ($items as $item) {
                $decoded = json_decode($item->extra_json, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    // Malformed JSON - replace with empty object
                    DB::table('cms_items')
                        ->where('id', $item->id)
                        ->update(['extra_json' => json_encode([])]);
                }
            }

            // Normalize any inconsistent section_key values
            DB::table('cms_sections')
                ->where('section_key', 'usp')
                ->update(['section_key' => 'why_choose_us']);

            DB::table('cms_sections')
                ->where('section_key', 'trust')
                ->update(['section_key' => 'testimonials']);

            DB::table('cms_sections')
                ->where('section_key', 'promo')
                ->update(['section_key' => 'cta']);

        } catch (\Throwable $e) {
            // Don't fail migration on cleanup errors, just report
            report($e);
        }
    }
};