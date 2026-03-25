<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * @var array<class-string, class-string>
     */
    protected $policies = [
        \App\Models\User::class => \App\Policies\UserPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        Gate::before(function ($user, $ability) {
            logger()->info('Gate::before invoked', [
                'path' => request()->path(),
                'ability' => is_string($ability) ? $ability : gettype($ability),
                'user_id' => $user?->id,
                'admin_role' => $user?->admin_role,
                'role' => $user?->role,
            ]);
            return true;
        });
    }
}
