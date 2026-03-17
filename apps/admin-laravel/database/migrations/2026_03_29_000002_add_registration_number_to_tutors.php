<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add tutor registration/license number for certificate signatory display.
     */
    public function up(): void
    {
        Schema::table('tutors', function (Blueprint $table) {
            $table->string('registration_number')->nullable()->after('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('tutors', function (Blueprint $table) {
            $table->dropColumn('registration_number');
        });
    }
};
