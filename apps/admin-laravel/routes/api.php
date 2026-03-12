<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/homepage-settings', App\Http\Controllers\Api\HomepageSettingsController::class)->name('api.homepage-settings');
Route::post('/register', App\Http\Controllers\Api\RegisterForClassController::class)->name('api.register');

// Admin API auth (Sanctum token in HttpOnly cookie)
Route::post('/admin/login', [App\Http\Controllers\Api\AdminAuthController::class, 'login'])->name('api.admin.login');
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/admin/logout', [App\Http\Controllers\Api\AdminAuthController::class, 'logout'])->name('api.admin.logout');
    Route::get('/admin/me', [App\Http\Controllers\Api\AdminAuthController::class, 'me'])->name('api.admin.me');
});
