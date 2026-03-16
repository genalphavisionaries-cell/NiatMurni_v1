<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Payments recorded for external providers (e.g. Stripe).
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->cascadeOnDelete();

            // Provider name (e.g. stripe, billplz, etc.)
            $table->string('provider');

            // Provider payment identifier (e.g. Stripe payment_intent id)
            $table->string('provider_payment_id')->nullable();

            $table->integer('amount_cents');

            $table->string('currency', 10)->default('myr');

            // pending, paid, failed, refunded
            $table->string('status');

            $table->timestamp('paid_at')->nullable();

            $table->json('provider_payload')->nullable();

            $table->timestamps();

            $table->index('provider_payment_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

