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
            if (! is_array($point)) {
                continue;
            }

            $title = is_string($point['title'] ?? null) ? trim($point['title']) : '';
            $description = is_string($point['description'] ?? null) ? trim($point['description']) : '';
            $icon = is_string($point['icon'] ?? null) ? trim($point['icon']) : '';
            $backgroundColor = is_string($point['background_color'] ?? null) ? trim($point['background_color']) : '';
            $iconAlt = is_string($point['icon_alt'] ?? null) ? trim($point['icon_alt']) : '';

            $hasAny = $title !== '' || $description !== '' || $icon !== '' || $backgroundColor !== '' || $iconAlt !== '';
            if (! $hasAny) {
                continue;
            }

            $validated[] = [
                'title' => $title,
                'description' => $description !== '' ? $description : null,
                'icon_url' => $this->validateUrl($icon !== '' ? $icon : null),
                'background_color' => $backgroundColor,
                'icon_alt' => $iconAlt,
            ];

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
            $description = is_string($card['description'] ?? null) ? trim($card['description']) : '';
            $imageRaw = $card['image_url'] ?? null;
            $imageStr = is_string($imageRaw) ? trim($imageRaw) : '';
            $urlRaw = $card['url'] ?? null;
            $urlStr = is_string($urlRaw) ? trim($urlRaw) : '';
            $btnRaw = $card['button_label'] ?? null;
            $btnStr = is_string($btnRaw) ? trim($btnRaw) : '';
            $cardColor = is_string($card['card_color'] ?? null) ? trim((string) $card['card_color']) : '';
            $imageAlt = is_string($card['image_alt'] ?? null) ? trim((string) $card['image_alt']) : '';

            $hasAny = $title !== '' || $description !== '' || $imageStr !== '' || $urlStr !== '' || $btnStr !== '' || $cardColor !== '' || $imageAlt !== '';
            if (! $hasAny) {
                continue;
            }

            $validated[] = [
                'title' => $title,
                'description' => $description !== '' ? $description : '',
                'image_url' => $this->validateUrl($imageStr !== '' ? $imageStr : null),
                'url' => $this->validateUrl($urlStr !== '' ? $urlStr : null),
                'button_label' => $btnStr,
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
            $imageRaw = $logo['image_url'] ?? null;
            $imageStr = is_string($imageRaw) ? trim($imageRaw) : '';
            if ($title === '' && $imageStr === '') {
                continue;
            }

            $validated[] = [
                'title' => $title,
                'image_url' => $this->validateUrl($imageStr !== '' ? $imageStr : null),
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
        if (str_starts_with($url, '/')
            || str_starts_with($url, './')
            || str_starts_with($url, 'http://')
            || str_starts_with($url, 'https://')) {
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

}