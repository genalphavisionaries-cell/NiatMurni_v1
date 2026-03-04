<?php

namespace App\Filament\Pages\Auth;

use Filament\Forms\Components\Placeholder;
use Filament\Forms\Form;
use Filament\Pages\Auth\Login as BaseLogin;
use Illuminate\Support\HtmlString;

class Login extends BaseLogin
{
    public function form(Form $form): Form
    {
        return $form
            ->schema([
                $this->getEmailFormComponent(),
                $this->getPasswordFormComponent(),
                $this->getRememberFormComponent(),
                Placeholder::make('login_hint')
                    ->label('')
                    ->content(new HtmlString(
                        '<p class="text-sm text-gray-500 dark:text-gray-400 mt-2">'
                        . 'Can\'t log in? Run in your project: <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">php artisan admin:ensure-admin</code>'
                        . '</p>'
                    )),
            ]);
    }
}
