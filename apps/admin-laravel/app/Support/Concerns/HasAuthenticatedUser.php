<?php

namespace App\Support\Concerns;

use App\Models\User;

trait HasAuthenticatedUser
{
    public function getAuthenticatedUser(): ?User
    {
        /** @var User|null $user */
        $user = auth()->user();

        return $user;
    }
}

