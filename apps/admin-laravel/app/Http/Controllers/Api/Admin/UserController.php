<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query()
            ->whereIn('role', ['admin', 'staff', 'tutor'])
            ->orderByDesc('created_at');

        if ($request->filled('search')) {
            $search = (string) $request->input('search');
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('admin_role', 'like', "%{$search}%")
                    ->orWhere('role', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $isActive = $request->input('status') === 'active';
            $query->where('is_active', $isActive);
        }

        $perPage = max(1, min((int) $request->input('per_page', 15), 100));
        $users = $query->paginate($perPage);

        return response()->json([
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(12)->letters()->mixedCase()->numbers()->symbols()],
            'role' => ['required', Rule::in(['super_admin', 'operations_admin', 'finance_admin', 'cms_admin', 'accountant'])],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'admin',
            'admin_role' => $validated['role'],
            'is_active' => ($validated['status'] ?? 'active') === 'active',
        ]);

        return response()->json(['data' => $this->transformUser($user)], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['sometimes', 'required', Rule::in(['super_admin', 'operations_admin', 'finance_admin', 'cms_admin', 'accountant'])],
            'status' => ['sometimes', 'required', Rule::in(['active', 'inactive'])],
        ]);

        /** @var User $actor */
        $actor = $request->user();

        $nextRole = $validated['role'] ?? $user->admin_role;
        $nextActive = isset($validated['status']) ? $validated['status'] === 'active' : (bool) $user->is_active;

        if ($actor->id === $user->id && ! $nextActive) {
            return response()->json(['message' => 'You cannot deactivate your own account.'], 422);
        }

        if ($user->admin_role === 'super_admin') {
            $losingSuper = ($nextRole !== 'super_admin') || ! $nextActive;
            if ($losingSuper) {
                $otherActiveSuper = User::query()
                    ->where('admin_role', 'super_admin')
                    ->where('is_active', true)
                    ->where('id', '!=', $user->id)
                    ->count();
                if ($otherActiveSuper === 0) {
                    return response()->json(['message' => 'Cannot remove or deactivate the last active super admin.'], 422);
                }
            }
        }

        $payload = [];
        if (array_key_exists('name', $validated)) {
            $payload['name'] = $validated['name'];
        }
        if (array_key_exists('email', $validated)) {
            $payload['email'] = $validated['email'];
        }
        if (array_key_exists('role', $validated)) {
            $payload['role'] = 'admin';
            $payload['admin_role'] = $validated['role'];
        }
        if (array_key_exists('status', $validated)) {
            $payload['is_active'] = $validated['status'] === 'active';
        }

        $user->update($payload);

        return response()->json(['data' => $this->transformUser($user->fresh() ?? $user)]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        /** @var User $actor */
        $actor = $request->user();
        if ($actor->id === $user->id) {
            return response()->json(['message' => 'You cannot deactivate your own account.'], 422);
        }

        if ($user->admin_role === 'super_admin' && $user->is_active) {
            $otherActiveSuper = User::query()
                ->where('admin_role', 'super_admin')
                ->where('is_active', true)
                ->where('id', '!=', $user->id)
                ->count();
            if ($otherActiveSuper === 0) {
                return response()->json(['message' => 'Cannot deactivate the last active super admin.'], 422);
            }
        }

        $user->update(['is_active' => false]);
        $user->tokens()->delete();

        return response()->json([
            'data' => $this->transformUser($user->fresh() ?? $user),
            'message' => 'User deactivated successfully.',
        ]);
    }

    public function resetPassword(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'password' => ['required', 'confirmed', Password::min(12)->letters()->mixedCase()->numbers()->symbols()],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);
        $user->tokens()->delete();

        return response()->json([
            'data' => $this->transformUser($user),
            'message' => 'Password reset successful.',
        ]);
    }

    private function transformUser(User $user): array
    {
        return [
            'id' => (int) $user->id,
            'name' => (string) $user->name,
            'email' => (string) $user->email,
            'role' => (string) ($user->admin_role ?: $user->role),
            'status' => $user->is_active ? 'active' : 'inactive',
            'created_at' => optional($user->created_at)->toIso8601String(),
            'updated_at' => optional($user->updated_at)->toIso8601String(),
        ];
    }
}
