<?php

namespace App\Http\Controllers;

use App\Services\CertificateVerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class CertificateVerifyController extends Controller
{
    public function __construct(
        protected CertificateVerificationService $verificationService
    ) {}

    /**
     * Public verification: GET /verify/{qrToken}
     * Returns full certificate data contract: participant name, identity, program, attendance, tutor, status, etc.
     */
    public function __invoke(Request $request, string $qrToken): JsonResponse
    {
        try {
            $data = $this->verificationService->verifyByToken($qrToken);
            return response()->json([
                'found' => true,
                ...$data,
            ]);
        } catch (ModelNotFoundException) {
            return response()->json([
                'found' => false,
                'message' => 'Certificate not found',
            ], 404);
        }
    }
}
