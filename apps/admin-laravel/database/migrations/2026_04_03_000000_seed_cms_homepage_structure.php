<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Ensures the cms_pages + cms_sections rows exist for the homepage.
 * The seeder may never have been run on production; this migration
 * guarantees the data the CMS editors depend on is always present.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! \Illuminate\Support\Facades\Schema::hasTable('cms_pages')) {
            return;
        }

        $existing = DB::table('cms_pages')->where('slug', 'homepage')->first();

        if ($existing) {
            $pageId = $existing->id;
        } else {
            $pageId = DB::table('cms_pages')->insertGetId([
                'slug' => 'homepage',
                'title' => 'Homepage',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $sections = [
            ['key' => 'header', 'title' => 'Header', 'order' => 0],
            ['key' => 'hero', 'title' => 'Hero', 'order' => 1],
            ['key' => 'usp', 'title' => 'USP', 'order' => 2],
            ['key' => 'classes', 'title' => 'Classes', 'order' => 3],
            ['key' => 'trust', 'title' => 'Trust', 'order' => 4],
            ['key' => 'promo', 'title' => 'Promo', 'order' => 5],
            ['key' => 'footer', 'title' => 'Footer', 'order' => 6],
            ['key' => 'floating_menu', 'title' => 'Floating Menu', 'order' => 7],
        ];

        foreach ($sections as $row) {
            $exists = DB::table('cms_sections')
                ->where('page_id', $pageId)
                ->where('section_key', $row['key'])
                ->exists();

            if (! $exists) {
                DB::table('cms_sections')->insert([
                    'page_id' => $pageId,
                    'section_key' => $row['key'],
                    'title' => $row['title'],
                    'content_json' => json_encode([]),
                    'is_active' => true,
                    'sort_order' => $row['order'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        // Data-only migration; nothing to reverse.
    }
};
