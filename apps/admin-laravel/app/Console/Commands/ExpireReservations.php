<?php

namespace App\Console\Commands;

use App\Services\ReservationService;
use Illuminate\Console\Command;

class ExpireReservations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reservations:expire';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Expire seat reservations that have passed their expiry time';

    public function __construct(protected ReservationService $reservationService)
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $count = $this->reservationService->expireReservations();

        $this->info(\"Expired {$count} reservations\");

        return self::SUCCESS;
    }
}

