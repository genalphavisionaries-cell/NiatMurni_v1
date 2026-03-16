<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Shipment extends Model
{
    protected $fillable = [
        'certificate_id',
        'shipment_status',
        'carrier',
        'tracking_number',
        'recipient_name',
        'address_line1',
        'address_line2',
        'city',
        'state',
        'postcode',
        'country',
        'shipped_at',
        'delivered_at',
    ];

    protected function casts(): array
    {
        return [
            'shipped_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }

    public function certificate(): BelongsTo
    {
        return $this->belongsTo(Certificate::class);
    }
}
