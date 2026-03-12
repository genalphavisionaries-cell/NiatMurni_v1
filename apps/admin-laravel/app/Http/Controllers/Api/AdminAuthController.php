<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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
}
