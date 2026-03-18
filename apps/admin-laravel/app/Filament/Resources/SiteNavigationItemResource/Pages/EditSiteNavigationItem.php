<?php

namespace App\Filament\Resources\SiteNavigationItemResource\Pages;

use App\Filament\Resources\SiteNavigationItemResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditSiteNavigationItem extends EditRecord
{
    protected static string $resource = SiteNavigationItemResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
