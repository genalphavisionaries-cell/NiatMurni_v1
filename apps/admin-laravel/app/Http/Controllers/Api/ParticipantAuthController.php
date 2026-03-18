<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Participant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ParticipantAuthController extends Controller
{
    public const COOKIE_NAME = 'participant_token';

    /** Non-HttpOnly cookie so Next.js can check if participant is logged in. */
    public const SESSION_FLAG_COOKIE = 'participant_session';

    /**
     * POST /api/participant/login
     * Authenticate as participant (User with role 'participant'). Links to Participant via user_id.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }

        if ($user->role !== 'participant') {
            throw ValidationException::withMessages([
                'email' => ['This account cannot access the participant portal.'],
            ]);
        }

        $participant = Participant::where('user_id', $user->id)->first();
        if (! $participant) {
            throw ValidationException::withMessages([
                'email' => ['No participant profile linked to this account.'],
            ]);
        }

        $user->update(['last_login_at' => now()]);

        $token = $user->createToken('participant', ['participant'])->plainTextToken;

        $response = response()->json([
            'participant' => [
                'id' => $participant->id,
                'full_name' => $participant->full_name,
                'email' => $participant->email ?? $user->email,
            ],
        ]);

        $minutes = 60 * 24 * 7;
        $response->cookie(self::COOKIE_NAME, $token, $minutes, '/', null, true, true, false, 'lax');
        $response->cookie(self::SESSION_FLAG_COOKIE, '1', $minutes, '/', null, false, true, false, 'lax');

        return $response;
    }

    /**
     * POST /api/participant/logout
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
     * GET /api/participant/me
     * Return current authenticated participant (requires auth:sanctum and participant scope).
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user || $user->role !== 'participant') {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $participant = Participant::where('user_id', $user->id)->first();
        if (! $participant) {
            return response()->json(['message' => 'Participant profile not found'], 403);
        }

        return response()->json([
            'participant' => [
                'id' => $participant->id,
                'full_name' => $participant->full_name,
                'email' => $participant->email ?? $user->email,
            ],
        ]);
    }
}
