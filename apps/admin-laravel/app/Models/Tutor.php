<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tutor extends Model
{
    protected $fillable = [
        'user_id',
        'bio',
        'hourly_rate_cents',
        'default_share_percent',
        'bank_name',
        'bank_account_name',
        'bank_account_number',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'default_share_percent' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function classSessions(): HasMany
    {
        return $this->hasMany(ClassSession::class);
    }

    public function tutorEarnings(): HasMany
    {
        return $this->hasMany(TutorEarning::class);
    }

    public function tutorInvoices(): HasMany
    {
        return $this->hasMany(TutorInvoice::class);
    }

    public function tutorPayouts(): HasMany
    {
        return $this->hasMany(TutorPayout::class);
    }
}
