<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add attendance_status and exam_passed to bookings for attendance and exam validation.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('attendance_status', 32)->nullable()->after('cancelled_at');
            $table->boolean('exam_passed')->nullable()->default(null)->after('attendance_status');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['attendance_status', 'exam_passed']);
        });
    }
};
