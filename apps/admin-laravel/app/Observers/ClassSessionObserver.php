<?php

namespace App\Observers;

use App\Models\ClassSession;
use App\Services\ZoomService;

class ClassSessionObserver
{
    public function __construct(
        protected ZoomService $zoom
    ) {}

    public function created(ClassSession $session): void
    {
        $this->syncZoomIfOnline($session);
    }

    public function updated(ClassSession $session): void
    {
        $this->syncZoomIfOnline($session);
    }

    protected function syncZoomIfOnline(ClassSession $session): void
    {
        if ($session->mode !== 'online') {
            return;
        }
        if ($session->zoom_meeting_id) {
            $result = $this->zoom->updateMeeting($session->zoom_meeting_id, $session);
        } else {
            $result = $this->zoom->createMeeting($session);
        }
        if ($result) {
            $session->updateQuietly([
                'zoom_meeting_id' => $result['meeting_id'],
                'zoom_join_url' => $result['join_url'],
            ]);
        }
    }
}
