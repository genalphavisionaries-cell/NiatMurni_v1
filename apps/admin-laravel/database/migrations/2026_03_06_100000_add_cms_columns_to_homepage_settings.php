<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('homepage_settings', function (Blueprint $table) {
            $table->string('footer_logo_url')->nullable()->after('footer_bottom');
            $table->text('footer_description')->nullable()->after('footer_logo_url');
            $table->string('footer_ssl_badge_url')->nullable()->after('footer_description');
            $table->json('payment_method_icons')->nullable()->after('footer_ssl_badge_url');
            $table->json('why_choose')->nullable()->after('main_banners');
            $table->json('social_proof')->nullable()->after('why_choose');
        });
    }

    public function down(): void
    {
        Schema::table('homepage_settings', function (Blueprint $table) {
            $table->dropColumn([
                'footer_logo_url',
                'footer_description',
                'footer_ssl_badge_url',
                'payment_method_icons',
                'why_choose',
                'social_proof',
            ]);
        });
    }
};
