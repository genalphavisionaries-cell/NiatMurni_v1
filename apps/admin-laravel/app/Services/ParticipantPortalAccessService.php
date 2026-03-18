<?php

namespace App\Services;

use App\Models\Participant;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Creates or links participant portal access (User with role=participant linked via Participant.user_id).
 * Used by Filament actions; keeps password handling simple (temporary random, admin copies/shares).
 */
class ParticipantPortalAccessService
{
    /**
     * Ensure this participant has portal access: create a new User (role=participant) and link, or link to existing participant user.
     *
     * @return array{success: bool, message: string, temporary_password?: string}
     */
    public function createOrLinkAccess(Participant $participant): array
    {
        $participant->refresh();

        if ($participant->user_id) {
            $user = $participant->user;
            return [
                'success' => true,
                'message' => 'Participant is already linked to a portal account: ' . ($user?->email ?? 'User #' . $participant->user_id),
            ];
        }

        $email = $participant->email ? trim($participant->email) : null;
        if (empty($email)) {
            return [
                'success' => false,
                'message' => 'Participant must have an email address to create portal access. Please set the participant\'s email and try again.',
            ];
        }

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return [
                'success' => false,
                'message' => 'Participant email is not a valid email address.',
            ];
        }

        $existingUser = User::where('email', $email)->first();
        if ($existingUser) {
            if ($existingUser->role === 'participant') {
                $participant->update(['user_id' => $existingUser->id]);
                return [
                    'success' => true,
                    'message' => 'Linked to existing participant account (' . $existingUser->email . ').',
                ];
            }
            return [
                'success' => false,
                'message' => 'A user with this email already exists with a different role (e.g. admin/tutor). Use a different email for the participant or contact support.',
            ];
        }

        $temporaryPassword = Str::random(12);
        $user = User::create([
            'name' => $participant->full_name,
            'email' => $email,
            'password' => Hash::make($temporaryPassword),
            'role' => 'participant',
        ]);

        $participant->update(['user_id' => $user->id]);

        return [
            'success' => true,
            'message' => 'Portal access created. Share the temporary password with the participant; they should change it after first login.',
            'temporary_password' => $temporaryPassword,
        ];
    }

    /**
     * Reset the linked user's password to a new random one. Caller must display it to admin once.
     *
     * @return array{success: bool, message: string, temporary_password?: string}
     */
    public function resetPassword(Participant $participant): array
    {
        $participant->refresh();

        if (! $participant->user_id) {
            return [
                'success' => false,
                'message' => 'Participant has no linked portal account. Create portal access first.',
            ];
        }

        $user = $participant->user;
        if (! $user) {
            return [
                'success' => false,
                'message' => 'Linked user not found. Please unlink and create access again.',
            ];
        }

        $temporaryPassword = Str::random(12);
        $user->update(['password' => Hash::make($temporaryPassword)]);

        return [
            'success' => true,
            'message' => 'Password reset. Share the new temporary password with the participant.',
            'temporary_password' => $temporaryPassword,
        ];
    }
}
