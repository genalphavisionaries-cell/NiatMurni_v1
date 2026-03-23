<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckModuleAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var User|null $user */
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $role = (string) ($user->admin_role ?: $user->role);
        $module = $this->resolveModuleFromRequest($request);

        // Unmapped routes are allowed (e.g. /api/admin/me, logout).
        if ($module === null) {
            return $next($request);
        }

        if ($role === 'super_admin') {
            return $next($request);
        }

        if ($role === 'technical_admin') {
            if (in_array($module, ['finance', 'users'], true)) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
            return $next($request);
        }

        if (in_array($role, ['content_admin', 'cms_admin'], true)) {
            $allowed = ['cms', 'homepage', 'blog', 'settings'];
            if (! in_array($module, $allowed, true)) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
            return $next($request);
        }

        if (in_array($role, ['operations_admin', 'finance_admin', 'accountant'], true)) {
            $allowed = $user->userModules()->pluck('module_key')->all();
            if (! in_array($module, $allowed, true)) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
            return $next($request);
        }

        if ($user->hasModuleAccess($module)) {
            return $next($request);
        }

        return response()->json(['message' => 'Forbidden'], 403);
    }

    private function resolveModuleFromRequest(Request $request): ?string
    {
        $path = trim($request->path(), '/');
        if (! str_starts_with($path, 'api/admin/')) {
            return null;
        }

        $mapping = [
            'api/admin/programs' => 'programs',
            'api/admin/class-sessions' => 'classes',
            'api/admin/classes' => 'classes',
            'api/admin/bookings' => 'bookings',
            'api/admin/participants' => 'participants',
            'api/admin/tutors' => 'tutors',
            'api/admin/certificates' => 'certificates',
            'api/admin/finance' => 'finance',
            'api/admin/settings' => 'settings',
            'api/admin/users' => 'users',
            'api/admin/homepage-settings' => 'homepage',
            'api/admin/cms' => 'cms',
            'api/admin/blog' => 'blog',
        ];

        foreach ($mapping as $prefix => $module) {
            if ($path === $prefix || str_starts_with($path, $prefix . '/')) {
                return $module;
            }
        }

        return null;
    }
}
