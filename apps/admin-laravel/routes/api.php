<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/homepage-settings', App\Http\Controllers\Api\HomepageSettingsController::class)->name('api.homepage-settings');
Route::post('/register', App\Http\Controllers\Api\RegisterForClassController::class)->name('api.register');
