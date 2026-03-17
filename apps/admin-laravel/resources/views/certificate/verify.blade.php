<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $valid ? 'Certificate Verified' : 'Certificate Not Found' }} | Niat Murni</title>
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f3f4f6;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }
        .card {
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            max-width: 480px;
            width: 100%;
            padding: 2rem;
            text-align: center;
        }
        .title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #111827;
            margin: 0 0 1.5rem;
        }
        .badge {
            display: inline-block;
            padding: 0.35rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
        }
        .badge--valid { background: #d1fae5; color: #065f46; }
        .badge--invalid { background: #fee2e2; color: #991b1b; }
        .detail { text-align: left; margin: 0.75rem 0; padding: 0.75rem 1rem; background: #f9fafb; border-radius: 8px; }
        .detail-label { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
        .detail-value { font-size: 1rem; color: #111827; font-weight: 500; }
        .message { color: #6b7280; margin: 0 0 1rem; line-height: 1.5; }
        .issued-by { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb; font-size: 0.875rem; color: #6b7280; line-height: 1.5; }
        .verified-on { margin-top: 0.75rem; font-size: 0.8125rem; color: #9ca3af; }
    </style>
</head>
<body>
    <div class="card">
        @if($valid)
            <h1 class="title">Certificate Verified</h1>
            <span class="badge badge--valid">VALID</span>
            <div class="detail">
                <div class="detail-label">Certificate Number</div>
                <div class="detail-value">{{ $data['certificate_number'] }}</div>
                <div class="detail-label" style="margin-top: 0.5rem;">Verification ID</div>
                <div class="detail-value">{{ $data['certificate_number'] }}</div>
            </div>
            <div class="detail">
                <div class="detail-label">Participant Name</div>
                <div class="detail-value">{{ $data['participant_name'] }}</div>
            </div>
            <div class="detail">
                <div class="detail-label">Course Name</div>
                <div class="detail-value">{{ $data['course_name'] }}</div>
            </div>
            <div class="detail">
                <div class="detail-label">Issued Date</div>
                <div class="detail-value">{{ $data['issued_at'] ? \Carbon\Carbon::parse($data['issued_at'])->format('d F Y') : '—' }}</div>
            </div>
            <div class="verified-on">Verified on: {{ now()->format('d F Y, H:i') }}</div>
            <div class="issued-by">This certificate is officially issued and verified by Niat Murni Academy</div>
        @else
            <h1 class="title">Certificate Not Found</h1>
            <span class="badge badge--invalid">INVALID</span>
            <p class="message">This certificate is not valid or does not exist.</p>
        @endif
    </div>
</body>
</html>
