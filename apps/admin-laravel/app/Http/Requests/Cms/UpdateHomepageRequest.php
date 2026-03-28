<?php

namespace App\Http\Requests\Cms;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateHomepageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'hero' => 'sometimes|array',
            'hero.title' => 'nullable|string|max:255',
            'hero.subtitle' => 'nullable|string|max:500',
            'hero.headline' => 'nullable|string|max:20000',
            'hero.subheadline' => 'nullable|string|max:20000',
            'hero.enabled' => 'sometimes|boolean',
            'hero.buttons' => 'nullable|array|max:2',
            'hero.buttons.*.label' => 'nullable|string|max:100',
            'hero.buttons.*.url' => 'nullable|string|max:2048',
            'hero.background_urls' => 'nullable|string|max:5000',
            'hero.accent_color' => 'nullable|string|max:64',
            'hero.button_color' => 'nullable|string|max:64',

            'why_choose_us' => 'sometimes|array',
            'why_choose_us.title' => 'nullable|string|max:255',
            'why_choose_us.description' => 'nullable|string|max:1000',
            'why_choose_us.enabled' => 'sometimes|boolean',
            'why_choose_us.points' => 'nullable|array|max:6',
            'why_choose_us.points.*.title' => 'nullable|string|max:255',
            'why_choose_us.points.*.description' => 'nullable|string',
            'why_choose_us.points.*.icon' => 'nullable|string|max:2048',
            'why_choose_us.side_images_urls' => 'nullable|string|max:3000',
            'why_choose_us.accent_color' => 'nullable|string|max:64',
            'why_choose_us.button_color' => 'nullable|string|max:64',

            'classes' => 'sometimes|array',
            'classes.title' => 'nullable|string|max:255',
            'classes.description' => 'nullable|string|max:5000',
            'classes.button_text' => 'nullable|string|max:100',
            'classes.button_url' => 'nullable|string|max:2048',
            'classes.max_items' => 'nullable|integer|min:1|max:100',
            'classes.accent_color' => 'nullable|string|max:64',
            'classes.button_color' => 'nullable|string|max:64',
            'classes.enabled' => 'sometimes|boolean',

            'testimonials' => 'sometimes|array',
            'testimonials.enabled' => 'sometimes|boolean',
            'testimonials.accent_color' => 'nullable|string|max:64',
            'testimonials.button_color' => 'nullable|string|max:64',
            'testimonials.google_rating_text' => 'nullable|string|max:500',
            'testimonials.google_button_label' => 'nullable|string|max:100',
            'testimonials.google_button_url' => 'nullable|string|max:2048',
            'testimonials.logos' => 'nullable|array|max:20',
            'testimonials.logos.*.title' => 'nullable|string|max:100',
            'testimonials.logos.*.image_url' => 'nullable|string|max:2048',

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
            'cta.accent_color' => 'nullable|string|max:64',
            'cta.button_color' => 'nullable|string|max:64',

            'header' => 'sometimes|array',
            'header.logo_url' => 'nullable|string|max:2048',
            'header.menu_items' => 'nullable|array|max:20',
            'header.menu_items.*.label' => 'nullable|string|max:100',
            'header.menu_items.*.url' => 'nullable|string|max:2048',

            'footer' => 'sometimes|array',
            'footer.quick_links' => 'nullable|array|max:20',
            'footer.quick_links.*.label' => 'nullable|string|max:100',
            'footer.quick_links.*.url' => 'nullable|string|max:2048',
            'footer.buttons' => 'nullable|array|max:10',
            'footer.buttons.*.label' => 'nullable|string|max:100',
            'footer.buttons.*.url' => 'nullable|string|max:2048',
            'footer.legal_links' => 'nullable|array|max:10',
            'footer.legal_links.*.label' => 'nullable|string|max:100',
            'footer.legal_links.*.url' => 'nullable|string|max:2048',

            'floating_menu' => 'sometimes|array',
            'floating_menu.items' => 'nullable|array|max:10',
            'floating_menu.items.*.label' => 'nullable|string|max:100',
            'floating_menu.items.*.url' => 'nullable|string|max:2048',

            'usp' => 'sometimes|array',
            'usp.enabled' => 'sometimes|boolean',
            'usp.title' => 'nullable|string|max:255',
            'usp.description' => 'nullable|string|max:1000',
            'usp.side_images_urls' => 'nullable|string|max:3000',
            'usp.points' => 'nullable|array|max:6',
            'usp.points.*.title' => 'nullable|string|max:255',
            'usp.points.*.description' => 'nullable|string',
            'usp.points.*.icon' => 'nullable|string|max:2048',
            'usp.accent_color' => 'nullable|string|max:64',
            'usp.button_color' => 'nullable|string|max:64',

            'trust' => 'sometimes|array',
            'trust.enabled' => 'sometimes|boolean',
            'trust.google_rating_text' => 'nullable|string|max:500',
            'trust.google_button_label' => 'nullable|string|max:100',
            'trust.google_button_url' => 'nullable|string|max:2048',
            'trust.logos' => 'nullable|array|max:20',
            'trust.logos.*.title' => 'nullable|string|max:100',
            'trust.logos.*.image_url' => 'nullable|string|max:2048',
            'trust.accent_color' => 'nullable|string|max:64',
            'trust.button_color' => 'nullable|string|max:64',

            'promo' => 'sometimes|array',
            'promo.enabled' => 'sometimes|boolean',
            'promo.title' => 'nullable|string|max:255',
            'promo.description' => 'nullable|string|max:1000',
            'promo.cards' => 'nullable|array|max:10',
            'promo.cards.*.title' => 'nullable|string|max:200',
            'promo.cards.*.description' => 'nullable|string|max:500',
            'promo.cards.*.image_url' => 'nullable|string|max:2048',
            'promo.cards.*.url' => 'nullable|string|max:2048',
            'promo.cards.*.button_label' => 'nullable|string|max:100',
            'promo.banner_urls' => 'nullable|string|max:3000',
            'promo.accent_color' => 'nullable|string|max:64',
            'promo.button_color' => 'nullable|string|max:64',
        ];
    }

    public function messages(): array
    {
        return [
            'hero.buttons.max' => 'Hero section: Maximum 2 buttons recommended.',
            'why_choose_us.points.max' => 'Why Choose Us: Maximum 6 benefit points.',
            'usp.points.max' => 'Why Choose Us: Maximum 6 benefit points.',
            'testimonials.logos.max' => 'Brand Logos: Maximum 20 logos.',
            'trust.logos.max' => 'Brand Logos: Maximum 20 logos.',
            'cta.cards.max' => 'Promotional Cards: Maximum 10 cards.',
            'promo.cards.max' => 'Promotional Cards: Maximum 10 cards.',
            'header.menu_items.max' => 'Header Navigation: Maximum 20 items.',
            'footer.quick_links.max' => 'Footer Links: Maximum 20 quick links.',
            'footer.buttons.max' => 'Footer Buttons: Maximum 10.',
            'footer.legal_links.max' => 'Legal Links: Maximum 10.',
            '*.title.max' => 'Title: Keep it concise (:max characters max).',
            '*.description.max' => 'Description: Maximum :max characters.',
            '*.label.max' => 'Label: Maximum :max characters.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json($this->buildValidationPayload($validator), 422)
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function buildValidationPayload(Validator $validator): array
    {
        $errors = [];
        $errorsBySection = [];

        foreach ($validator->errors()->messages() as $field => $messages) {
            $parts = explode('.', $field);
            $section = $parts[0];
            $fieldName = implode('.', array_slice($parts, 1)) ?: 'general';

            foreach ($messages as $message) {
                $error = [
                    'section' => $section,
                    'field' => $fieldName,
                    'message' => $message,
                    'severity' => str_contains($message, 'required before publishing') ? 'error' : 'warning',
                ];
                $errors[] = $error;
                $errorsBySection[$section][] = $error;
            }
        }

        return [
            'message' => 'Validation failed. Please check the issues below.',
            'validation_errors' => $errors,
            'errors_by_section' => $errorsBySection,
            'errors' => $validator->errors()->toArray(),
            'can_save_draft' => true,
            'can_publish' => count(array_filter($errors, fn ($row) => $row['severity'] === 'error')) === 0,
        ];
    }

    protected function prepareForValidation(): void
    {
        $input = $this->all();

        foreach ([
            'hero', 'why_choose_us', 'usp', 'classes', 'testimonials', 'trust', 'cta', 'promo', 'header', 'footer', 'floating_menu',
        ] as $section) {
            if (isset($input[$section]) && ! is_array($input[$section])) {
                $input[$section] = [];
            }
        }

        $arrayFields = [
            'hero.buttons',
            'why_choose_us.points',
            'usp.points',
            'testimonials.logos',
            'trust.logos',
            'cta.cards',
            'promo.cards',
            'header.menu_items',
            'footer.quick_links',
            'footer.buttons',
            'footer.legal_links',
            'floating_menu.items',
        ];

        foreach ($arrayFields as $field) {
            $keys = explode('.', $field);
            $value = $input;
            foreach ($keys as $key) {
                $value = $value[$key] ?? null;
                if ($value === null) {
                    break;
                }
            }

            if ($value !== null && ! is_array($value)) {
                $this->setNestedValue($input, $keys, []);
            }
        }

        $this->replace($input);
    }

    private function setNestedValue(array &$array, array $keys, mixed $value): void
    {
        $current = &$array;
        foreach ($keys as $i => $key) {
            if ($i === count($keys) - 1) {
                $current[$key] = $value;
            } else {
                if (! isset($current[$key]) || ! is_array($current[$key])) {
                    $current[$key] = [];
                }
                $current = &$current[$key];
            }
        }
    }
}
