<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class DriverController extends Controller
{
    public function index()
    {
        $drivers = User::where('role', 'driver')
            ->with(['bus' => fn ($q) => $q->with('busRoute')])
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'name' => $d->name,
                'email' => $d->email,
                'bus' => $d->bus ? [
                    'id' => $d->bus->id,
                    'name' => $d->bus->name,
                    'is_active' => $d->bus->is_active,
                    'trip_status' => $d->bus->trip_status,
                    'trips_completed' => $d->bus->trips_completed,
                    'route' => $d->bus->busRoute?->name,
                ] : null,
            ]);

        return Inertia::render('Admin/Drivers/Index', ['drivers' => $drivers]);
    }

    public function show(User $driver)
    {
        $driver->load(['bus' => fn ($q) => $q->with(['busRoute.stops' => fn ($q) => $q->orderBy('order_index'), 'currentStop'])]);

        $bus = $driver->bus;

        return Inertia::render('Admin/Drivers/Show', [
            'driver' => [
                'id' => $driver->id,
                'name' => $driver->name,
                'email' => $driver->email,
            ],
            'bus' => $bus ? [
                'id' => $bus->id,
                'name' => $bus->name,
                'is_active' => $bus->is_active,
                'status' => $bus->status,
                'trip_status' => $bus->trip_status,
                'trips_completed' => $bus->trips_completed,
                'stops_reached_this_trip' => $bus->stops_reached_this_trip,
                'trip_started_at' => $bus->trip_started_at?->toISOString(),
                'trip_duration_minutes' => $bus->tripDurationMinutes(),
                'current_stop' => $bus->currentStop?->name,
                'route' => [
                    'name' => $bus->busRoute?->name,
                    'total_stops' => $bus->busRoute?->stops->count() ?? 0,
                ],
            ] : null,
        ]);
    }

    public function update(Request $request, User $driver)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$driver->id,
            'password' => 'nullable|string|min:8',
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $driver->update($data);

        return back()->with('success', 'Driver updated successfully.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'driver',
        ]);

        return back();
    }
}
