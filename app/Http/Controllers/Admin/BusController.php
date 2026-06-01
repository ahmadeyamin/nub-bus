<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use App\Models\BusRoute;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BusController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Buses/Index', [
            'buses' => Bus::with(['busRoute', 'driver', 'currentStop'])
                ->get()
                ->map(fn ($bus) => [
                    'id' => $bus->id,
                    'name' => $bus->name,
                    'status' => $bus->status,
                    'trip_status' => $bus->trip_status,
                    'is_active' => $bus->is_active,
                    'trips_completed' => $bus->trips_completed,
                    'bus_route' => $bus->busRoute ? ['id' => $bus->busRoute->id, 'name' => $bus->busRoute->name] : null,
                    'driver' => $bus->driver ? ['id' => $bus->driver->id, 'name' => $bus->driver->name] : null,
                    'current_stop' => $bus->currentStop ? ['name' => $bus->currentStop->name] : null,
                ]),
            'routes' => BusRoute::all(['id', 'name']),
            'drivers' => User::where('role', 'driver')->get(['id', 'name', 'email']),
        ]);
    }

    public function show(Bus $bus)
    {
        $bus->load([
            'busRoute.stops' => fn ($q) => $q->orderBy('order_index'),
            'driver',
            'currentStop',
        ]);

        $routes = BusRoute::all(['id', 'name']);
        $drivers = User::where('role', 'driver')->get(['id', 'name', 'email']);

        $stops = $bus->busRoute?->stops ?? collect();
        $currentStopIndex = $stops->search(fn ($s) => $s->id === $bus->current_stop_id);
        $stopsRemaining = ($currentStopIndex !== false && $bus->trip_status === 'on_trip')
            ? max(0, $stops->count() - $currentStopIndex - ($bus->status === 'reached_stop' ? 1 : 0))
            : 0;

        return Inertia::render('Admin/Buses/Show', [
            'bus' => [
                'id' => $bus->id,
                'name' => $bus->name,
                'status' => $bus->status,
                'trip_status' => $bus->trip_status,
                'is_active' => $bus->is_active,
                'trips_completed' => $bus->trips_completed,
                'stops_reached_this_trip' => $bus->stops_reached_this_trip,
                'trip_started_at' => $bus->trip_started_at?->toISOString(),
                'trip_duration_minutes' => $bus->tripDurationMinutes(),
                'bus_route_id' => $bus->bus_route_id,
                'driver_id' => $bus->driver_id,
                'current_stop' => $bus->currentStop?->name,
                'stops_remaining' => $stopsRemaining,
                'route' => $bus->busRoute ? [
                    'id' => $bus->busRoute->id,
                    'name' => $bus->busRoute->name,
                    'total_stops' => $stops->count(),
                    'stops' => $stops->map(fn ($s) => [
                        'id' => $s->id,
                        'name' => $s->name,
                        'order_index' => $s->order_index,
                    ]),
                ] : null,
                'driver' => $bus->driver ? [
                    'id' => $bus->driver->id,
                    'name' => $bus->driver->name,
                    'email' => $bus->driver->email,
                ] : null,
            ],
            'routes' => $routes,
            'drivers' => $drivers,
        ]);
    }

    public function update(Request $request, Bus $bus)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'bus_route_id' => 'required|exists:bus_routes,id',
            'driver_id' => 'nullable|exists:users,id',
        ]);

        $bus->update($request->only('name', 'bus_route_id', 'driver_id'));

        return back()->with('success', 'Bus updated.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'bus_route_id' => 'required|exists:bus_routes,id',
            'driver_id' => 'nullable|exists:users,id',
        ]);

        Bus::create($request->only('name', 'bus_route_id', 'driver_id'));

        return back();
    }

    public function destroy(Bus $bus)
    {
        $bus->delete();

        return back();
    }

    public function toggleActive(Bus $bus)
    {
        $bus->update(['is_active' => ! $bus->is_active]);

        return back();
    }
}
