<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Program extends Model
{
    protected $fillable = [
        'public_id',
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

    protected static function booted(): void
    {
        static::creating(function (Program $program): void {
            if (empty($program->public_id)) {
                $program->public_id = (string) Str::uuid();
            }
        });
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
