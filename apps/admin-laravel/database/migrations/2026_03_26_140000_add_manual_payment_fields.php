<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (! Schema::hasColumn('payments', 'reservation_id')) {
                $table->foreignId('reservation_id')
                    ->nullable()
                    ->after('booking_id')
                    ->constrained('reservations')
                    ->nullOnDelete();
            }

            if (Schema::hasColumn('payments', 'booking_id')) {
                $table->foreignId('booking_id')->nullable()->change();
            }

            if (! Schema::hasColumn('payments', 'method')) {
                $table->string('method', 32)->nullable()->after('provider');
            }

            if (! Schema::hasColumn('payments', 'receipt_url')) {
                $table->string('receipt_url')->nullable()->after('status');
            }

            if (! Schema::hasColumn('payments', 'admin_note')) {
                $table->text('admin_note')->nullable()->after('receipt_url');
            }
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            if (Schema::hasColumn('payments', 'admin_note')) {
                $table->dropColumn('admin_note');
            }
            if (Schema::hasColumn('payments', 'receipt_url')) {
                $table->dropColumn('receipt_url');
            }
            if (Schema::hasColumn('payments', 'method')) {
                $table->dropColumn('method');
            }
            if (Schema::hasColumn('payments', 'reservation_id')) {
                $table->dropConstrainedForeignId('reservation_id');
            }
        });
    }
};
