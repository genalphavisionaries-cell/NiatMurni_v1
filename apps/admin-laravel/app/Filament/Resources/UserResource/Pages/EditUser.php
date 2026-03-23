<?php

namespace App\Filament\Resources\UserResource\Pages;

use App\Filament\Resources\UserResource;
use App\Models\User;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;

class EditUser extends EditRecord
{
    protected static string $resource = UserResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make()
                ->visible(fn () => auth()->user()?->isSuperAdmin()
                    && auth()->id() !== $this->record->id),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        /** @var User $actor */
        $actor = auth()->user();

        // Non-super-admins can only update their own name, email, phone and password.
        if (!$actor->isSuperAdmin()) {
            return array_intersect_key($data, array_flip([
                'name', 'email', 'recovery_email', 'phone', 'password',
            ]));
        }

        // Safety: prevent the only active super admin from being demoted / deactivated.
        /** @var User $record */
        $record = $this->record;

        if ($record->admin_role === 'super_admin') {
            $wasActive   = $record->is_active;
            $nowActive   = $data['is_active'] ?? true;
            $nowRole     = $data['admin_role'] ?? $record->admin_role;

            $losingSuper = ($wasActive && !$nowActive) || ($nowRole !== 'super_admin');

            if ($losingSuper) {
                $activeSuperCount = User::where('admin_role', 'super_admin')
                    ->where('is_active', true)
                    ->where('id', '!=', $record->id)
                    ->count();

                if ($activeSuperCount === 0) {
                    Notification::make()
                        ->title('Cannot remove the only active Super Admin.')
                        ->body('Assign Super Admin to another user first.')
                        ->danger()
                        ->send();

                    // Restore the protected fields.
                    $data['admin_role'] = 'super_admin';
                    $data['is_active']  = true;
                }
            }
        }

        return $data;
    }
}
