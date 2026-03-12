<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Api\AdminAuthController;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanctumTokenFromCookie
{
    /**
     * If no Bearer token in Authorization header, try reading from admin_token cookie
     * so Sanctum can authenticate API requests from the Next.js admin.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->bearerToken() && $request->cookie(AdminAuthController::COOKIE_NAME)) {
            $request->headers->set(
                'Authorization',
                'Bearer ' . $request->cookie(AdminAuthController::COOKIE_NAME)
            );
        }
        return $next($request);
    }
}
