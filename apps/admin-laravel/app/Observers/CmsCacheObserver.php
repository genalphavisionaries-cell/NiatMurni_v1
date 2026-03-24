<?php

namespace App\Observers;

use App\Services\CmsService;

class CmsCacheObserver
{
    public function __construct(
        private readonly CmsService $cms
    ) {}

    public function saved(): void
    {
        $this->cms->forgetCache();
    }

    public function deleted(): void
    {
        $this->cms->forgetCache();
    }
}
