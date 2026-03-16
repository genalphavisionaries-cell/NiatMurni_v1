<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add payout configuration fields to tutors.
     */
    public function up(): void
    {
        Schema::table('tutors', function (Blueprint $table) {
            $table->string('payout_type', 32)
                ->default('percent')
                ->after('default_share_percent');

            $table->decimal('payout_percent', 5, 2)
                ->nullable()
                ->after('payout_type');

            $table->integer('payout_per_student_cents')
                ->nullable()
                ->after('payout_percent');

            $table->integer('payout_per_class_cents')
                ->nullable()
                ->after('payout_per_student_cents');
        });
    }

    public function down(): void
    {
        Schema::table('tutors', function (Blueprint $table) {
            $table->dropColumn([
                'payout_type',
                'payout_percent',
                'payout_per_student_cents',
                'payout_per_class_cents',
            ]);
        });
    }
};

