<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Validation\ValidationException;

class SiteNavigationItem extends Model
{
    public const LOCATION_HEADER = 'header';

    public const LOCATION_FOOTER = 'footer';

    /** Flat list: legal / policy links in footer strip */
    public const LOCATION_FOOTER_LEGAL = 'footer_legal';

    /** Flat list: participant / corporate / tutor login links */
    public const LOCATION_FOOTER_LOGIN = 'footer_login';

    /** @return list<string> */
    public static function locations(): array
    {
        return [
            self::LOCATION_HEADER,
            self::LOCATION_FOOTER,
            self::LOCATION_FOOTER_LEGAL,
            self::LOCATION_FOOTER_LOGIN,
        ];
    }

    protected $fillable = [
        'label',
        'url',
        'location',
        'parent_id',
        'sort_order',
        'is_active',
        'open_in_new_tab',
        'is_button',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'open_in_new_tab' => 'boolean',
            'is_button' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('sort_order');
    }

    protected static function booted(): void
    {
        static::saving(function (SiteNavigationItem $item): void {
            if (! in_array($item->location, self::locations(), true)) {
                throw ValidationException::withMessages([
                    'location' => ['Invalid menu area.'],
                ]);
            }
            if (in_array($item->location, [self::LOCATION_FOOTER_LEGAL, self::LOCATION_FOOTER_LOGIN], true)) {
                $item->parent_id = null;
            }
            if ($item->parent_id) {
                if ((int) $item->parent_id === (int) $item->id) {
                    throw ValidationException::withMessages([
                        'parent_id' => ['A menu item cannot be its own parent.'],
                    ]);
                }
                $parent = self::query()->find($item->parent_id);
                if (! $parent) {
                    throw ValidationException::withMessages([
                        'parent_id' => ['Parent menu item not found.'],
                    ]);
                }
                if ($parent->location !== $item->location) {
                    throw ValidationException::withMessages([
                        'parent_id' => ['Parent must be in the same area (header or footer).'],
                    ]);
                }
                if ($parent->parent_id !== null) {
                    throw ValidationException::withMessages([
                        'parent_id' => ['Only one level of submenu is supported. Choose a top-level item as parent.'],
                    ]);
                }
            }
        });
    }
}
