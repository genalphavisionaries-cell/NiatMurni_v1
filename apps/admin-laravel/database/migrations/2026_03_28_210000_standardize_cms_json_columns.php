<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Migrate CMS JSON columns from longText to native JSON type safely.
     */
    public function up(): void
    {
        $driver = DB::connection()->getDriverName();

        // Step 1: Validate existing JSON data before migration
        $this->validateExistingJsonData();

        // Step 2: Migrate cms_sections.content_json to native JSON
        if ($driver === 'mysql') {
            // MySQL: Convert longText to JSON
            DB::statement('ALTER TABLE cms_sections MODIFY content_json JSON NULL');
        } elseif ($driver === 'pgsql') {
            // PostgreSQL: Convert text to JSONB
            DB::statement('ALTER TABLE cms_sections ALTER COLUMN content_json TYPE JSONB USING content_json::JSONB');
        }

        // Step 3: Migrate cms_items.extra_json to native JSON  
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE cms_items MODIFY extra_json JSON NULL');
        } elseif ($driver === 'pgsql') {
            DB::statement('ALTER TABLE cms_items ALTER COLUMN extra_json TYPE JSONB USING extra_json::JSONB');
        }

        // Step 4: Add JSON validation constraints
        $this->addJsonValidationConstraints();
    }

    /**
     * Revert to longText if needed.
     */
    public function down(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE cms_sections MODIFY content_json LONGTEXT NULL');
            DB::statement('ALTER TABLE cms_items MODIFY extra_json LONGTEXT NULL');
        } elseif ($driver === 'pgsql') {
            DB::statement('ALTER TABLE cms_sections ALTER COLUMN content_json TYPE TEXT');
            DB::statement('ALTER TABLE cms_items ALTER COLUMN extra_json TYPE TEXT');
        }
    }

    /**
     * Validate existing JSON data and fix malformed entries before migration.
     */
    private function validateExistingJsonData(): void
    {
        // Fix malformed content_json in cms_sections
        $sections = DB::table('cms_sections')->whereNotNull('content_json')->get();
        
        foreach ($sections as $section) {
            $json = $section->content_json;
            
            // Skip if already valid JSON
            if (json_decode($json, true) !== null || $json === 'null') {
                continue;
            }

            // Try to repair common issues
            $repaired = $this->repairJsonString($json);
            
            if (json_decode($repaired, true) !== null) {
                DB::table('cms_sections')
                    ->where('id', $section->id)
                    ->update(['content_json' => $repaired]);
                
                echo "Repaired cms_sections.id={$section->id} content_json\n";
            } else {
                // Replace with safe empty object
                DB::table('cms_sections')
                    ->where('id', $section->id)
                    ->update(['content_json' => json_encode([])]);
                
                echo "Reset cms_sections.id={$section->id} content_json to empty object\n";
            }
        }

        // Fix malformed extra_json in cms_items
        $items = DB::table('cms_items')->whereNotNull('extra_json')->get();
        
        foreach ($items as $item) {
            $json = $item->extra_json;
            
            // Skip if already valid JSON
            if (json_decode($json, true) !== null || $json === 'null') {
                continue;
            }

            // Try to repair common issues
            $repaired = $this->repairJsonString($json);
            
            if (json_decode($repaired, true) !== null) {
                DB::table('cms_items')
                    ->where('id', $item->id)
                    ->update(['extra_json' => $repaired]);
                
                echo "Repaired cms_items.id={$item->id} extra_json\n";
            } else {
                // Replace with safe empty object
                DB::table('cms_items')
                    ->where('id', $item->id)
                    ->update(['extra_json' => json_encode([])]);
                
                echo "Reset cms_items.id={$item->id} extra_json to empty object\n";
            }
        }
    }

    /**
     * Attempt to repair common JSON string issues.
     */
    private function repairJsonString(string $json): string
    {
        // Remove BOM and control characters
        $json = trim($json, "\x00\x0B\xEF\xBB\xBF");
        
        // Fix common escape issues
        $json = str_replace(['\\"', "\\'"], ['"', "'"], $json);
        
        // Ensure proper quotes
        $json = preg_replace('/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/', '$1"$2":', $json);
        
        return $json;
    }

    /**
     * Add database-level JSON validation constraints.
     */
    private function addJsonValidationConstraints(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'mysql') {
            // Add JSON validation constraints for MySQL
            try {
                DB::statement('ALTER TABLE cms_sections ADD CONSTRAINT cms_sections_content_json_check CHECK (JSON_VALID(content_json) OR content_json IS NULL)');
            } catch (\Throwable $e) {
                // Constraint may already exist or not supported in this MySQL version
                echo "Note: Could not add JSON validation constraint for cms_sections: " . $e->getMessage() . "\n";
            }

            try {
                DB::statement('ALTER TABLE cms_items ADD CONSTRAINT cms_items_extra_json_check CHECK (JSON_VALID(extra_json) OR extra_json IS NULL)');
            } catch (\Throwable $e) {
                echo "Note: Could not add JSON validation constraint for cms_items: " . $e->getMessage() . "\n";
            }
        }
        
        // PostgreSQL JSONB type already validates JSON automatically
    }
}