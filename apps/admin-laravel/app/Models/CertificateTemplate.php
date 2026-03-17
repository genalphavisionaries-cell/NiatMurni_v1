<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CertificateTemplate extends Model
{
    protected $fillable = [
        'name',
        'code',
        'subtitle',
        'body_content',
        'footer_text',
        'html_content', // deprecated; kept for backward compatibility
        'page_size',
        'orientation',
        'title_alignment',
        'subtitle_alignment',
        'body_alignment',
        'footer_alignment',
        'title_font_size',
        'subtitle_font_size',
        'body_font_size',
        'footer_font_size',
        'show_logo',
        'show_left_signature',
        'show_right_signature',
        'content_top_offset',
        'content_bottom_offset',
        'background_image_path',
        'logo_path',
        'left_signature_image_path',
        'right_signature_image_path',
        'organization_name',
        'organization_details',
        'left_signatory_name',
        'left_signatory_title',
        'right_signatory_name',
        'right_signatory_title',
        'is_active',
    ];

    protected $attributes = [
        'is_active' => false,
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'show_logo' => 'boolean',
            'show_left_signature' => 'boolean',
            'show_right_signature' => 'boolean',
            'title_font_size' => 'integer',
            'subtitle_font_size' => 'integer',
            'body_font_size' => 'integer',
            'footer_font_size' => 'integer',
            'content_top_offset' => 'integer',
            'content_bottom_offset' => 'integer',
        ];
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }
}
