<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Participant extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'full_name',
        'nric_passport',
        'nationality',
        'phone',
        'email',
        'employer_id',
        'user_id',
        'date_of_birth',
        'gender',
        'is_blacklisted',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'is_blacklisted' => 'boolean',
        ];
    }

    public function employer(): BelongsTo
    {
        return $this->belongsTo(Employer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
