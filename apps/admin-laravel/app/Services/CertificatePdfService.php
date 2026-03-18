<?php

namespace App\Services;

use App\Models\Certificate;
use App\Models\CertificateTemplate;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class CertificatePdfService
{
    public function __construct(
        protected CertificatePlaceholderService $placeholderService
    ) {}

    /**
     * Generate certificate PDF and QR code; update certificate pdf_path and return it.
     * Uses template-managed rendering when a template is available, otherwise legacy Blade view.
     */
    public function generatePdf(Certificate $certificate): Certificate
    {
        $certificate->loadMissing(['booking.participant', 'certificateTemplate']);

        $baseDir = 'certificates';
        $qrcodesDir = $baseDir . '/qrcodes';
        $certNumber = $this->sanitizeCertificateNumber($certificate->certificate_number);

        $verificationUrl = $this->placeholderService->buildVerificationUrl($certificate);
        $qrRelativePath = $qrcodesDir . '/' . $certNumber . '.png';
        $qrFullPath = Storage::path($qrRelativePath);

        $this->ensureDirectoryExists(Storage::path($qrcodesDir));
        QrCode::format('png')->size(200)->generate($verificationUrl, $qrFullPath);

        $qrImageData = base64_encode((string) file_get_contents($qrFullPath));

        $pdfDir = Storage::path($baseDir);
        $this->ensureDirectoryExists($pdfDir);
        $pdfFullPath = $pdfDir . '/' . $certNumber . '.pdf';

        $template = $this->resolveTemplate($certificate);
        $usedTemplate = false;

        if ($template !== null) {
            try {
                $viewData = $this->buildTemplateManagedViewData($certificate, $template, $qrImageData);
                $pdf = Pdf::loadView('certificates.template-managed', $viewData);
                $pdf->setPaper($template->page_size ?? 'a4', $template->orientation ?? 'portrait');
                $pdf->save($pdfFullPath);
                $usedTemplate = true;
            } catch (\Throwable) {
                // Fall back to legacy view if template rendering fails
            }
        }

        if (! $usedTemplate) {
            Pdf::loadView('certificates.template', [
                'certificate_number' => $certificate->certificate_number,
                'participant_name' => $certificate->booking?->participant?->full_name ?? '—',
                'issued_at' => $certificate->issued_at?->format('d M Y'),
                'qr_image_base64' => $qrImageData,
            ])->save($pdfFullPath);
        }

        $savedPdfPath = $baseDir . '/' . $certNumber . '.pdf';
        $certificate->update(['pdf_path' => $savedPdfPath]);

        return $certificate->fresh();
    }

    /**
     * Resolve which template to use: certificate's template, else active template, else null (legacy).
     */
    private function resolveTemplate(Certificate $certificate): ?CertificateTemplate
    {
        if ($certificate->certificate_template_id) {
            $template = CertificateTemplate::find($certificate->certificate_template_id);
            if ($template !== null) {
                return $template;
            }
        }

        return CertificateTemplate::where('is_active', true)->first();
    }

    /**
     * Build view data for template-managed certificate: placeholders, template fields, asset data URIs.
     *
     * @return array<string, mixed>
     */
    private function buildTemplateManagedViewData(Certificate $certificate, CertificateTemplate $template, string $qrImageBase64): array
    {
        $placeholders = $this->placeholderService->buildPlaceholders($certificate, $template);

        $bodyContent = $this->placeholderService->replacePlaceholders($template->body_content ?? '', $placeholders);
        $footerText = $this->placeholderService->replacePlaceholders($template->footer_text ?? '', $placeholders);

        return [
            'certificate' => $certificate,
            'template' => $template,
            'placeholders' => $placeholders,
            'body_content' => $bodyContent,
            'footer_text' => $footerText,
            'qr_image_base64' => $qrImageBase64,
            'verification_url' => $placeholders['{verification_url}'] ?? '',
            'logo_data_uri' => $this->imageToDataUri($template->logo_path),
            'background_data_uri' => $this->imageToDataUri($template->background_image_path),
            'left_signature_data_uri' => $this->imageToDataUri($template->left_signature_image_path),
            'right_signature_data_uri' => $this->imageToDataUri($template->right_signature_image_path),
        ];
    }

    /**
     * Read image from public disk and return a data URI for Dompdf (safe, no path dependency).
     */
    private function imageToDataUri(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        $disk = Storage::disk('public');
        if (! $disk->exists($path)) {
            return null;
        }

        $mime = match (strtolower(pathinfo($path, PATHINFO_EXTENSION))) {
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            default => 'image/jpeg',
        };

        $data = $disk->get($path);

        return 'data:' . $mime . ';base64,' . base64_encode($data);
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
