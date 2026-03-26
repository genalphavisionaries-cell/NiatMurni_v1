<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            if (! Schema::hasColumn('reservations', 'full_name')) {
                $table->string('full_name')->nullable()->after('hold_reference');
            }
            if (! Schema::hasColumn('reservations', 'identity_no')) {
                $table->string('identity_no')->nullable()->after('full_name');
            }
            if (! Schema::hasColumn('reservations', 'phone')) {
                $table->string('phone')->nullable()->after('identity_no');
            }
            if (! Schema::hasColumn('reservations', 'email')) {
                $table->string('email')->nullable()->after('phone');
            }
            if (! Schema::hasColumn('reservations', 'company_name')) {
                $table->string('company_name')->nullable()->after('email');
            }
            if (! Schema::hasColumn('reservations', 'delivery_address')) {
                $table->text('delivery_address')->nullable()->after('company_name');
            }
            if (! Schema::hasColumn('reservations', 'delivery_type')) {
                $table->string('delivery_type', 32)->nullable()->after('delivery_address');
            }
            if (! Schema::hasColumn('reservations', 'delivery_fee')) {
                $table->decimal('delivery_fee', 10, 2)->default(0)->after('delivery_type');
            }
            if (! Schema::hasColumn('reservations', 'course_amount')) {
                $table->decimal('course_amount', 10, 2)->default(0)->after('delivery_fee');
            }
            if (! Schema::hasColumn('reservations', 'total_amount')) {
                $table->decimal('total_amount', 10, 2)->default(0)->after('course_amount');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $columns = [
                'full_name',
                'identity_no',
                'phone',
                'email',
                'company_name',
                'delivery_address',
                'delivery_type',
                'delivery_fee',
                'course_amount',
                'total_amount',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('reservations', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
