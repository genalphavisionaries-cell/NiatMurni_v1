<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('programs')->cascadeOnDelete();
            $table->foreignId('trainer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->string('mode'); // online, physical
            $table->string('language')->nullable();
            $table->string('venue')->nullable();
            $table->unsignedInteger('capacity')->default(30);
            $table->unsignedInteger('min_threshold')->default(1);
            $table->string('status')->default('confirmed'); // draft, confirmed, ongoing, completed, cancelled, archived
            $table->string('zoom_meeting_id')->nullable();
            $table->string('zoom_join_url')->nullable();
            $table->timestamps();
        });

        Schema::table('class_sessions', function (Blueprint $table) {
            $table->index(['starts_at', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_sessions');
    }
};
