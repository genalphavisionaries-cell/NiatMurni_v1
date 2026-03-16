<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate {{ $certificate_number }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; padding: 40px; }
        .certificate { border: 2px solid #333; padding: 40px; text-align: center; }
        .certificate-number { font-size: 14px; color: #666; margin-bottom: 20px; }
        h1 { font-size: 24px; margin-bottom: 30px; }
        .participant { font-size: 20px; font-weight: bold; margin-bottom: 15px; }
        .issued { font-size: 12px; color: #666; margin-bottom: 25px; }
        .qr { margin-top: 20px; }
        .qr img { width: 120px; height: 120px; }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="certificate-number">Certificate No: {{ $certificate_number }}</div>
        <h1>Certificate of Completion</h1>
        <div class="participant">{{ $participant_name }}</div>
        <div class="issued">Issued: {{ $issued_at ?? '—' }}</div>
        @if(!empty($qr_image_base64))
        <div class="qr">
            <img src="data:image/png;base64,{{ $qr_image_base64 }}" alt="Verification QR Code">
        </div>
        @endif
    </div>
</body>
</html>
