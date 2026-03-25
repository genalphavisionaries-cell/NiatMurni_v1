<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogAdminPanelAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        logger()->info('AdminPanel request auth state', [
            'path' => $request->path(),
            'auth_check' => auth()->check(),
            'user_id' => $user?->id,
            'admin_role' => $user?->admin_role,
            'role' => $user?->role,
            'is_active' => $user?->is_active,
        ]);

        $response = $next($request);

        if ($response->getStatusCode() === 403) {
            logger()->warning('AdminPanel request blocked with 403', [
                'path' => $request->path(),
                'user_id' => $user?->id,
                'admin_role' => $user?->admin_role,
                'role' => $user?->role,
            ]);
        }

        return $response;
    }
}

