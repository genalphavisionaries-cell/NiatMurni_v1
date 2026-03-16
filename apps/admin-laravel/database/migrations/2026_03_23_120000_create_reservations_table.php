<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Reservations for holding seats before bookings.
     */
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('class_session_id')
                ->constrained('class_sessions')
                ->cascadeOnDelete();

            $table->foreignId('participant_id')
                ->constrained('participants')
                ->cascadeOnDelete();

            $table->foreignId('employer_id')
                ->nullable()
                ->constrained('employers')
                ->nullOnDelete();

            $table->integer('seats_reserved');

            // reserved, expired, converted, cancelled
            $table->string('status', 32)->default('reserved');

            $table->timestamp('expires_at');

            $table->foreignId('converted_booking_id')
                ->nullable()
                ->constrained('bookings')
                ->nullOnDelete();

            $table->timestamps();

            $table->index(['class_session_id', 'expires_at'], 'idx_reservations_class_expires');
            $table->index(['status', 'expires_at'], 'idx_reservations_status_expires');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};

