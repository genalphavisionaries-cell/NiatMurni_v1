<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vouchers', function (Blueprint $table): void {
            $table->id();
            $table->string('code')->unique();
            $table->string('type');
            $table->decimal('value', 12, 2)->nullable();
            $table->integer('min_seats')->nullable();
            $table->integer('max_uses')->nullable();
            $table->integer('used_count')->default(0);
            $table->dateTime('valid_from')->nullable();
            $table->dateTime('valid_until')->nullable();
            $table->foreignId('applicable_class_session_id')
                ->nullable()
                ->constrained('class_sessions')
                ->nullOnDelete();
            $table->string('status')->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index('code');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};

