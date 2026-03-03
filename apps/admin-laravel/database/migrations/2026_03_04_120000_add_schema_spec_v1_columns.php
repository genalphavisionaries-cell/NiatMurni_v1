<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add columns from NiatMurni_Complete_Database_Schema_Specification_v1.pdf
     * without changing PKs to UUID or renaming existing columns.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 30)->nullable()->after('role');
            $table->boolean('is_active')->default(true)->after('phone');
            $table->timestamp('last_login_at')->nullable()->after('is_active');
        });

        Schema::table('employers', function (Blueprint $table) {
            $table->text('billing_address')->nullable()->after('phone');
            $table->string('stripe_customer_id', 100)->nullable()->after('billing_address');
            $table->string('status')->default('active')->after('stripe_customer_id'); // active, inactive
        });

        Schema::table('participants', function (Blueprint $table) {
            $table->string('nationality', 100)->nullable()->after('nric_passport');
            $table->date('date_of_birth')->nullable()->after('nationality');
            $table->string('gender', 20)->nullable()->after('date_of_birth');
            $table->boolean('is_blacklisted')->default(false)->after('employer_id');
            $table->softDeletes();
        });

        Schema::table('programs', function (Blueprint $table) {
            $table->string('delivery_mode')->nullable()->after('description'); // physical, online, hybrid
            $table->unsignedInteger('duration_hours')->nullable()->after('delivery_mode');
            $table->decimal('price', 10, 2)->nullable()->after('duration_hours');
            $table->boolean('is_active')->default(true)->after('price');
        });

        Schema::table('class_sessions', function (Blueprint $table) {
            $table->string('location', 200)->nullable()->after('language'); // spec name; we keep venue too for compatibility
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->string('booking_reference', 50)->nullable()->unique()->after('class_session_id');
            $table->string('payment_status')->default('unpaid')->after('status'); // unpaid, paid, refunded, failed
            $table->decimal('payment_amount', 10, 2)->nullable()->after('stripe_invoice_id');
            $table->string('payment_method', 50)->nullable()->after('payment_amount');
            $table->string('booked_by_type')->default('individual')->after('payment_method'); // individual, corporate, admin
        });

        Schema::table('attendance_records', function (Blueprint $table) {
            $table->unsignedInteger('attendance_duration_minutes')->nullable()->after('duration_seconds');
            $table->foreignId('verified_by')->nullable()->after('recorded_by')->constrained('users')->nullOnDelete();
        });

        Schema::table('certificates', function (Blueprint $table) {
            $table->text('generated_pdf_path')->nullable()->after('revoked_by');
        });

        Schema::create('stripe_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_id', 150)->unique();
            $table->string('event_type', 100);
            $table->json('payload')->nullable();
            $table->boolean('processed')->default(false);
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stripe_events');

        Schema::table('certificates', fn (Blueprint $table) => $table->dropColumn('generated_pdf_path'));
        Schema::table('attendance_records', function (Blueprint $table) {
            $table->dropForeign(['verified_by']);
            $table->dropColumn(['attendance_duration_minutes', 'verified_by']);
        });
        Schema::table('bookings', fn (Blueprint $table) => $table->dropColumn(['booking_reference', 'payment_status', 'payment_amount', 'payment_method', 'booked_by_type']));
        Schema::table('class_sessions', fn (Blueprint $table) => $table->dropColumn('location'));
        Schema::table('programs', fn (Blueprint $table) => $table->dropColumn(['delivery_mode', 'duration_hours', 'price', 'is_active']));
        Schema::table('participants', function (Blueprint $table) {
            $table->dropColumn(['nationality', 'date_of_birth', 'gender', 'is_blacklisted']);
            $table->dropSoftDeletes();
        });
        Schema::table('employers', fn (Blueprint $table) => $table->dropColumn(['billing_address', 'stripe_customer_id', 'status']));
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn(['phone', 'is_active', 'last_login_at']));
    }
};
