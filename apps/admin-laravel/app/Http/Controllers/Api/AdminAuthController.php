<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class AdminAuthController extends Controller
{
    public const COOKIE_NAME = 'admin_token';

    /** Non-HttpOnly cookie so Next.js middleware can redirect unauthenticated users. */
    public const SESSION_FLAG_COOKIE = 'admin_session';

    /**
     * POST /api/admin/login
     * Returns user and sets HttpOnly cookie with Sanctum token.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }

        if (!$user->canAccessAdmin()) {
            throw ValidationException::withMessages([
                'email' => ['User is not allowed to access the admin panel.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['This account is inactive. Please contact an administrator.'],
            ]);
        }

        $user->update(['last_login_at' => now()]);

        $token = $user->createToken('admin', ['*'])->plainTextToken;

        $response = response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);

        $minutes = 60 * 24 * 7;
        $response->cookie(self::COOKIE_NAME, $token, $minutes, '/', null, true, true, false, 'lax');
        $response->cookie(self::SESSION_FLAG_COOKIE, '1', $minutes, '/', null, false, true, false, 'lax');

        return $response;
    }

    /**
     * POST /api/admin/logout
     * Revoke current token and clear cookie.
     */
    public function logout(Request $request): JsonResponse
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        $response = response()->json(['message' => 'Logged out']);
        $response->cookie(self::COOKIE_NAME, '', 0, '/', null, true, true, false, 'lax');
        $response->cookie(self::SESSION_FLAG_COOKIE, '', 0, '/', null, false, true, false, 'lax');

        return $response;
    }

    /**
     * GET /api/admin/me
     * Return current authenticated admin user.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        if (!$user->canAccessAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * POST /api/admin/forgot-password
     * Sends password-reset email token using Laravel broker.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        Password::sendResetLink([
            'email' => (string) $request->string('email'),
        ]);

        // Enumeration-safe response.
        return response()->json([
            'message' => 'If your account exists, a password reset link has been sent.',
        ]);
    }

    /**
     * POST /api/admin/reset-password
     * Consumes reset token and updates password.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::min(12)->letters()->mixedCase()->numbers()->symbols()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request): void {
                $user->forceFill([
                    'password' => Hash::make($request->string('password')->toString()),
                    'remember_token' => Str::random(60),
                ])->save();

                $user->tokens()->delete();
                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json(['message' => __($status)]);
    }

    /**
     * POST /api/admin/change-password
     * Authenticated admin password change.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', PasswordRule::min(12)->letters()->mixedCase()->numbers()->symbols()],
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();
        $user->update([
            'password' => Hash::make($request->string('password')->toString()),
        ]);
        $user->tokens()->delete();

        return response()->json(['message' => 'Password changed successfully. Please log in again.']);
    }
}
