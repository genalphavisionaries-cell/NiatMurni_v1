<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomepageSetting extends Model
{
    protected $table = 'homepage_settings';

    protected $fillable = [
        'site_name',
        'logo_url',
        'logo_alt',
        'header_nav',
        'footer_columns',
        'footer_bottom',
        'hero',
        'main_banners',
    ];

    protected function casts(): array
    {
        return [
            'header_nav' => 'array',
            'footer_columns' => 'array',
            'hero' => 'array',
            'main_banners' => 'array',
        ];
    }

    public static function singleton(): self
    {
        $setting = static::first();
        if (! $setting) {
            $setting = static::create([
                'site_name' => 'Niat Murni Academy',
                'logo_alt' => 'Niat Murni Academy',
                'header_nav' => [
                    ['label' => 'Programs', 'href' => '#programs'],
                    ['label' => 'Upcoming Classes', 'href' => '#classes'],
                    ['label' => 'Register', 'href' => '#register'],
                    ['label' => 'Contact', 'href' => '#contact'],
                ],
                'footer_columns' => [
                    ['heading' => 'Programs', 'links' => [['label' => 'KKM Food Handling', 'href' => '/#programs'], ['label' => 'Upcoming Classes', 'href' => '/#classes']]],
                    ['heading' => 'Company', 'links' => [['label' => 'About Us', 'href' => '/#about'], ['label' => 'Contact', 'href' => '/#contact']]],
                    ['heading' => 'Support', 'links' => [['label' => 'View My Booking', 'href' => '/booking/1'], ['label' => 'FAQ', 'href' => '/#faq']]],
                ],
                'footer_bottom' => '© Niat Murni Academy. All rights reserved.',
                'hero' => [
                    'headline' => 'Professional Food Safety Training',
                    'subheadline' => 'KKM-recognised courses for food handlers. Get certified with industry-leading training—online or in person.',
                    'ctaText' => 'View Upcoming Classes',
                    'ctaHref' => '#classes',
                    'backgroundImageUrl' => null,
                    'overlayOpacity' => 0.4,
                ],
                'main_banners' => [
                    ['id' => '1', 'title' => 'KKM Food Handler Certification', 'description' => 'Meet regulatory requirements with our accredited food safety programme.', 'imageUrl' => null, 'ctaText' => 'Register Now', 'ctaHref' => '#classes', 'variant' => 'default'],
                    ['id' => '2', 'title' => 'Flexible Learning Options', 'description' => 'Choose online or physical classes. We run sessions in multiple languages.', 'imageUrl' => null, 'ctaText' => 'See Schedule', 'ctaHref' => '#classes', 'variant' => 'reverse'],
                ],
            ]);
        }
        return $setting;
    }
}
