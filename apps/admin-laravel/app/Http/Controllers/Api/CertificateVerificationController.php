<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CertificateVerificationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class CertificateVerificationController extends Controller
{
    public function __construct(
        protected CertificateVerificationService $verificationService
    ) {}

    /**
     * Verify a certificate by token. GET /api/certificate/verify/{token}
     */
    public function verify(string $token): JsonResponse
    {
        try {
            $data = $this->verificationService->verifyByToken($token);
            return response()->json($data);
        } catch (ModelNotFoundException) {
            return response()->json(['message' => 'Certificate not found'], 404);
        }
    }
}
