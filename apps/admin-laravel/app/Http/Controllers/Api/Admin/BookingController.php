<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Booking::query()
            ->with(['participant', 'classSession.program', 'classSession.trainer'])
            ->orderBy('created_at', 'desc');
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }
        if ($request->filled('class_session_id')) {
            $query->where('class_session_id', $request->class_session_id);
        }
        if ($request->filled('participant_id')) {
            $query->where('participant_id', $request->participant_id);
        }
        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }
        $perPage = (int) $request->get('per_page', 15);
        $perPage = min(max($perPage, 1), 100);
        $bookings = $query->paginate($perPage);
        return response()->json($bookings);
    }

    public function show(Booking $booking): JsonResponse
    {
        $booking->load(['participant', 'classSession.program', 'classSession.trainer', 'certificate']);
        return response()->json($booking);
    }

    public function update(Request $request, Booking $booking): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'string|in:pending,confirmed,paid,cancelled,completed,no_show',
            'payment_status' => 'string|in:pending,paid,failed,refunded',
        ]);
        $booking->update($validated);
        $booking->load(['participant', 'classSession.program', 'classSession.trainer']);
        return response()->json($booking);
    }
}
