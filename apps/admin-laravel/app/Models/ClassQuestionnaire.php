<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClassQuestionnaire extends Model
{
    protected $fillable = [
        'class_session_id',
        'question_bank_id',
        'status',
        'assigned_at',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'assigned_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function classSession(): BelongsTo
    {
        return $this->belongsTo(ClassSession::class);
    }

    public function questionBank(): BelongsTo
    {
        return $this->belongsTo(QuestionBank::class);
    }

    public function responses(): HasMany
    {
        return $this->hasMany(QuestionnaireResponse::class);
    }
}
