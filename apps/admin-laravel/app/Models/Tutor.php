<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;

class Tutor extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;

    public const STATUS_PENDING_REVIEW = 'pending_review';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_SUSPENDED = 'suspended';
    public const STATUS_INACTIVE = 'inactive';
    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'tutor_code',
        'full_name',
        'identity_no',
        'phone',
        'email',
        'password',
        'address',
        'profile_photo_url',
        'kkm_cert_no',
        'emergency_contact',
        'approved_at',
        'approved_by',
        // Legacy/compatibility fields used by existing modules.
        'user_id',
        'registration_number',
        'bio',
        'hourly_rate_cents',
        'default_share_percent',
        'bank_name',
        'bank_account_no',
        'bank_account_name',
        'bank_account_number',
        'payout_type',
        'payout_percent',
        'payout_per_student_cents',
        'payout_per_class_cents',
        'status',
    ];

    protected $hidden = [
        'password',
    ];

    protected static function booted(): void
    {
        static::creating(function (Tutor $tutor): void {
            if (empty($tutor->tutor_code)) {
                $tutor->tutor_code = static::nextTutorCode();
            }

            if (empty($tutor->status)) {
                $tutor->status = self::STATUS_PENDING_REVIEW;
            }
        });
    }

    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
            'default_share_percent' => 'decimal:2',
            'payout_percent' => 'decimal:2',
        ];
    }

    public function setPasswordAttribute(?string $value): void
    {
        if ($value === null || $value === '') {
            return;
        }

        $this->attributes['password'] = Hash::needsRehash($value)
            ? Hash::make($value)
            : $value;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function classes(): HasMany
    {
        return $this->hasMany(ClassSession::class);
    }

    public function classSessions(): HasMany
    {
        return $this->classes();
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

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING_REVIEW;
    }

    private static function nextTutorCode(): string
    {
        $year = now()->format('Y');

        return DB::transaction(function () use ($year): string {
            $latestCode = static::query()
                ->where('tutor_code', 'like', $year . '%')
                ->lockForUpdate()
                ->orderByDesc('tutor_code')
                ->value('tutor_code');

            $nextNumber = $latestCode ? ((int) substr((string) $latestCode, 4)) + 1 : 1;

            return $year . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
        }, 3);
    }
}
