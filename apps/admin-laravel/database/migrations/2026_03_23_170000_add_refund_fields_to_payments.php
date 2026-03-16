<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add refund tracking fields to payments table.
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->timestamp('refunded_at')
                ->nullable()
                ->after('paid_at');

            $table->integer('refund_amount_cents')
                ->nullable()
                ->after('refunded_at');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['refunded_at', 'refund_amount_cents']);
        });
    }
};
