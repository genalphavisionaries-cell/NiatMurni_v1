<?php

namespace App\Filament\Resources\VerificationRecordResource\Pages;

use App\Filament\Resources\VerificationRecordResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditVerificationRecord extends EditRecord
{
    protected static string $resource = VerificationRecordResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\ViewAction::make()];
    }
}
