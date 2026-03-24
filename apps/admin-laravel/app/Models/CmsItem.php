<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CmsItem extends Model
{
    protected $fillable = [
        'section_id',
        'type',
        'title',
        'subtitle',
        'description',
        'image_url',
        'icon_url',
        'link_url',
        'extra_json',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'extra_json' => 'array',
        ];
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(CmsSection::class, 'section_id');
    }
}
