@php
    /** @var \App\Models\Certificate $certificate */
    /** @var \App\Models\CertificateTemplate $template */
    $titleAlign = $template->title_alignment ?? 'center';
    $subtitleAlign = $template->subtitle_alignment ?? 'center';
    $bodyAlign = $template->body_alignment ?? 'left';
    $footerAlign = $template->footer_alignment ?? 'center';
    $titleSize = (int) ($template->title_font_size ?? 28);
    $subtitleSize = (int) ($template->subtitle_font_size ?? 18);
    $bodySize = (int) ($template->body_font_size ?? 14);
    $footerSize = (int) ($template->footer_font_size ?? 12);
    $topOffset = (int) ($template->content_top_offset ?? 40);
    $bottomOffset = (int) ($template->content_bottom_offset ?? 40);
    $showLogo = (bool) $template->show_logo;
    $showLeftSignature = (bool) $template->show_left_signature;
    $showRightSignature = (bool) $template->show_right_signature;
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Certificate {{ $certificate->certificate_number }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; margin: 0; padding: 0; }
        .certificate-wrap { position: relative; width: 100%; min-height: 100vh; box-sizing: border-box; }
        .certificate-wrap.has-bg { background-size: cover; background-position: center; background-repeat: no-repeat; }
        .certificate-inner { position: relative; padding: {{ $topOffset }}px 40px {{ $bottomOffset }}px; box-sizing: border-box; }
        .certificate-number { font-size: 12px; color: #666; margin-bottom: 8px; }
        .title-block { margin-bottom: 12px; }
        .subtitle-block { margin-bottom: 16px; }
        .body-block { margin-bottom: 20px; white-space: pre-line; }
        .footer-block { font-size: {{ $footerSize }}px; color: #444; margin-top: 24px; white-space: pre-line; }
        .signatures { display: table; width: 100%; margin-top: 28px; }
        .sig-cell { display: table-cell; width: 50%; vertical-align: top; text-align: center; padding: 0 16px; }
        .sig-img { max-height: 56px; margin-bottom: 4px; }
        .sig-name { font-weight: bold; font-size: {{ $footerSize }}px; }
        .sig-title { font-size: 11px; color: #666; }
        .qr-block { margin-top: 20px; text-align: center; }
        .qr-block img { width: 120px; height: 120px; }
    </style>
</head>
<body>
    <div class="certificate-wrap @if($background_data_uri ?? null) has-bg @endif" @if(!empty($background_data_uri)) style="background-image: url('{{ $background_data_uri }}');" @endif>
        <div class="certificate-inner">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                @if($showLogo && !empty($logo_data_uri))
                    <div><img src="{{ $logo_data_uri }}" alt="Logo" style="max-height: 64px; max-width: 180px; object-fit: contain;" /></div>
                @else
                    <div></div>
                @endif
                <div class="certificate-number" style="text-align: right;">Certificate No: {{ $certificate->certificate_number }}</div>
            </div>

            <div class="title-block" style="text-align: {{ $titleAlign }}; font-size: {{ $titleSize }}px; font-weight: 700;">
                {{ $template->name ?: 'Certificate of Completion' }}
            </div>

            @if($template->subtitle)
                <div class="subtitle-block" style="text-align: {{ $subtitleAlign }}; font-size: {{ $subtitleSize }}px;">
                    {{ $template->subtitle }}
                </div>
            @endif

            @if(!empty($body_content))
                <div class="body-block" style="text-align: {{ $bodyAlign }}; font-size: {{ $bodySize }}px;">
                    {!! nl2br(e($body_content)) !!}
                </div>
            @endif

            <div class="signatures">
                @if($showLeftSignature)
                    <div class="sig-cell">
                        @if(!empty($left_signature_data_uri))
                            <img src="{{ $left_signature_data_uri }}" alt="Signature" class="sig-img" />
                        @else
                            <div class="sig-img" style="height: 56px; border-bottom: 1px dashed #999;"></div>
                        @endif
                        <div class="sig-name">{{ $template->left_signatory_name ?: '—' }}</div>
                        @if($template->left_signatory_title)
                            <div class="sig-title">{{ $template->left_signatory_title }}</div>
                        @endif
                    </div>
                @endif
                @if($showRightSignature)
                    <div class="sig-cell">
                        @if(!empty($right_signature_data_uri))
                            <img src="{{ $right_signature_data_uri }}" alt="Signature" class="sig-img" />
                        @else
                            <div class="sig-img" style="height: 56px; border-bottom: 1px dashed #999;"></div>
                        @endif
                        <div class="sig-name">{{ $template->right_signatory_name ?: '—' }}</div>
                        @if($template->right_signatory_title)
                            <div class="sig-title">{{ $template->right_signatory_title }}</div>
                        @endif
                    </div>
                @endif
            </div>

            @if(!empty($footer_text))
                <div class="footer-block" style="text-align: {{ $footerAlign }};">
                    {!! nl2br(e($footer_text)) !!}
                </div>
            @endif

            @if($template->organization_details ?? null)
                <div class="footer-block" style="text-align: {{ $footerAlign }}; font-size: 11px; margin-top: 12px;">
                    {!! nl2br(e($template->organization_details)) !!}
                </div>
            @endif

            @if(!empty($qr_image_base64))
                <div class="qr-block">
                    <img src="data:image/png;base64,{{ $qr_image_base64 }}" alt="Verification QR Code" />
                </div>
            @endif
        </div>
    </div>
</body>
</html>
