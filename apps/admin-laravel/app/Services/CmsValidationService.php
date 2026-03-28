<?php

namespace App\Services;

use App\Models\CmsSection;
use App\Models\CmsItem;

/**
 * CMS data validation and integrity service.
 */
class CmsValidationService
{
    /**
     * Validate JSON field structure before save.
     */
    public function validateJsonField(string $jsonString, string $expectedType = 'object'): bool
    {
        if (empty($jsonString)) {
            return true; // Empty is valid
        }

        $decoded = json_decode($jsonString, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return false; // Invalid JSON
        }

        if ($expectedType === 'array' && !is_array($decoded)) {
            return false;
        }

        if ($expectedType === 'object' && !is_array($decoded)) {
            return false;
        }

        return true;
    }

    /**
     * Sanitize and validate CmsSection content_json before save.
     */
    public function validateSectionContent(array $content): array
    {
        // Remove any null values that could cause JSON issues
        return $this->removeNullValues($content);
    }

    /**
     * Validate USP/Why Choose Us items structure.
     */
    public function validateUspItems(array $points): array
    {
        $validated = [];
        
        foreach ($points as $point) {
            if (!is_array($point)) {
                continue; // Skip non-array items
            }
            
            $title = is_string($point['title'] ?? null) ? trim($point['title']) : '';
            if (empty($title)) {
                continue; // Skip items without title
            }

            $validated[] = [
                'title' => $title,
                'description' => is_string($point['description'] ?? null) ? trim($point['description']) : '',
                'background_color' => is_string($point['background_color'] ?? null) ? trim($point['background_color']) : '',
                'icon_alt' => is_string($point['icon_alt'] ?? null) ? trim($point['icon_alt']) : '',
            ];

            // Limit to 6 items maximum
            if (count($validated) >= 6) {
                break;
            }
        }

        return $validated;
    }

    /**
     * Validate promo cards structure.
     */
    public function validatePromoCards(array $cards): array
    {
        $validated = [];

        foreach ($cards as $card) {
            if (!is_array($card)) {
                continue; // Skip non-array items
            }

            $title = is_string($card['title'] ?? null) ? trim($card['title']) : '';
            if (empty($title)) {
                continue; // Skip items without title
            }

            $validated[] = [
                'title' => $title,
                'description' => is_string($card['description'] ?? null) ? trim($card['description']) : '',
                'image_url' => $this->validateUrl($card['image_url'] ?? null),
                'url' => $this->validateUrl($card['url'] ?? null),
                'button_label' => is_string($card['button_label'] ?? null) ? trim($card['button_label']) : '',
                'card_color' => is_string($card['card_color'] ?? null) ? trim($card['card_color']) : '',
                'image_alt' => is_string($card['image_alt'] ?? null) ? trim($card['image_alt']) : '',
            ];

            // Limit to 10 cards maximum
            if (count($validated) >= 10) {
                break;
            }
        }

        return $validated;
    }

    /**
     * Validate brand logos structure.
     */
    public function validateBrandLogos(array $logos): array
    {
        $validated = [];

        foreach ($logos as $logo) {
            if (!is_array($logo)) {
                continue; // Skip non-array items
            }

            $title = is_string($logo['title'] ?? null) ? trim($logo['title']) : '';
            if (empty($title)) {
                continue; // Skip items without title
            }

            $validated[] = [
                'title' => $title,
                'image_url' => $this->validateUrl($logo['image_url'] ?? null),
            ];

            // Limit to 20 logos maximum
            if (count($validated) >= 20) {
                break;
            }
        }

        return $validated;
    }

    /**
     * Validate menu items structure.
     */
    public function validateMenuItems(array $menuItems): array
    {
        $validated = [];

        foreach ($menuItems as $item) {
            if (!is_array($item)) {
                continue; // Skip non-array items
            }

            $label = is_string($item['label'] ?? null) ? trim($item['label']) : '';
            if (empty($label)) {
                continue; // Skip items without label
            }

            $validated[] = [
                'label' => $label,
                'url' => $this->validateUrl($item['url'] ?? null),
                'type' => in_array($item['type'] ?? '', ['page', 'external']) ? $item['type'] : 'page',
                'has_children' => (bool) ($item['has_children'] ?? false),
            ];

            // Limit to 20 menu items maximum
            if (count($validated) >= 20) {
                break;
            }
        }

        return $validated;
    }

    /**
     * Basic URL validation and sanitization.
     */
    private function validateUrl($url): ?string
    {
        $url = is_string($url) ? trim($url) : '';
        
        if (empty($url)) {
            return null;
        }

        // Allow relative URLs and absolute URLs
        if (str_starts_with($url, '/') || str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            return substr($url, 0, 2048); // Truncate to DB field limit
        }

        return null; // Invalid URL format
    }

    /**
     * Remove null values recursively from array to prevent JSON encoding issues.
     */
    private function removeNullValues(array $array): array
    {
        $filtered = [];
        
        foreach ($array as $key => $value) {
            if ($value === null) {
                continue;
            }
            
            if (is_array($value)) {
                $filtered[$key] = $this->removeNullValues($value);
            } else {
                $filtered[$key] = $value;
            }
        }

        return $filtered;
    }

    /**
     * Check if a CmsSection has valid data structure.
     */
    public function validateSection(CmsSection $section): bool
    {
        if (!$section->content_json) {
            return true; // Empty is valid
        }

        return $this->validateJsonField(json_encode($section->content_json));
    }

    /**
     * Check if a CmsItem has valid data structure.
     */
    public function validateItem(CmsItem $item): bool
    {
        if (!$item->extra_json) {
            return true; // Empty is valid
        }

        return $this->validateJsonField(json_encode($item->extra_json));
    }

    /**
     * Validate that critical sections exist and have content.
     * 
     * @param Collection<CmsSection> $sections
     * @throws \Illuminate\Validation\ValidationException
     */
    public function validateCriticalSections($sections): void
    {
        $sectionsByKey = $sections->keyBy('section_key');
        $errors = [];

        // Check critical sections exist and are active
        $criticalSections = ['hero', 'why_choose_us', 'cta'];
        
        foreach ($criticalSections as $key) {
            $section = $sectionsByKey->get($key);
            
            if (!$section || !$section->is_active) {
                $errors[] = "The {$key} section is critical and cannot be disabled or removed.";
                continue;
            }

            // Validate section has meaningful content
            $content = $section->content_json ?? [];
            $title = is_string($content['title'] ?? $section->title ?? null) 
                ? trim($content['title'] ?? $section->title) 
                : '';
            
            if (empty($title)) {
                $errors[] = "The {$key} section must have a title.";
            }

            // Section-specific content validation
            if ($key === 'why_choose_us') {
                $items = $section->items()->where('type', 'usp')->where('is_active', true)->count();
                if ($items === 0) {
                    $errors[] = "The Why Choose Us section must have at least 1 benefit point.";
                }
            }

            if ($key === 'cta') {
                $items = $section->items()->where('type', 'promo_card')->where('is_active', true)->count();
                if ($items === 0) {
                    $errors[] = "The CTA section must have at least 1 promotional card.";
                }
            }
        }

        if (!empty($errors)) {
            throw new \Illuminate\Validation\ValidationException(
                validator([], []),
                response()->json(['errors' => ['critical_sections' => $errors]], 422)
            );
        }
    }
}