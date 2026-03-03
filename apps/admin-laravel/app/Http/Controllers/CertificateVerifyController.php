<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CertificateVerifyController extends Controller
{
    /**
     * Public verification: GET /verify/{qr_token}
     * Returns certificate status (valid/revoked), name, masked NRIC, date attended, issued date, trainer.
     */
    public function __invoke(Request $request, string $qrToken): JsonResponse
    {
        $certificate = Certificate::with(['booking.participant', 'booking.classSession.trainer'])
            ->where('qr_token', $qrToken)
            ->first();

        if (! $certificate) {
            return response()->json([
                'found' => false,
                'message' => 'Certificate not found',
            ], 404);
        }

        $participant = $certificate->booking->participant;
        $classSession = $certificate->booking->classSession;
        $nric = $participant->nric_passport ?? '';
        $maskedNric = strlen($nric) > 8
            ? substr($nric, 0, 4) . '****' . substr($nric, -4)
            : '****';

        return response()->json([
            'found' => true,
            'status' => $certificate->status,
            'certificate_number' => $certificate->certificate_number,
            'participant_name' => $participant->full_name,
            'nric_masked' => $maskedNric,
            'program_name' => $classSession->program->name ?? null,
            'date_attended' => $classSession->starts_at?->format('Y-m-d'),
            'issued_at' => $certificate->issued_at?->format('c'),
            'trainer_name' => $classSession->trainer->name ?? null,
            'revoked_at' => $certificate->revoked_at?->format('c'),
            'revoked_reason' => $certificate->revoked_reason,
        ]);
    }
}
