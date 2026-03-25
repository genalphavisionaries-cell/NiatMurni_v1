<?php

namespace App\Filament\Pages;

/**
 * Duplicate of `CmsHomepageEditor`, but with a new route slug and a non-CMS
 * navigation group to avoid confusion in the admin panel.
 */
class HomepageEditor extends CmsHomepageEditor
{
    protected static ?string $slug = 'homepage-editor';

    protected static ?string $navigationGroup = 'Homepage';
}

