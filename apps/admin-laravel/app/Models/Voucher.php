<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Voucher extends Model
{
    use SoftDeletes;

    // STANDARD VOUCHER TYPES - DO NOT MODIFY WITHOUT SYSTEM REVIEW
    public const TYPE_FIXED = 'fixed';
    public const TYPE_PERCENTAGE = 'percentage';
    public const TYPE_FREE_DELIVERY = 'free_delivery';

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';

    public const TYPES = [
        self::TYPE_FIXED,
        self::TYPE_PERCENTAGE,
        self::TYPE_FREE_DELIVERY,
    ];

    public const STATUSES = [
        self::STATUS_ACTIVE,
        self::STATUS_INACTIVE,
    ];

    protected $fillable = [
        'code',
        'type',
        'value',
        'min_seats',
        'max_uses',
        'used_count',
        'valid_from',
        'valid_until',
        'applicable_class_session_id',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'valid_from' => 'datetime',
            'valid_until' => 'datetime',
        ];
    }

    public function applicableClassSession(): BelongsTo
    {
        return $this->belongsTo(ClassSession::class, 'applicable_class_session_id');
    }
}

