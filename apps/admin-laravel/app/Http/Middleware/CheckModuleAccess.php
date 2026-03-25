<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckModuleAccess
{
    public function handle(Request $request, Closure $next, string $modules = ''): Response
    {
        /** @var User|null $user */
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // TEMPORARY (project-wide unblock):
        // Allow any active user to access all modules in the admin panel.
        if ((bool) $user->is_active) {
            return $next($request);
        }

        if ($modules === '') {
            return $next($request);
        }

        $role = (string) ($user->admin_role ?: $user->role);
        if (in_array($role, ['super_admin'], true) || in_array((string) $user->role, ['super_admin'], true)) {
            return $next($request);
        }

        $required = array_filter(array_map('trim', explode(',', $modules)));
        $allowed = $this->resolveAllowedModules($user);

        if ($required === [] || array_intersect($required, $allowed) !== []) {
            return $next($request);
        }

        return response()->json([
            'message' => 'Forbidden: No access to this module',
        ], 403);
    }

    /**
     * @return string[]
     */
    private function resolveAllowedModules(User $user): array
    {
        $modules = [];

        if (is_array($user->module_access)) {
            $modules = array_merge($modules, $user->module_access);
        }

        $dbModules = $user->relationLoaded('userModules')
            ? $user->userModules->pluck('module_key')->all()
            : $user->userModules()->pluck('module_key')->all();

        if ($dbModules !== []) {
            $modules = array_merge($modules, $dbModules);
        }

        if ($modules === []) {
            $modules = $user->resolvedModules();
        }

        return array_values(array_unique(array_filter(array_map('strval', $modules))));
    }
}
