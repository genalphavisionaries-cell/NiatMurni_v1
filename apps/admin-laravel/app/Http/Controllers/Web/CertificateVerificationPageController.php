<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\CertificateVerificationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\View\View;

class CertificateVerificationPageController extends Controller
{
    public function __construct(
        protected CertificateVerificationService $verificationService
    ) {}

    /**
     * Show public certificate verification page. GET /certificate/verify/{token}
     */
    public function show(string $token): View
    {
        try {
            $data = $this->verificationService->verifyByToken($token);
            return view('certificate.verify', ['valid' => true, 'data' => $data]);
        } catch (ModelNotFoundException) {
            return view('certificate.verify', ['valid' => false, 'data' => null]);
        }
    }
}
