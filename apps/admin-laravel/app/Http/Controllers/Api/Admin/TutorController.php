<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class TutorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query()->where('role', 'trainer')->orderBy('name');
        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function ($qry) use ($q) {
                $qry->where('name', 'like', "%{$q}%")->orWhere('email', 'like', "%{$q}%");
            });
        }
        if ($request->has('is_active')) {
            $query->where('is_active', (bool) $request->is_active);
        }
        $perPage = (int) $request->get('per_page', 15);
        $perPage = min(max($perPage, 1), 100);
        $tutors = $query->paginate($perPage);
        return response()->json($tutors);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);
        $validated['password'] = Hash::make($validated['password']);
        $validated['role'] = 'trainer';
        $validated['is_active'] = $validated['is_active'] ?? true;
        $user = User::create($validated);
        unset($user->password);
        return response()->json($user, 201);
    }

    public function show(User $user): JsonResponse
    {
        if ($user->role !== 'trainer') {
            return response()->json(['message' => 'Not a trainer'], 404);
        }
        $user->loadCount('classSessionsAsTrainer');
        return response()->json($user);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        if ($user->role !== 'trainer') {
            return response()->json(['message' => 'Not a trainer'], 404);
        }
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed',
            'phone' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);
        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }
        $user->update($validated);
        unset($user->password);
        return response()->json($user);
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->role !== 'trainer') {
            return response()->json(['message' => 'Not a trainer'], 404);
        }
        if ($user->classSessionsAsTrainer()->exists()) {
            return response()->json(['message' => 'Cannot delete tutor with assigned classes. Unassign or reassign classes first.'], 422);
        }
        $user->delete();
        return response()->json(['message' => 'Tutor deleted']);
    }
}
