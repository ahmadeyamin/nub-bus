<?php

use App\Http\Controllers\Admin\BusController;
use App\Http\Controllers\Admin\DriverController;
use App\Http\Controllers\Admin\RouteController;
use App\Http\Controllers\Admin\StopController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Driver\BusStatusController;
use App\Http\Controllers\TrackingController;
use Illuminate\Support\Facades\Route;

Route::get('/', [TrackingController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // Admin Routes
    Route::middleware('can:admin')->prefix('admin')->name('admin.')->group(function () {
        // Routes
        Route::get('routes', [RouteController::class, 'index'])->name('routes.index');
        Route::post('routes', [RouteController::class, 'store'])->name('routes.store');
        Route::get('routes/{route}', [RouteController::class, 'show'])->name('routes.show');
        Route::delete('routes/{route}', [RouteController::class, 'destroy'])->name('routes.destroy');

        // Stops
        Route::post('stops', [StopController::class, 'store'])->name('stops.store');
        Route::put('stops/{stop}', [StopController::class, 'update'])->name('stops.update');
        Route::delete('stops/{stop}', [StopController::class, 'destroy'])->name('stops.destroy');

        // Buses
        Route::get('buses', [BusController::class, 'index'])->name('buses.index');
        Route::post('buses', [BusController::class, 'store'])->name('buses.store');
        Route::get('buses/{bus}', [BusController::class, 'show'])->name('buses.show');
        Route::put('buses/{bus}', [BusController::class, 'update'])->name('buses.update');
        Route::delete('buses/{bus}', [BusController::class, 'destroy'])->name('buses.destroy');
        Route::post('buses/{bus}/toggle-active', [BusController::class, 'toggleActive'])->name('buses.toggle-active');

        // Drivers
        Route::get('drivers', [DriverController::class, 'index'])->name('drivers.index');
        Route::post('drivers', [DriverController::class, 'store'])->name('drivers.store');
        Route::get('drivers/{driver}', [DriverController::class, 'show'])->name('drivers.show');
        Route::put('drivers/{driver}', [DriverController::class, 'update'])->name('drivers.update');
    });

    // Driver Routes
    Route::middleware('can:driver')->prefix('driver')->name('driver.')->group(function () {
        Route::get('status', [BusStatusController::class, 'index'])->name('status.index');
        Route::post('status/{bus}', [BusStatusController::class, 'update'])->name('status.update');
        Route::post('status/{bus}/start-trip', [BusStatusController::class, 'startTrip'])->name('status.start-trip');
        Route::post('status/{bus}/end-trip', [BusStatusController::class, 'endTrip'])->name('status.end-trip');
    });
});

require __DIR__.'/settings.php';
