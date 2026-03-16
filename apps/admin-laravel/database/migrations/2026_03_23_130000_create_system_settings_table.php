<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * System settings for external integrations (Stripe, Zoom, email, etc.).
     */
    public function up(): void
    {
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();

            $table->string('key')->unique();
            $table->text('value')->nullable();

            // Group examples: stripe, zoom, email, sms, system
            $table->string('group', 50)->default('system');

            // Type examples: string, boolean, json, number
            $table->string('type', 32)->default('string');

            $table->boolean('is_encrypted')->default(false);

            $table->timestamps();

            $table->index('group');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};

