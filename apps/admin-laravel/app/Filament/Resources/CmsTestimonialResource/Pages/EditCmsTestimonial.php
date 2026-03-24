<?php

namespace App\Filament\Resources\CmsTestimonialResource\Pages;

use App\Filament\Resources\CmsTestimonialResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditCmsTestimonial extends EditRecord
{
    protected static string $resource = CmsTestimonialResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
