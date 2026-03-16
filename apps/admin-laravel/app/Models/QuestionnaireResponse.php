<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionnaireResponse extends Model
{
    protected $fillable = [
        'class_questionnaire_id',
        'booking_id',
        'participant_id',
        'submitted_at',
        'score',
        'answers',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'answers' => 'array',
        ];
    }

    public function classQuestionnaire(): BelongsTo
    {
        return $this->belongsTo(ClassQuestionnaire::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(Participant::class);
    }
}
