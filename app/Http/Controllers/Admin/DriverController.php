<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
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
                'avatar_url' => $driver->avatar_url,
                'nid_number' => $driver->nid_number,
                'phone' => $driver->phone,
                'profile_locked' => $driver->profile_locked,
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
            'avatar' => 'nullable|image|max:2048',
            'nid_number' => 'nullable|string|max:30',
            'phone' => 'nullable|string|max:20',
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if present
            if ($driver->avatar) {
                Storage::disk('public')->delete($driver->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        // Profile identity fields — lock after saving
        if ($request->has('nid_number') || $request->has('phone')) {
            $data['nid_number'] = $request->nid_number;
            $data['phone'] = $request->phone;
            $data['profile_locked'] = true;
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
