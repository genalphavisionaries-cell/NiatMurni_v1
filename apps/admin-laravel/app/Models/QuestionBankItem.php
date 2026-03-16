<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionBankItem extends Model
{
    protected $fillable = [
        'question_bank_id',
        'order',
        'question_text',
        'question_type',
        'options',
        'is_required',
    ];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'is_required' => 'boolean',
        ];
    }

    public function questionBank(): BelongsTo
    {
        return $this->belongsTo(QuestionBank::class);
    }
}
