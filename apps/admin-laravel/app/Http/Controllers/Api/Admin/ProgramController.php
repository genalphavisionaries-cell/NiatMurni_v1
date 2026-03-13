<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Program;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProgramController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Program::query()->orderBy('name');
        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function ($qry) use ($q) {
                $qry->where('name', 'like', "%{$q}%")
                    ->orWhere('slug', 'like', "%{$q}%");
            });
        }
        if ($request->has('is_active')) {
            $query->where('is_active', (bool) $request->is_active);
        }
        $perPage = (int) $request->get('per_page', 15);
        $perPage = min(max($perPage, 1), 100);
        $programs = $query->paginate($perPage);
        return response()->json($programs);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:programs,slug',
            'description' => 'nullable|string',
            'default_capacity' => 'integer|min:1|max:1000',
            'min_threshold' => 'integer|min:0|max:1000',
            'delivery_mode' => 'nullable|string|max:50',
            'duration_hours' => 'nullable|numeric|min:0',
            'price' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        $validated['is_active'] = $validated['is_active'] ?? true;
        $program = Program::create($validated);
        return response()->json($program, 201);
    }

    public function show(Program $program): JsonResponse
    {
        return response()->json($program);
    }

    public function update(Request $request, Program $program): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'nullable|string|max:255|unique:programs,slug,' . $program->id,
            'description' => 'nullable|string',
            'default_capacity' => 'integer|min:1|max:1000',
            'min_threshold' => 'integer|min:0|max:1000',
            'delivery_mode' => 'nullable|string|max:50',
            'duration_hours' => 'nullable|numeric|min:0',
            'price' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);
        $program->update($validated);
        return response()->json($program);
    }

    public function destroy(Program $program): JsonResponse
    {
        if ($program->classSessions()->exists()) {
            return response()->json(['message' => 'Cannot delete program with existing class sessions.'], 422);
        }
        $program->delete();
        return response()->json(['message' => 'Program deleted']);
    }
}
