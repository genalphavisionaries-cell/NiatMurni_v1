<?php

namespace App\Http\Requests\Cms;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHomepageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    public function rules(): array
    {
        return [
            // Hero section
            'hero' => 'sometimes|array',
            'hero.title' => 'nullable|string|max:255',
            'hero.subtitle' => 'nullable|string|max:500',
            'hero.buttons' => 'nullable|array|max:2',
            'hero.buttons.*.label' => 'nullable|string|max:100',
            'hero.buttons.*.url' => 'nullable|string|max:2048',
            'hero.background_urls' => 'nullable|string|max:5000',

            // Why Choose Us section  
            'why_choose_us' => 'sometimes|array',
            'why_choose_us.title' => 'nullable|string|max:255',
            'why_choose_us.description' => 'nullable|string|max:1000',
            'why_choose_us.points' => 'nullable|array|max:6',
            'why_choose_us.points.*.title' => 'required_with:why_choose_us.points|string|max:200',
            'why_choose_us.points.*.description' => 'nullable|string|max:500',
            'why_choose_us.side_images_urls' => 'nullable|string|max:3000',

            // Testimonials section
            'testimonials' => 'sometimes|array',
            'testimonials.google_rating_text' => 'nullable|string|max:500',
            'testimonials.google_button_label' => 'nullable|string|max:100',
            'testimonials.google_button_url' => 'nullable|string|max:2048',
            'testimonials.logos' => 'nullable|array|max:20',
            'testimonials.logos.*.title' => 'required_with:testimonials.logos|string|max:100',
            'testimonials.logos.*.image_url' => 'nullable|string|max:2048',

            // CTA/Promotions section
            'cta' => 'sometimes|array',
            'cta.title' => 'nullable|string|max:255',
            'cta.description' => 'nullable|string|max:1000',
            'cta.banner_urls' => 'nullable|string|max:3000',
            'cta.cards' => 'nullable|array|max:10',
            'cta.cards.*.title' => 'required_with:cta.cards|string|max:200',
            'cta.cards.*.description' => 'nullable|string|max:500',
            'cta.cards.*.image_url' => 'nullable|string|max:2048',
            'cta.cards.*.url' => 'nullable|string|max:2048',
            'cta.cards.*.button_label' => 'nullable|string|max:100',

            // Header section
            'header' => 'sometimes|array',
            'header.logo_url' => 'nullable|string|max:2048',
            'header.menu_items' => 'nullable|array|max:20',
            'header.menu_items.*.label' => 'required_with:header.menu_items|string|max:100',
            'header.menu_items.*.url' => 'nullable|string|max:2048',

            // Footer section
            'footer' => 'sometimes|array',
            'footer.quick_links' => 'nullable|array|max:20',
            'footer.quick_links.*.label' => 'required_with:footer.quick_links|string|max:100',
            'footer.quick_links.*.url' => 'nullable|string|max:2048',
            'footer.buttons' => 'nullable|array|max:10',
            'footer.buttons.*.label' => 'required_with:footer.buttons|string|max:100',
            'footer.buttons.*.url' => 'nullable|string|max:2048',
            'footer.legal_links' => 'nullable|array|max:10',
            'footer.legal_links.*.label' => 'required_with:footer.legal_links|string|max:100',
            'footer.legal_links.*.url' => 'nullable|string|max:2048',

            // Floating menu section
            'floating_menu' => 'sometimes|array',
            'floating_menu.items' => 'nullable|array|max:10',
            'floating_menu.items.*.label' => 'required_with:floating_menu.items|string|max:100',
            'floating_menu.items.*.url' => 'nullable|string|max:2048',

            // Legacy aliases
            'usp' => 'sometimes|array',
            'trust' => 'sometimes|array',
            'promo' => 'sometimes|array',
        ];
    }

    public function messages(): array
    {
        return [
            'hero.buttons.max' => 'Hero section can have maximum 2 buttons.',
            'why_choose_us.points.max' => 'Why Choose Us section can have maximum 6 points.',
            'testimonials.logos.max' => 'Testimonials section can have maximum 20 brand logos.',
            'cta.cards.max' => 'CTA section can have maximum 10 promotional cards.',
            'header.menu_items.max' => 'Header can have maximum 20 menu items.',
            'footer.quick_links.max' => 'Footer can have maximum 20 quick links.',
            '*.title.required_with' => 'Title is required when section is provided.',
        ];
    }

    /**
     * Prepare data for validation by ensuring arrays are properly typed.
     */
    protected function prepareForValidation(): void
    {
        $input = $this->all();

        // Ensure nested arrays are properly formatted
        foreach (['hero', 'why_choose_us', 'testimonials', 'cta', 'header', 'footer', 'floating_menu'] as $section) {
            if (isset($input[$section]) && !is_array($input[$section])) {
                $input[$section] = [];
            }
        }

        // Ensure nested item arrays are properly formatted
        $arrayFields = [
            'hero.buttons',
            'why_choose_us.points',
            'testimonials.logos', 
            'cta.cards',
            'header.menu_items',
            'footer.quick_links',
            'footer.buttons',
            'footer.legal_links',
            'floating_menu.items'
        ];

        foreach ($arrayFields as $field) {
            $keys = explode('.', $field);
            $value = $input;
            foreach ($keys as $key) {
                $value = $value[$key] ?? null;
                if ($value === null) break;
            }
            
            if ($value !== null && !is_array($value)) {
                // Set nested array field to empty array if not array type
                $this->setNestedValue($input, $keys, []);
            }
        }

        $this->replace($input);
    }

    private function setNestedValue(array &$array, array $keys, $value): void
    {
        $current = &$array;
        foreach ($keys as $i => $key) {
            if ($i === count($keys) - 1) {
                $current[$key] = $value;
            } else {
                if (!isset($current[$key]) || !is_array($current[$key])) {
                    $current[$key] = [];
                }
                $current = &$current[$key];
            }
        }
    }
}