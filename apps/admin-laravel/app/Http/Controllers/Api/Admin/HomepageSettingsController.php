<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\HomepageSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomepageSettingsController extends Controller
{
    /**
     * Update homepage settings (CMS). Accepts JSON matching HomepageSetting fillable.
     */
    public function update(Request $request): JsonResponse
    {
        $setting = HomepageSetting::singleton();

        $validated = $request->validate([
            'site_name' => 'sometimes|string|max:255',
            'logo_url' => 'nullable|string|max:500',
            'logo_alt' => 'nullable|string|max:255',
            'header_nav' => 'nullable|array',
            'header_nav.*.label' => 'string|max:100',
            'header_nav.*.href' => 'string|max:500',
            'header_nav.*.external' => 'boolean',
            'footer_columns' => 'nullable|array',
            'footer_columns.*.heading' => 'string|max:100',
            'footer_columns.*.links' => 'array',
            'footer_columns.*.links.*.label' => 'string|max:100',
            'footer_columns.*.links.*.href' => 'string|max:500',
            'footer_columns.*.links.*.external' => 'boolean',
            'footer_bottom' => 'nullable|string',
            'footer_logo_url' => 'nullable|string|max:500',
            'footer_description' => 'nullable|string',
            'footer_ssl_badge_url' => 'nullable|string|max:500',
            'payment_method_icons' => 'nullable|array',
            'hero' => 'nullable|array',
            'hero.headline' => 'string|max:255',
            'hero.subheadline' => 'string',
            'hero.ctaText' => 'string|max:100',
            'hero.ctaHref' => 'string|max:500',
            'hero.backgroundImageUrl' => 'nullable|string|max:500',
            'hero.overlayOpacity' => 'numeric|min:0|max:1',
            'main_banners' => 'nullable|array',
            'main_banners.*.id' => 'string|max:50',
            'main_banners.*.title' => 'string|max:255',
            'main_banners.*.description' => 'nullable|string',
            'main_banners.*.imageUrl' => 'nullable|string|max:500',
            'main_banners.*.ctaText' => 'string|max:100',
            'main_banners.*.ctaHref' => 'string|max:500',
            'main_banners.*.variant' => 'string|in:default,reverse',
            'why_choose' => 'nullable|array',
            'why_choose.title' => 'string|max:255',
            'why_choose.subtitle' => 'nullable|string',
            'why_choose.image' => 'nullable|string|max:500',
            'why_choose.benefits' => 'nullable|array',
            'why_choose.benefits.*.icon' => 'string|max:50',
            'why_choose.benefits.*.title' => 'string|max:255',
            'why_choose.benefits.*.description' => 'nullable|string',
            'why_choose.benefits.*.order' => 'integer',
            'social_proof' => 'nullable|array',
            'social_proof.title' => 'string|max:255',
            'social_proof.subtitle' => 'nullable|string',
            'social_proof.google_rating' => 'numeric|min:0|max:5',
            'social_proof.review_count' => 'integer|min:0',
            'social_proof.brand_logos' => 'nullable|array',
            'social_proof.brand_logos.*.company_name' => 'string|max:100',
            'social_proof.brand_logos.*.logo' => 'nullable|string|max:500',
            'social_proof.brand_logos.*.order' => 'integer',
            'social_proof.testimonials' => 'nullable|array',
            'social_proof.testimonials.*.name' => 'string|max:100',
            'social_proof.testimonials.*.role' => 'nullable|string|max:100',
            'social_proof.testimonials.*.date' => 'nullable|string|max:50',
            'social_proof.testimonials.*.rating' => 'integer|min:0|max:5',
            'social_proof.testimonials.*.review' => 'nullable|string',
            'social_proof.testimonials.*.avatar' => 'nullable|string|max:500',
            'social_proof.testimonials.*.order' => 'integer',
        ]);

        $setting->update($validated);

        return response()->json(['message' => 'Homepage settings updated', 'id' => $setting->id]);
    }
}
