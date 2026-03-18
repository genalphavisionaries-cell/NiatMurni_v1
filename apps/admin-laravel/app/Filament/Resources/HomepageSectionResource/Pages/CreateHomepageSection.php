<?php

namespace App\Filament\Resources\HomepageSectionResource\Pages;

use App\Filament\Resources\HomepageSectionResource;
use App\Models\HomepageSection;
use Filament\Resources\Pages\CreateRecord;

class CreateHomepageSection extends CreateRecord
{
    protected static string $resource = HomepageSectionResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['extra_data'] = HomepageSection::normalizeExtraData($data['extra_data'] ?? null);

        return $data;
    }
}
