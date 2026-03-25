<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        logger()->info('UserPolicy@viewAny called', ['user_id' => $user->id]);
        return true;
    }

    public function view(User $user): bool
    {
        logger()->info('UserPolicy@view called', ['user_id' => $user->id]);
        return true;
    }

    public function create(User $user): bool
    {
        logger()->info('UserPolicy@create called', ['user_id' => $user->id]);
        return true;
    }

    public function update(User $user): bool
    {
        logger()->info('UserPolicy@update called', ['user_id' => $user->id]);
        return true;
    }

    public function delete(User $user): bool
    {
        logger()->info('UserPolicy@delete called', ['user_id' => $user->id]);
        return true;
    }
}
