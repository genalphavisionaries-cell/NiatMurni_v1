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

    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class);
    }
}
