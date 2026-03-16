<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Services\CertificatePdfService;

class CertificateDownloadController extends Controller
{
    public function __construct(
        protected CertificatePdfService $certificatePdfService
    ) {}

    public function download(string $token)
    {
        $certificate = Certificate::where('verification_token', $token)->firstOrFail();

        $fullPath = storage_path('app/' . $certificate->pdf_path);
        if (! $certificate->pdf_path || ! is_file($fullPath)) {
            $certificate = $this->certificatePdfService->generatePdf($certificate);
            $fullPath = storage_path('app/' . $certificate->pdf_path);
        }

        $filename = basename($certificate->pdf_path) ?: 'certificate.pdf';

        return response()->download($fullPath, $filename);
    }
}
