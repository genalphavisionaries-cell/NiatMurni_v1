<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('homepage_settings', function (Blueprint $table) {
            $table->id();
            $table->string('site_name')->default('Niat Murni Academy');
            $table->string('logo_url')->nullable();
            $table->string('logo_alt')->nullable();
            $table->json('header_nav')->nullable();
            $table->json('footer_columns')->nullable();
            $table->text('footer_bottom')->nullable();
            $table->json('hero')->nullable();
            $table->json('main_banners')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('homepage_settings');
    }
};
