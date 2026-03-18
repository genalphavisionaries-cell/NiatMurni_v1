<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Structured homepage sections (URL fields for images, e.g. Cloudinary).
     */
    public function up(): void
    {
        if (Schema::hasTable('homepage_sections')) {
            return;
        }

        Schema::create('homepage_sections', function (Blueprint $table) {
            $table->id();
            $table->string('section_key')->unique();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();
            $table->text('description')->nullable();
            $table->string('image_url', 2048)->nullable();
            $table->string('button_primary_label')->nullable();
            $table->string('button_primary_url', 2048)->nullable();
            $table->string('button_secondary_label')->nullable();
            $table->string('button_secondary_url', 2048)->nullable();
            $table->json('extra_data')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('homepage_sections');
    }
};
