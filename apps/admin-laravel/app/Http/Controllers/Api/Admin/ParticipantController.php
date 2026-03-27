<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Participant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParticipantController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Participant::query()->with('employer')->orderBy('full_name');
        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function ($qry) use ($q) {
                $qry->where('full_name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('nric_passport', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%");
            });
        }
        $perPage = (int) $request->get('per_page', 15);
        $perPage = min(max($perPage, 1), 100);
        $participants = $query->paginate($perPage);
        return response()->json($participants);
    }

    public function show(Participant $participant): JsonResponse
    {
        $participant->load(['employer', 'bookings.classSession.program']);
        return response()->json($participant);
    }
}
