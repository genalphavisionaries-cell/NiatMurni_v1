<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One-time: rename legacy section_key values on homepage (no data loss),
     * only when the canonical row does not already exist (unique page_id + section_key).
     * Activate homepage cms_page and all its cms_sections.
     */
    public function up(): void
    {
        if (! Schema::hasTable('cms_pages') || ! Schema::hasTable('cms_sections')) {
            return;
        }

        $pageIds = DB::table('cms_pages')->where('slug', 'homepage')->pluck('id');

        foreach ($pageIds as $pageId) {
            $pageId = (int) $pageId;
            $this->renameIfNoTargetRow($pageId, 'usp', 'why_choose_us');
            $this->renameIfNoTargetRow($pageId, 'trust', 'testimonials');
            $this->renameIfNoTargetRow($pageId, 'promo', 'cta');
        }

        DB::table('cms_pages')->where('slug', 'homepage')->update(['is_active' => true]);

        if ($pageIds->isNotEmpty()) {
            DB::table('cms_sections')
                ->whereIn('page_id', $pageIds->all())
                ->update(['is_active' => true]);
        }
    }

    private function renameIfNoTargetRow(int $pageId, string $fromKey, string $toKey): void
    {
        $hasTarget = DB::table('cms_sections')
            ->where('page_id', $pageId)
            ->where('section_key', $toKey)
            ->exists();

        if ($hasTarget) {
            return;
        }

        DB::table('cms_sections')
            ->where('page_id', $pageId)
            ->where('section_key', $fromKey)
            ->update(['section_key' => $toKey]);
    }

    public function down(): void
    {
        if (! Schema::hasTable('cms_pages') || ! Schema::hasTable('cms_sections')) {
            return;
        }

        $pageIds = DB::table('cms_pages')->where('slug', 'homepage')->pluck('id');

        foreach ($pageIds as $pageId) {
            $pageId = (int) $pageId;
            $this->renameBackIfNoLegacyRow($pageId, 'why_choose_us', 'usp');
            $this->renameBackIfNoLegacyRow($pageId, 'testimonials', 'trust');
            $this->renameBackIfNoLegacyRow($pageId, 'cta', 'promo');
        }
    }

    private function renameBackIfNoLegacyRow(int $pageId, string $canonicalKey, string $legacyKey): void
    {
        $hasLegacy = DB::table('cms_sections')
            ->where('page_id', $pageId)
            ->where('section_key', $legacyKey)
            ->exists();

        if ($hasLegacy) {
            return;
        }

        DB::table('cms_sections')
            ->where('page_id', $pageId)
            ->where('section_key', $canonicalKey)
            ->update(['section_key' => $legacyKey]);
    }
};
