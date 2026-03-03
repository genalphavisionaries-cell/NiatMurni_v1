<?php

namespace App\Services;

use App\Models\ClassSession;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ZoomService
{
    protected ?string $accessToken = null;

    public function getAccessToken(): ?string
    {
        if ($this->accessToken !== null) {
            return $this->accessToken;
        }
        $accountId = config('zoom.account_id');
        $clientId = config('zoom.client_id');
        $clientSecret = config('zoom.client_secret');
        if (empty($accountId) || empty($clientId) || empty($clientSecret)) {
            return null;
        }
        $response = Http::withHeaders([
            'Authorization' => 'Basic ' . base64_encode($clientId . ':' . $clientSecret),
            'Content-Type' => 'application/x-www-form-urlencoded',
        ])->asForm()->post('https://zoom.us/oauth/token', [
            'grant_type' => 'account_credentials',
            'account_id' => $accountId,
        ]);
        if (! $response->successful()) {
            Log::warning('Zoom OAuth failed', ['body' => $response->body()]);
            return null;
        }
        $this->accessToken = $response->json('access_token');
        return $this->accessToken;
    }

    /**
     * Create a Zoom meeting for the class session. Returns [meeting_id, join_url] or null on failure.
     */
    public function createMeeting(ClassSession $session): ?array
    {
        $token = $this->getAccessToken();
        if (! $token) {
            return null;
        }
        $programName = $session->program?->name ?? 'Class';
        $start = $session->starts_at;
        $end = $session->ends_at;
        $durationMinutes = max(30, (int) round(($end->getTimestamp() - $start->getTimestamp()) / 60));

        $response = Http::withToken($token)
            ->post('https://api.zoom.us/v2/users/me/meetings', [
                'topic' => $programName . ' - ' . $start->format('Y-m-d H:i'),
                'type' => 2,
                'start_time' => $start->format('Y-m-d\TH:i:s'),
                'duration' => $durationMinutes,
                'timezone' => config('app.timezone', 'Asia/Kuala_Lumpur'),
                'settings' => [
                    'join_before_host' => true,
                    'approval_type' => 0,
                ],
            ]);
        if (! $response->successful()) {
            Log::warning('Zoom create meeting failed', ['body' => $response->body()]);
            return null;
        }
        $data = $response->json();
        return [
            'meeting_id' => (string) ($data['id'] ?? ''),
            'join_url' => $data['join_url'] ?? '',
        ];
    }

    /**
     * Update an existing Zoom meeting.
     */
    public function updateMeeting(string $meetingId, ClassSession $session): ?array
    {
        $token = $this->getAccessToken();
        if (! $token) {
            return null;
        }
        $programName = $session->program?->name ?? 'Class';
        $start = $session->starts_at;
        $end = $session->ends_at;
        $durationMinutes = max(30, (int) round(($end->getTimestamp() - $start->getTimestamp()) / 60));

        $response = Http::withToken($token)
            ->patch('https://api.zoom.us/v2/meetings/' . $meetingId, [
                'topic' => $programName . ' - ' . $start->format('Y-m-d H:i'),
                'type' => 2,
                'start_time' => $start->format('Y-m-d\TH:i:s'),
                'duration' => $durationMinutes,
            ]);
        if (! $response->successful()) {
            Log::warning('Zoom update meeting failed', ['body' => $response->body()]);
            return null;
        }
        $data = $response->json();
        return [
            'meeting_id' => (string) ($data['id'] ?? $meetingId),
            'join_url' => $data['join_url'] ?? '',
        ];
    }

    /**
     * Regenerate join URL by fetching meeting details (or create if missing).
     */
    public function getOrCreateMeetingLink(ClassSession $session): ?array
    {
        if ($session->zoom_meeting_id) {
            $token = $this->getAccessToken();
            if (! $token) {
                return null;
            }
            $response = Http::withToken($token)->get('https://api.zoom.us/v2/meetings/' . $session->zoom_meeting_id);
            if ($response->successful()) {
                $data = $response->json();
                return [
                    'meeting_id' => (string) ($data['id'] ?? $session->zoom_meeting_id),
                    'join_url' => $data['join_url'] ?? $session->zoom_join_url,
                ];
            }
        }
        return $this->createMeeting($session);
    }

    /**
     * Get participant report for a meeting (join/leave times, duration). Requires meeting to have ended or use report API.
     */
    public function getMeetingParticipantReport(string $meetingId): ?array
    {
        $token = $this->getAccessToken();
        if (! $token) {
            return null;
        }
        $response = Http::withToken($token)
            ->get('https://api.zoom.us/v2/report/meetings/' . $meetingId . '/participants', [
                'page_size' => 300,
            ]);
        if (! $response->successful()) {
            Log::warning('Zoom participant report failed', ['body' => $response->body()]);
            return null;
        }
        return $response->json('participants', []);
    }
}
