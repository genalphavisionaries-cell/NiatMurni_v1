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
        // Base rules - always applied regardless of publish status
        $baseRules = [
            // Hero section
            'hero' => 'sometimes|array',
            'hero.title' => 'nullable|string|max:255',
            'hero.subtitle' => 'nullable|string|max:500',
            'hero.enabled' => 'sometimes|boolean',
            'hero.buttons' => 'nullable|array|max:2',
            'hero.buttons.*.label' => 'nullable|string|max:100',
            'hero.buttons.*.url' => 'nullable|string|max:2048',
            'hero.background_urls' => 'nullable|string|max:5000',

            // Why Choose Us section  
            'why_choose_us' => 'sometimes|array',
            'why_choose_us.title' => 'nullable|string|max:255',
            'why_choose_us.description' => 'nullable|string|max:1000',
            'why_choose_us.enabled' => 'sometimes|boolean',
            'why_choose_us.points' => 'nullable|array|max:6',
            'why_choose_us.points.*.title' => 'nullable|string|max:200',
            'why_choose_us.points.*.description' => 'nullable|string|max:500',
            'why_choose_us.side_images_urls' => 'nullable|string|max:3000',

            // Testimonials section
            'testimonials' => 'sometimes|array',
            'testimonials.enabled' => 'sometimes|boolean',
            'testimonials.google_rating_text' => 'nullable|string|max:500',
            'testimonials.google_button_label' => 'nullable|string|max:100',
            'testimonials.google_button_url' => 'nullable|string|max:2048',
            'testimonials.logos' => 'nullable|array|max:20',
            'testimonials.logos.*.title' => 'nullable|string|max:100',
            'testimonials.logos.*.image_url' => 'nullable|string|max:2048',

            // CTA/Promotions section
            'cta' => 'sometimes|array',
            'cta.title' => 'nullable|string|max:255',
            'cta.description' => 'nullable|string|max:1000',
            'cta.enabled' => 'sometimes|boolean',
            'cta.banner_urls' => 'nullable|string|max:3000',
            'cta.cards' => 'nullable|array|max:10',
            'cta.cards.*.title' => 'nullable|string|max:200',
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
            'usp.enabled' => 'sometimes|boolean',
            'trust' => 'sometimes|array', 
            'trust.enabled' => 'sometimes|boolean',
            'promo' => 'sometimes|array',
            'promo.enabled' => 'sometimes|boolean',
        ];

        return $baseRules;
    }

    public function messages(): array
    {
        return [
            // Section limits with helpful guidance
            'hero.buttons.max' => 'Hero section: Maximum 2 buttons recommended. Use primary action + secondary option for best conversion.',
            'why_choose_us.points.max' => 'Why Choose Us: Maximum 6 benefit points for optimal user experience. Focus on your strongest selling points.',
            'testimonials.logos.max' => 'Brand Logos: Maximum 20 logos to maintain visual clarity and loading performance.',
            'cta.cards.max' => 'Promotional Cards: Maximum 10 cards recommended. Consider grouping similar offers or seasonal campaigns.',
            'header.menu_items.max' => 'Header Navigation: Maximum 20 items. Consider dropdown menus or footer links for additional pages.',
            'footer.quick_links.max' => 'Footer Links: Maximum 20 quick links to avoid overwhelming users.',
            'footer.buttons.max' => 'Footer Buttons: Maximum 10 login/action buttons for clean layout.',
            'footer.legal_links.max' => 'Legal Links: Maximum 10 legal pages (privacy, terms, etc.).',
            
            // Human-readable field requirements
            'hero.title' => 'Hero Section: Main headline is required before publishing to attract visitors.',
            'hero.subtitle' => 'Hero Section: Description helps explain your service to visitors.',
            'why_choose_us.title' => 'Why Choose Us: Section title is required before publishing.',
            'why_choose_us.points' => 'Why Choose Us: At least 1 benefit point is required to showcase your value.',
            'cta.title' => 'Promotions: Section title is required before publishing.',
            'cta.cards' => 'Promotions: At least 1 promotional offer is required to drive conversions.',
            'testimonials.title' => 'Testimonials: Section title is required before publishing.',
            
            // Content quality hints
            '*.title.max' => 'Title: Keep it concise (:max characters max) for better readability and SEO.',
            '*.description.max' => 'Description: Focus your message (:max characters max) for better user engagement.',
            '*.label.max' => 'Label: Short and clear (:max characters max) works best for navigation.',
            
            // Content requirements
            '*.points.*.title' => 'Benefit Point: Title is required to explain this advantage.',
            '*.cards.*.title' => 'Promotional Card: Title is required to describe this offer.',
            '*.logos.*.title' => 'Brand Logo: Company name is required for accessibility.',
            '*.menu_items.*.label' => 'Menu Item: Label is required for navigation.',
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

    /**
     * Custom validation to prevent deletion of critical sections.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $this->validateCriticalSections($validator);
        });
    }

    private function validateCriticalSections($validator): void
    {
        // Only enforce strict validation if sections are being published (enabled: true)
        
        if ($this->has('hero') && $this->isBeingPublished('hero')) {
            $this->validateSectionForPublish('hero', $validator, [
                'title' => 'Hero title is required before publishing',
                'subtitle' => 'Hero subtitle or description is recommended for better engagement'
            ]);
        }

        if ($this->has('why_choose_us') || $this->has('usp')) {
            $key = $this->has('why_choose_us') ? 'why_choose_us' : 'usp';
            if ($this->isBeingPublished($key)) {
                $this->validateSectionForPublish($key, $validator, [
                    'title' => 'Why Choose Us title is required before publishing',
                    'points' => 'At least 1 benefit point is required before publishing'
                ]);
            }
        }

        if ($this->has('cta') || $this->has('promo')) {
            $key = $this->has('cta') ? 'cta' : 'promo';
            if ($this->isBeingPublished($key)) {
                $this->validateSectionForPublish($key, $validator, [
                    'title' => 'Promotions title is required before publishing',
                    'cards' => 'At least 1 promotional card is required before publishing'
                ]);
            }
        }
    }

    private function isBeingPublished(string $sectionKey): bool
    {
        $section = $this->input($sectionKey, []);
        
        if (!is_array($section)) {
            return false; // Can't publish non-array data
        }

        // Section is being published if explicitly enabled
        return isset($section['enabled']) && $section['enabled'] === true;
    }

    private function validateSectionForPublish(string $sectionKey, $validator, array $requirements): void
    {
        $section = $this->input($sectionKey, []);
        
        if (!is_array($section)) {
            return;
        }

        // Check title requirement
        if (isset($requirements['title']) && empty(trim($section['title'] ?? ''))) {
            $validator->errors()->add("$sectionKey.title", $requirements['title']);
        }

        // Check section-specific requirements
        if ($sectionKey === 'why_choose_us' || $sectionKey === 'usp') {
            if (isset($requirements['points'])) {
                $points = is_array($section['points'] ?? null) ? $section['points'] : [];
                $validPoints = array_filter($points, fn($p) => !empty(trim($p['title'] ?? '')));
                if (count($validPoints) === 0) {
                    $validator->errors()->add("$sectionKey.points", $requirements['points']);
                }
            }
        }

        if ($sectionKey === 'cta' || $sectionKey === 'promo') {
            if (isset($requirements['cards'])) {
                $cards = is_array($section['cards'] ?? null) ? $section['cards'] : [];
                $validCards = array_filter($cards, fn($c) => !empty(trim($c['title'] ?? '')));
                if (count($validCards) === 0) {
                    $validator->errors()->add("$sectionKey.cards", $requirements['cards']);
                }
            }
        }
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