<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Participant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParticipantCertificatesController extends Controller
{
    /**
     * GET /api/participant/certificates
     * Returns valid (non-revoked) certificates for the authenticated participant.
     * Each certificate includes a download URL using the existing public download route.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user || $user->role !== 'participant') {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $participant = Participant::where('user_id', $user->id)->first();
        if (! $participant) {
            return response()->json(['message' => 'Participant profile not found'], 403);
        }

        $baseUrl = rtrim(config('app.url'), '/');
        $certificates = $participant->bookings()
            ->with(['classSession.program', 'certificate'])
            ->whereHas('certificate')
            ->get()
            ->map(function ($booking) use ($baseUrl) {
                $cert = $booking->certificate;
                return [
                    'certificate_number' => $cert->certificate_number,
                    'program_name' => $booking->classSession?->program?->name ?? '—',
                    'issued_at' => $cert->issued_at?->toIso8601String(),
                    'issue_date' => $cert->issued_at?->format('d M Y'),
                    'download_url' => $baseUrl . '/api/certificate/download/' . $cert->verification_token,
                ];
            })
            ->values()
            ->all();

        return response()->json(['certificates' => $certificates]);
    }
}
