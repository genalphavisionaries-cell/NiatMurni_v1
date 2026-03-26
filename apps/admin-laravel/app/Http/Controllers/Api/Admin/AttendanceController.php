<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AttendanceController extends Controller
{
    public function __construct(
        private readonly AttendanceService $attendanceService
    ) {}

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'class_session_id' => ['required', 'integer', 'exists:class_sessions,id'],
            'booking_id' => ['required', 'integer', 'exists:bookings,id'],
            'attendance_status' => ['nullable', Rule::in(['present', 'absent'])],
            'exam_passed' => ['sometimes', 'boolean'],
        ]);

        $updated = $this->attendanceService->updateAttendance($validated);

        return response()->json([
            'message' => 'Attendance updated.',
            'data' => $updated,
        ]);
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'class_session_id' => ['required', 'integer', 'exists:class_sessions,id'],
            'mode' => ['nullable', Rule::in(['rows', 'mark_all_present', 'mark_all_passed'])],
            'rows' => ['required_if:mode,rows', 'array'],
            'rows.*.booking_id' => ['required_with:rows', 'integer', 'exists:bookings,id'],
            'rows.*.attendance_status' => ['nullable', Rule::in(['present', 'absent'])],
            'rows.*.exam_passed' => ['sometimes', 'boolean'],
        ]);

        $mode = (string) ($validated['mode'] ?? 'rows');
        $classSessionId = (int) $validated['class_session_id'];

        $updated = match ($mode) {
            'mark_all_present' => $this->attendanceService->markAllPresent($classSessionId),
            'mark_all_passed' => $this->attendanceService->markAllPassed($classSessionId),
            default => $this->attendanceService->bulkUpdateAttendance($classSessionId, $validated['rows'] ?? []),
        };

        return response()->json([
            'message' => 'Attendance bulk update completed.',
            'data' => $updated,
            'updated_count' => count($updated),
        ]);
    }
}

