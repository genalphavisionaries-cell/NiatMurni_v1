<?php

namespace App\Filament\Resources\UserResource\Pages;

use App\Filament\Resources\UserResource;
use App\Models\User;
use App\Support\AdminModules;
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
                ->before(function (Actions\DeleteAction $action): void {
                    /** @var User $record */
                    $record = $this->record;
                    if ($record->admin_role !== 'super_admin') {
                        return;
                    }

                    $otherActiveSuperAdmins = User::query()
                        ->where('admin_role', 'super_admin')
                        ->where('is_active', true)
                        ->where('id', '!=', $record->id)
                        ->count();

                    if ($otherActiveSuperAdmins === 0) {
                        Notification::make()
                            ->title('Cannot delete the last active Super Admin.')
                            ->body('Assign another active Super Admin first.')
                            ->danger()
                            ->send();

                        $action->halt();
                    }
                })
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

        if ($actor->id === $record->id) {
            $nextActive = (bool) ($data['is_active'] ?? $record->is_active);
            $nextRole = (string) ($data['role'] ?? $record->role);
            $nextAdminRole = (string) ($data['admin_role'] ?? $record->admin_role);
            $nextModules = $data['module_access'] ?? $record->module_access;

            // Self-protection: cannot deactivate own account.
            if (! $nextActive) {
                Notification::make()
                    ->title('You cannot deactivate your own account.')
                    ->danger()
                    ->send();
                $data['is_active'] = true;
            }

            // Self-protection: cannot remove your own users-module access.
            $wouldKeepUsersAccess = $nextAdminRole === 'super_admin'
                || ($nextRole === 'admin' && ($nextAdminRole === null || $nextAdminRole === ''))
                || (is_array($nextModules) && in_array(AdminModules::USERS, $nextModules, true));
            if (! $wouldKeepUsersAccess) {
                Notification::make()
                    ->title('You cannot remove your own access to User Management.')
                    ->body('Another Super Admin must update your access.')
                    ->danger()
                    ->send();
                $data['role'] = $record->role;
                $data['admin_role'] = $record->admin_role;
                $data['module_access'] = $record->module_access;
            }
        }

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
