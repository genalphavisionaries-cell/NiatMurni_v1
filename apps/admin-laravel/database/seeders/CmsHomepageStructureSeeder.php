<?php

namespace Database\Seeders;

use App\Models\CmsPage;
use App\Models\CmsSection;
use Illuminate\Database\Seeder;

class CmsHomepageStructureSeeder extends Seeder
{
    public function run(): void
    {
        $page = CmsPage::query()->firstOrCreate(
            ['slug' => 'homepage'],
            ['title' => 'Homepage', 'is_active' => true]
        );

        $sections = [
            ['key' => 'header', 'title' => 'Header', 'order' => 0],
            ['key' => 'hero', 'title' => 'Hero', 'order' => 1],
            ['key' => 'why_choose_us', 'title' => 'Why choose us', 'order' => 2],
            ['key' => 'classes', 'title' => 'Classes', 'order' => 3],
            ['key' => 'testimonials', 'title' => 'Testimonials', 'order' => 4],
            ['key' => 'cta', 'title' => 'CTA', 'order' => 5],
            ['key' => 'footer', 'title' => 'Footer', 'order' => 6],
            ['key' => 'floating_menu', 'title' => 'Floating Menu', 'order' => 7],
        ];

        foreach ($sections as $row) {
            CmsSection::query()->firstOrCreate(
                ['page_id' => $page->id, 'section_key' => $row['key']],
                [
                    'title' => $row['title'],
                    'subtitle' => null,
                    'content_json' => [],
                    'is_active' => true,
                    'sort_order' => $row['order'],
                ]
            );
        }
    }
}
