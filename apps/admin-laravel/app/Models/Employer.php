<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employer extends Model
{
    protected $fillable = [
        'name',
        'ssm_reg_no',
        'contact_person',
        'email',
        'phone',
        'billing_address',
        'stripe_customer_id',
        'status',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function demandRequests(): HasMany
    {
        return $this->hasMany(DemandRequest::class);
    }
}
