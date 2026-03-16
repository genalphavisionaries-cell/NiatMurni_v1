<?php

namespace App\Services;

use App\Models\Certificate;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class CertificatePdfService
{
    /**
     * Generate certificate PDF and QR code; update certificate pdf_path and return it.
     */
    public function generatePdf(Certificate $certificate): Certificate
    {
        $certificate->loadMissing('booking.participant');

        $baseDir = 'certificates';
        $qrcodesDir = $baseDir . '/qrcodes';
        $certNumber = $this->sanitizeCertificateNumber($certificate->certificate_number);

        $verificationUrl = rtrim((string) config('app.url'), '/') . $certificate->qr_code;
        $qrRelativePath = $qrcodesDir . '/' . $certNumber . '.png';
        $qrFullPath = Storage::path($qrRelativePath);

        $this->ensureDirectoryExists(Storage::path($qrcodesDir));
        QrCode::format('png')->size(200)->generate($verificationUrl, $qrFullPath);

        $qrImageData = base64_encode((string) file_get_contents($qrFullPath));

        $pdfDir = Storage::path($baseDir);
        $this->ensureDirectoryExists($pdfDir);
        $pdfFullPath = $pdfDir . '/' . $certNumber . '.pdf';

        Pdf::loadView('certificates.template', [
            'certificate_number' => $certificate->certificate_number,
            'participant_name' => $certificate->booking?->participant?->full_name ?? '—',
            'issued_at' => $certificate->issued_at?->format('d M Y'),
            'qr_image_base64' => $qrImageData,
        ])->save($pdfFullPath);

        $savedPdfPath = $baseDir . '/' . $certNumber . '.pdf';
        $certificate->update(['pdf_path' => $savedPdfPath]);

        return $certificate->fresh();
    }

    private function ensureDirectoryExists(string $path): void
    {
        if (! is_dir($path)) {
            mkdir($path, 0755, true);
        }
    }

    private function sanitizeCertificateNumber(string $number): string
    {
        return preg_replace('/[^a-zA-Z0-9\-]/', '', $number) ?: 'certificate';
    }
}
