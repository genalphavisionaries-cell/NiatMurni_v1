<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ParticipantAuthService
{
    public const VERIFICATION_EXPIRES_MINUTES = 15;

    public function requestFirstTimeLogin(?string $email, ?string $phone): void
    {
        $user = $this->findParticipantUser($email, $phone);

        if (! $user) {
            // Enumeration-safe behavior: return success without revealing account existence.
            return;
        }

        $plainToken = Str::upper(Str::random(6));
        $hashedToken = hash('sha256', $plainToken);

        DB::table('user_verifications')
            ->where('user_id', $user->id)
            ->delete();

        DB::table('user_verifications')->insert([
            'user_id' => $user->id,
            'token' => $hashedToken,
            'expires_at' => now()->addMinutes(self::VERIFICATION_EXPIRES_MINUTES),
            'created_at' => now(),
        ]);

        // Simulated delivery (email/SMS integration can replace this later).
        logger()->info('participant.first_time_login_token_generated', [
            'user_id' => $user->id,
            'email' => $user->email,
            'phone' => $user->phone,
            'token' => $plainToken,
            'expires_minutes' => self::VERIFICATION_EXPIRES_MINUTES,
        ]);
    }

    public function verifyFirstTimeLogin(string $token, string $password, string $phone): User
    {
        $hashedToken = hash('sha256', strtoupper(trim($token)));

        $record = DB::table('user_verifications')
            ->where('token', $hashedToken)
            ->where('expires_at', '>', now())
            ->first();

        if (! $record) {
            throw ValidationException::withMessages([
                'token' => ['Invalid or expired verification token.'],
            ]);
        }

        /** @var User|null $user */
        $user = User::query()->find($record->user_id);
        if (! $user || $user->role !== 'participant') {
            throw ValidationException::withMessages([
                'token' => ['Verification token is invalid.'],
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($password),
            'phone' => $phone,
            'email_verified_at' => $user->email_verified_at ?? now(),
            'is_active' => true,
        ])->save();

        DB::table('user_verifications')
            ->where('user_id', $user->id)
            ->delete();

        return $user;
    }

    public function login(?string $email, ?string $phone, string $password): User
    {
        $user = $this->findParticipantUser($email, $phone);

        if (! $user || ! Hash::check($password, (string) $user->password)) {
            throw ValidationException::withMessages([
                'login' => [__('auth.failed')],
            ]);
        }

        if ((bool) $user->is_active === false) {
            throw ValidationException::withMessages([
                'login' => ['This account is inactive.'],
            ]);
        }

        $user->update(['last_login_at' => now()]);

        return $user;
    }

    private function findParticipantUser(?string $email, ?string $phone): ?User
    {
        $query = User::query()->where('role', 'participant');

        if ($email && $phone) {
            $query->where(function ($q) use ($email, $phone): void {
                $q->where('email', $email)->orWhere('phone', $phone);
            });
        } elseif ($email) {
            $query->where('email', $email);
        } elseif ($phone) {
            $query->where('phone', $phone);
        } else {
            return null;
        }

        /** @var User|null */
        return $query->first();
    }
}

