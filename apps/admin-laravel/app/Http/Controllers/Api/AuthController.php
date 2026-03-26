<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Participant;
use App\Models\User;
use App\Services\ParticipantAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password as PasswordRule;

class AuthController extends Controller
{
    public const COOKIE_NAME = 'participant_token';
    public const SESSION_FLAG_COOKIE = 'participant_session';

    public function __construct(
        private readonly ParticipantAuthService $authService,
    ) {}

    public function requestFirstTimeLogin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['nullable', 'email', 'required_without:phone'],
            'phone' => ['nullable', 'string', 'max:30', 'required_without:email'],
        ]);

        $this->authService->requestFirstTimeLogin(
            email: isset($validated['email']) ? (string) $validated['email'] : null,
            phone: isset($validated['phone']) ? (string) $validated['phone'] : null,
        );

        return response()->json([
            'message' => 'If your account exists, a verification token has been sent.',
        ]);
    }

    public function verifyFirstTimeLogin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string', 'size:6'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)->letters()->mixedCase()->numbers()],
            'phone' => ['required', 'string', 'max:30'],
        ]);

        $user = $this->authService->verifyFirstTimeLogin(
            token: (string) $validated['token'],
            password: (string) $validated['password'],
            phone: (string) $validated['phone'],
        );

        return response()->json([
            'message' => 'First-time login setup completed successfully.',
            'user' => $this->userPayload($user->id),
        ]);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['nullable', 'email', 'required_without:phone'],
            'phone' => ['nullable', 'string', 'max:30', 'required_without:email'],
            'password' => ['required', 'string'],
        ]);

        $user = $this->authService->login(
            email: isset($validated['email']) ? (string) $validated['email'] : null,
            phone: isset($validated['phone']) ? (string) $validated['phone'] : null,
            password: (string) $validated['password'],
        );

        $token = $user->createToken('participant', ['participant'])->plainTextToken;

        $response = response()->json([
            'user' => $this->userPayload($user->id),
        ]);

        $minutes = 60 * 24 * 7;
        $response->cookie(self::COOKIE_NAME, $token, $minutes, '/', null, true, true, false, 'lax');
        $response->cookie(self::SESSION_FLAG_COOKIE, '1', $minutes, '/', null, false, true, false, 'lax');

        return $response;
    }

    public function logout(Request $request): JsonResponse
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()?->delete();
        }

        $response = response()->json(['message' => 'Logged out']);
        $response->cookie(self::COOKIE_NAME, '', 0, '/', null, true, true, false, 'lax');
        $response->cookie(self::SESSION_FLAG_COOKIE, '', 0, '/', null, false, true, false, 'lax');

        return $response;
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user || $user->role !== 'participant') {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        return response()->json([
            'user' => $this->userPayload($user->id),
        ]);
    }

    private function userPayload(int $userId): array
    {
        /** @var User|null $user */
        $user = User::query()->find($userId);
        $participant = Participant::query()->where('user_id', $userId)->first();

        return [
            'id' => $userId,
            'participant_id' => $participant?->id,
            'full_name' => (string) ($participant?->full_name ?? ''),
            'email' => (string) ($participant?->email ?? $user?->email ?? ''),
            'phone' => (string) ($participant?->phone ?? $user?->phone ?? ''),
            'is_verified' => $user?->email_verified_at !== null,
        ];
    }
}

