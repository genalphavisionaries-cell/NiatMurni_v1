<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Evolve certificate_templates into structured placeholder-based template.
     * Keeps existing html_content nullable for backward compatibility (deprecated).
     */
    public function up(): void
    {
        Schema::table('certificate_templates', function (Blueprint $table) {
            // Make html_content nullable; deprecated in favor of body_content/structured fields
            $table->longText('html_content')->nullable()->change();

            $table->string('code')->nullable()->unique()->after('name');
            $table->string('subtitle')->nullable()->after('code');
            $table->text('body_content')->nullable()->after('subtitle');
            $table->text('footer_text')->nullable()->after('body_content');

            $table->string('page_size')->nullable()->default('A4')->after('footer_text');
            $table->string('orientation')->nullable()->after('page_size');
            $table->string('title_alignment')->nullable()->after('orientation');
            $table->string('subtitle_alignment')->nullable()->after('title_alignment');
            $table->string('body_alignment')->nullable()->after('subtitle_alignment');
            $table->string('footer_alignment')->nullable()->after('body_alignment');

            $table->unsignedSmallInteger('title_font_size')->nullable()->after('footer_alignment');
            $table->unsignedSmallInteger('subtitle_font_size')->nullable()->after('title_font_size');
            $table->unsignedSmallInteger('body_font_size')->nullable()->after('subtitle_font_size');
            $table->unsignedSmallInteger('footer_font_size')->nullable()->after('body_font_size');

            $table->boolean('show_logo')->default(true)->after('footer_font_size');
            $table->boolean('show_left_signature')->default(true)->after('show_logo');
            $table->boolean('show_right_signature')->default(true)->after('show_left_signature');
            $table->unsignedSmallInteger('content_top_offset')->nullable()->after('show_right_signature');
            $table->unsignedSmallInteger('content_bottom_offset')->nullable()->after('content_top_offset');

            $table->string('background_image_path')->nullable()->after('content_bottom_offset');
            $table->string('logo_path')->nullable()->after('background_image_path');
            $table->string('left_signature_image_path')->nullable()->after('logo_path');
            $table->string('right_signature_image_path')->nullable()->after('left_signature_image_path');

            $table->string('organization_name')->nullable()->after('right_signature_image_path');
            $table->text('organization_details')->nullable()->after('organization_name');
            $table->string('left_signatory_name')->nullable()->after('organization_details');
            $table->string('left_signatory_title')->nullable()->after('left_signatory_name');
            $table->string('right_signatory_name')->nullable()->after('left_signatory_title');
            $table->string('right_signatory_title')->nullable()->after('right_signatory_name');
        });
        // is_active: leave DB default as-is; application should set is_active = false for new templates until one is activated
    }

    public function down(): void
    {
        Schema::table('certificate_templates', function (Blueprint $table) {
            $table->dropColumn([
                'code', 'subtitle', 'body_content', 'footer_text',
                'page_size', 'orientation', 'title_alignment', 'subtitle_alignment',
                'body_alignment', 'footer_alignment',
                'title_font_size', 'subtitle_font_size', 'body_font_size', 'footer_font_size',
                'show_logo', 'show_left_signature', 'show_right_signature',
                'content_top_offset', 'content_bottom_offset',
                'background_image_path', 'logo_path', 'left_signature_image_path', 'right_signature_image_path',
                'organization_name', 'organization_details',
                'left_signatory_name', 'left_signatory_title', 'right_signatory_name', 'right_signatory_title',
            ]);
        });
    }
};
