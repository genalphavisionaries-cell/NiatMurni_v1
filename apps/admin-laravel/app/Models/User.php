<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'employer_id',
        'phone',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
        ];
    }

    public function canAccessAdmin(): bool
    {
        return in_array($this->role, ['admin', 'tutor', 'staff'], true);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isTrainer(): bool
    {
        return $this->role === 'tutor';
    }

    public function employer(): BelongsTo
    {
        return $this->belongsTo(Employer::class);
    }

    public function tutor(): HasOne
    {
        return $this->hasOne(Tutor::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }
}
