<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DemandRequest extends Model
{
    protected $fillable = [
        'employer_id',
        'contact_name',
        'email',
        'phone',
        'program_id',
        'preferred_date',
        'preferred_mode',
        'location',
        'expected_participants',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'preferred_date' => 'date',
        ];
    }

    public function employer(): BelongsTo
    {
        return $this->belongsTo(Employer::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }
}
