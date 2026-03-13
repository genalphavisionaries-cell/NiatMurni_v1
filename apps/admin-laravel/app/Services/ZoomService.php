<?php

namespace App\Services;

use App\Models\AttendanceRecord;
use App\Models\ClassSession;
use Carbon\Carbon;
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

    /**
     * Sync attendance from Zoom participant report into attendance_records (source = zoom).
     * Matches Zoom participants to bookings by participant email; creates or updates one record per booking.
     */
    public function syncAttendanceFromZoom(ClassSession $session): int
    {
        if (! $session->zoom_meeting_id) {
            return 0;
        }
        $participants = $this->getMeetingParticipantReport($session->zoom_meeting_id);
        if (! is_array($participants) || count($participants) === 0) {
            return 0;
        }
        $count = 0;
        foreach ($session->bookings as $booking) {
            $participant = $booking->participant;
            $email = $participant->email ?? null;
            $durationSeconds = null;
            $joinTime = null;
            $leaveTime = null;
            foreach ($participants as $p) {
                $zoomEmail = $p['user_email'] ?? $p['email'] ?? null;
                if ($zoomEmail && strcasecmp($zoomEmail, $email) === 0) {
                    $durationSeconds = (int) ($p['duration'] ?? 0);
                    $joinTime = isset($p['join_time']) ? Carbon::parse($p['join_time']) : null;
                    $leaveTime = isset($p['leave_time']) ? Carbon::parse($p['leave_time']) : null;
                    break;
                }
            }
            if ($durationSeconds === null && count($participants) > 0) {
                continue;
            }
            $record = $booking->attendanceRecords()->where('source', 'zoom')->first();
            if ($record) {
                $record->update([
                    'duration_seconds' => $durationSeconds ?? $record->duration_seconds,
                    'check_in_at' => $joinTime ?? $record->check_in_at,
                    'check_out_at' => $leaveTime ?? $record->check_out_at,
                    'attendance_duration_minutes' => $durationSeconds !== null ? (int) round($durationSeconds / 60) : $record->attendance_duration_minutes,
                ]);
            } else {
                $booking->attendanceRecords()->create([
                    'check_in_at' => $joinTime,
                    'check_out_at' => $leaveTime,
                    'duration_seconds' => $durationSeconds ?? 0,
                    'attendance_duration_minutes' => $durationSeconds !== null ? (int) round($durationSeconds / 60) : null,
                    'source' => 'zoom',
                ]);
            }
            $count++;
        }
        return $count;
    }
}
