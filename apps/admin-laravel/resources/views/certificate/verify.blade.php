<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@if($valid && ($data['status'] ?? '') === 'revoked')Certificate Revoked@elseif($valid)Certificate Verified@elseCertificate Not Found@endif | Niat Murni</title>
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
        .message--warning { color: #b91c1c; font-weight: 500; background: #fef2f2; padding: 0.75rem 1rem; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="card">
        @if($valid && ($data['status'] ?? '') === 'revoked')
            <h1 class="title">Certificate Revoked</h1>
            <span class="badge badge--invalid">REVOKED</span>
            <p class="message message--warning">This certificate has been revoked and is no longer valid.</p>
            <div class="detail">
                <div class="detail-label">Certificate Number</div>
                <div class="detail-value">{{ $data['certificate_number'] }}</div>
            </div>
            <div class="detail">
                <div class="detail-label">Participant Name</div>
                <div class="detail-value">{{ $data['participant_name'] ?? '—' }}</div>
            </div>
            <div class="detail">
                <div class="detail-label">Program</div>
                <div class="detail-value">{{ $data['program_name'] ?? '—' }}</div>
            </div>
            @if(!empty($data['revoked_at']))
            <div class="detail">
                <div class="detail-label">Revoked On</div>
                <div class="detail-value">{{ \Carbon\Carbon::parse($data['revoked_at'])->format('d F Y') }}</div>
            </div>
            @endif
            @if(!empty($data['revoked_reason']))
            <div class="detail">
                <div class="detail-label">Reason</div>
                <div class="detail-value">{{ $data['revoked_reason'] }}</div>
            </div>
            @endif
            <div class="issued-by">This certificate was officially issued by Niat Murni Academy but has since been revoked.</div>
        @elseif($valid)
            <h1 class="title">Certificate Verified</h1>
            <span class="badge badge--valid">VALID</span>
            <div class="detail">
                <div class="detail-label">Certificate Number</div>
                <div class="detail-value">{{ $data['certificate_number'] }}</div>
            </div>
            <div class="detail">
                <div class="detail-label">Participant Name</div>
                <div class="detail-value">{{ $data['participant_name'] ?? '—' }}</div>
            </div>
            <div class="detail">
                <div class="detail-label">NRIC / Passport</div>
                <div class="detail-value">{{ $data['participant_identity_no'] ?? '—' }}</div>
            </div>
            <div class="detail">
                <div class="detail-label">Program</div>
                <div class="detail-value">{{ $data['program_name'] ?? $data['course_name'] ?? '—' }}</div>
            </div>
            <div class="detail">
                <div class="detail-label">Attendance Date</div>
                <div class="detail-value">{{ isset($data['attendance_date']) && $data['attendance_date'] !== '—' ? \Carbon\Carbon::parse($data['attendance_date'])->format('d F Y') : '—' }}</div>
            </div>
            <div class="detail">
                <div class="detail-label">Completion Status</div>
                <div class="detail-value">{{ $data['completion_status'] ?? 'Attended & Passed' }}</div>
            </div>
            <div class="detail">
                <div class="detail-label">Tutor Name</div>
                <div class="detail-value">{{ $data['tutor_name'] ?? '—' }}</div>
            </div>
            <div class="detail">
                <div class="detail-label">Tutor Registration Number</div>
                <div class="detail-value">{{ $data['tutor_registration_number'] ?? '—' }}</div>
            </div>
            <div class="detail">
                <div class="detail-label">Issue Date</div>
                <div class="detail-value">{{ $data['issue_date'] ?? ($data['issued_at'] ? \Carbon\Carbon::parse($data['issued_at'])->format('d F Y') : '—') }}</div>
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
