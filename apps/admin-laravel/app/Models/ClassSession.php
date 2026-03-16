<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClassSession extends Model
{
    protected $table = 'class_sessions';

    protected $fillable = [
        'program_id',
        'tutor_id',
        'starts_at',
        'ends_at',
        'mode',
        'language',
        'venue',
        'location',
        'capacity',
        'min_threshold_minutes',
        'price_cents',
        'status',
        'zoom_meeting_id',
        'zoom_join_url',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(Tutor::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function classQuestionnaires(): HasMany
    {
        return $this->hasMany(ClassQuestionnaire::class);
    }

    public function tutorEarnings(): HasMany
    {
        return $this->hasMany(TutorEarning::class);
    }
}
