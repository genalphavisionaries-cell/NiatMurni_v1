<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Structured header/footer navigation (dropdowns via parent_id).
     * URLs are intended for full paths or Cloudinary URLs where applicable.
     */
    public function up(): void
    {
        if (Schema::hasTable('site_navigation_items')) {
            return;
        }

        Schema::create('site_navigation_items', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->string('url', 2048)->nullable();
            $table->string('location', 32)->index(); // header | footer
            $table->foreignId('parent_id')->nullable()->constrained('site_navigation_items')->nullOnDelete();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('open_in_new_tab')->default(false);
            $table->boolean('is_button')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_navigation_items');
    }
};
