<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Services\PublicCmsPayloadService;
use Illuminate\Http\JsonResponse;

/**
 * Public site CMS: full {@see PublicCmsPayload} for Next.js
 * (site, navigation, homepage_sections, …), mapped from relational CMS.
 */
class CmsController extends Controller
{
    public function __invoke(PublicCmsPayloadService $payload): JsonResponse
    {
        return response()
            ->json($payload->build())
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }
}
