<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetAdminPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly string $token)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $base = rtrim((string) config('app.url'), '/');
        $email = urlencode((string) $notifiable->getEmailForPasswordReset());
        $url = "{$base}/admin/password-reset/{$this->token}?email={$email}";

        return (new MailMessage())
            ->subject('Reset Your Admin Password')
            ->line('You requested a password reset for your admin account.')
            ->action('Reset Password', $url)
            ->line('This link will expire in 60 minutes.')
            ->line('If you did not request a password reset, no action is required.');
    }
}
