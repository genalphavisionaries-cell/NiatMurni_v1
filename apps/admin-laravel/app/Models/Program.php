<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Program extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'default_capacity',
        'min_threshold_minutes',
        'base_price_cents',
        'language',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function classSessions(): HasMany
    {
        return $this->hasMany(ClassSession::class);
    }

    public function questionBanks(): HasMany
    {
        return $this->hasMany(QuestionBank::class);
    }
}
