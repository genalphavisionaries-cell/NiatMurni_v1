<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Services\CmsService;
use Illuminate\Http\JsonResponse;

class CmsController extends Controller
{
    public function __invoke(CmsService $cms): JsonResponse
    {
        return response()->json([
            'data' => $cms->getHomepage(),
        ]);
    }
}
