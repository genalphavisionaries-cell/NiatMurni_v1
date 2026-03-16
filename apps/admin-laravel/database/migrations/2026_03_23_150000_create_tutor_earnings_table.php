<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tutor earnings/commissions per booking.
     */
    public function up(): void
    {
        Schema::create('tutor_earnings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->cascadeOnDelete();

            $table->foreignId('tutor_id')
                ->constrained('tutors')
                ->cascadeOnDelete();

            $table->integer('amount_cents');

            // pending, payable, paid
            $table->string('status', 32)->default('pending');

            $table->timestamp('paid_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tutor_earnings');
    }
};

