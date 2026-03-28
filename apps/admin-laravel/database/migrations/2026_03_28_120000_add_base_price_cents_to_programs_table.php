<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('programs')) {
            return;
        }

        if (Schema::hasColumn('programs', 'base_price_cents')) {
            return;
        }

        Schema::table('programs', function (Blueprint $table) {
            $table->unsignedBigInteger('base_price_cents')->nullable();
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('programs') || ! Schema::hasColumn('programs', 'base_price_cents')) {
            return;
        }

        Schema::table('programs', function (Blueprint $table) {
            $table->dropColumn('base_price_cents');
        });
    }
};
