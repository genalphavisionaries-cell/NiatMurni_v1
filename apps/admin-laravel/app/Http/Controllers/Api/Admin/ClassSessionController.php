<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClassSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassSessionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ClassSession::query()->with(['program', 'trainer'])->orderBy('starts_at', 'desc');
        if ($request->filled('program_id')) {
            $query->where('program_id', $request->program_id);
        }
        if ($request->filled('trainer_id')) {
            $query->where('trainer_id', $request->trainer_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('from')) {
            $query->where('starts_at', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->where('starts_at', '<=', $request->to);
        }
        $perPage = (int) $request->get('per_page', 15);
        $perPage = min(max($perPage, 1), 100);
        $sessions = $query->paginate($perPage);
        return response()->json($sessions);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'program_id' => 'required|exists:programs,id',
            'trainer_id' => 'nullable|exists:users,id',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after_or_equal:starts_at',
            'mode' => 'nullable|string|max:50',
            'language' => 'nullable|string|max:20',
            'venue' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'capacity' => 'integer|min:1|max:1000',
            'min_threshold' => 'integer|min:0|max:1000',
            'status' => 'string|in:scheduled,cancelled,completed,in_progress',
        ]);
        $validated['status'] = $validated['status'] ?? 'scheduled';
        $session = ClassSession::create($validated);
        $session->load(['program', 'trainer']);
        return response()->json($session, 201);
    }

    public function show(ClassSession $classSession): JsonResponse
    {
        $classSession->load(['program', 'trainer']);
        return response()->json($classSession);
    }

    public function update(Request $request, ClassSession $classSession): JsonResponse
    {
        $validated = $request->validate([
            'program_id' => 'sometimes|exists:programs,id',
            'trainer_id' => 'nullable|exists:users,id',
            'starts_at' => 'sometimes|date',
            'ends_at' => 'sometimes|date',
            'mode' => 'nullable|string|max:50',
            'language' => 'nullable|string|max:20',
            'venue' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'capacity' => 'integer|min:1|max:1000',
            'min_threshold' => 'integer|min:0|max:1000',
            'status' => 'string|in:scheduled,cancelled,completed,in_progress',
        ]);
        if (isset($validated['ends_at']) && isset($validated['starts_at']) && $validated['ends_at'] < $validated['starts_at']) {
            return response()->json(['message' => 'ends_at must be after starts_at'], 422);
        }
        $classSession->update($validated);
        $classSession->load(['program', 'trainer']);
        return response()->json($classSession);
    }

    public function destroy(ClassSession $classSession): JsonResponse
    {
        if ($classSession->bookings()->exists()) {
            return response()->json(['message' => 'Cannot delete class session with existing bookings.'], 422);
        }
        $classSession->delete();
        return response()->json(['message' => 'Class session deleted']);
    }
}
