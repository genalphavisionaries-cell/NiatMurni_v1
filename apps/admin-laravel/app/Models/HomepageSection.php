<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomepageSection extends Model
{
    protected $fillable = [
        'section_key',
        'name',
        'is_active',
        'sort_order',
        'title',
        'subtitle',
        'description',
        'image_url',
        'button_primary_label',
        'button_primary_url',
        'button_secondary_label',
        'button_secondary_url',
        'extra_data',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'extra_data' => 'array',
        ];
    }
}
