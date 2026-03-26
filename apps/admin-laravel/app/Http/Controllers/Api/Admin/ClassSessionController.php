<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClassSession;
use App\Models\Tutor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassSessionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ClassSession::query()->with(['program', 'tutor.user'])->orderBy('starts_at', 'desc');
        if ($request->filled('program_id')) {
            $query->where('program_id', $request->program_id);
        }
        if ($request->filled('trainer_id')) {
            $trainerUserId = (int) $request->trainer_id;
            $query->whereHas('tutor', fn ($q) => $q->where('user_id', $trainerUserId));
        }
        if ($request->filled('tutor_id')) {
            $query->where('tutor_id', $request->tutor_id);
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

        $sessions->setCollection(
            $sessions->getCollection()->map(fn (ClassSession $session) => $this->toApiShape($session))
        );

        return response()->json($sessions);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'program_id' => 'required|exists:programs,id',
            'trainer_id' => 'nullable|exists:users,id',
            'tutor_id' => 'nullable|exists:tutors,id',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after_or_equal:starts_at',
            'mode'     => 'nullable|string|in:online,physical,in_person',
            'language' => 'nullable|string|max:255',
            'venue' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'capacity' => 'integer|min:1|max:1000',
            'min_threshold' => 'integer|min:0|max:1000',
            'status' => 'string|in:scheduled,cancelled,completed,in_progress',
        ]);
        $validated = $this->normalizeInput($validated);
        $validated['status'] = $validated['status'] ?? 'scheduled';
        $session = ClassSession::create($validated);
        $session->load(['program', 'tutor.user']);

        return response()->json($this->toApiShape($session), 201);
    }

    public function show(ClassSession $classSession): JsonResponse
    {
        $classSession->load(['program', 'tutor.user']);
        return response()->json($this->toApiShape($classSession));
    }

    public function update(Request $request, ClassSession $classSession): JsonResponse
    {
        $validated = $request->validate([
            'program_id' => 'sometimes|exists:programs,id',
            'trainer_id' => 'nullable|exists:users,id',
            'tutor_id' => 'nullable|exists:tutors,id',
            'starts_at' => 'sometimes|date',
            'ends_at' => 'sometimes|date',
            'mode'     => 'nullable|string|in:online,physical,in_person',
            'language' => 'nullable|string|max:255',
            'venue' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'capacity' => 'integer|min:1|max:1000',
            'min_threshold' => 'integer|min:0|max:1000',
            'status' => 'string|in:scheduled,cancelled,completed,in_progress',
        ]);
        $validated = $this->normalizeInput($validated);
        if (isset($validated['ends_at']) && isset($validated['starts_at']) && $validated['ends_at'] < $validated['starts_at']) {
            return response()->json(['message' => 'ends_at must be after starts_at'], 422);
        }
        $classSession->update($validated);
        $classSession->load(['program', 'tutor.user']);
        return response()->json($this->toApiShape($classSession));
    }

    public function destroy(ClassSession $classSession): JsonResponse
    {
        if ($classSession->bookings()->exists()) {
            return response()->json(['message' => 'Cannot delete class session with existing bookings.'], 422);
        }
        $classSession->delete();
        return response()->json(['message' => 'Class session deleted']);
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function normalizeInput(array $validated): array
    {
        if (isset($validated['trainer_id']) && ! isset($validated['tutor_id']) && $validated['trainer_id']) {
            $validated['tutor_id'] = Tutor::query()
                ->where('user_id', (int) $validated['trainer_id'])
                ->value('id');
        }

        unset($validated['trainer_id']);

        if (array_key_exists('min_threshold', $validated)) {
            $validated['min_threshold_minutes'] = $validated['min_threshold'];
            unset($validated['min_threshold']);
        }

        if (($validated['mode'] ?? null) === 'in_person') {
            $validated['mode'] = 'physical';
        }

        return $validated;
    }

    private function toApiShape(ClassSession $session): ClassSession
    {
        $trainerUser = $session->tutor?->user;
        $session->setAttribute('trainer_id', $trainerUser?->id);

        if ($trainerUser !== null) {
            $session->setRelation('trainer', $trainerUser);
        }

        return $session;
    }
}
