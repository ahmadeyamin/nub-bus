<?php

namespace App\Http\Controllers;

use App\Models\Bus;
use App\Models\BusRoute;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            return $this->adminDashboard();
        }

        if ($user->role === 'driver') {
            return $this->driverDashboard($user);
        }

        // Student / default
        return $this->studentDashboard();
    }

    private function adminDashboard()
    {
        $totalRoutes = BusRoute::count();
        $totalBuses = Bus::count();
        $activeBuses = Bus::where('is_active', true)->count();
        $totalDrivers = User::where('role', 'driver')->count();
        $busesOnTrip = Bus::where('trip_status', 'on_trip')->count();
        $tripsCompletedToday = Bus::sum('trips_completed');

        $recentBuses = Bus::with(['busRoute', 'driver', 'currentStop'])
            ->where('is_active', true)
            ->latest('updated_at')
            ->take(6)
            ->get()
            ->map(fn ($bus) => [
                'id' => $bus->id,
                'name' => $bus->name,
                'route' => $bus->busRoute?->name,
                'driver' => $bus->driver?->name,
                'status' => $bus->status,
                'trip_status' => $bus->trip_status,
                'is_active' => $bus->is_active,
                'current_stop' => $bus->currentStop?->name,
            ]);

        return Inertia::render('dashboard', [
            'stats' => [
                'total_routes' => $totalRoutes,
                'total_buses' => $totalBuses,
                'active_buses' => $activeBuses,
                'total_drivers' => $totalDrivers,
                'buses_on_trip' => $busesOnTrip,
                'trips_completed_today' => $tripsCompletedToday,
            ],
            'recent_buses' => $recentBuses,
        ]);
    }

    private function driverDashboard(User $user)
    {
        $bus = Bus::where('driver_id', $user->id)
            ->with(['busRoute.stops' => fn ($q) => $q->orderBy('order_index'), 'currentStop'])
            ->first();

        $stats = null;

        if ($bus) {
            $stops = $bus->busRoute?->stops ?? collect();
            $currentStopIndex = $stops->search(fn ($s) => $s->id === $bus->current_stop_id);

            $stopsRemaining = $currentStopIndex !== false
                ? max(0, $stops->count() - $currentStopIndex - ($bus->status === 'reached_stop' ? 1 : 0))
                : 0;

            $stats = [
                'bus_name' => $bus->name,
                'route_name' => $bus->busRoute?->name,
                'trip_status' => $bus->trip_status,
                'trips_completed' => $bus->trips_completed,
                'stops_reached_this_trip' => $bus->stops_reached_this_trip,
                'total_stops' => $stops->count(),
                'stops_remaining' => $stopsRemaining,
                'trip_duration_minutes' => $bus->tripDurationMinutes(),
                'trip_started_at' => $bus->trip_started_at?->toISOString(),
                'current_stop' => $bus->currentStop?->name,
                'status' => $bus->status,
                'is_active' => $bus->is_active,
                'bus_id' => $bus->id,
            ];
        }

        return Inertia::render('dashboard', [
            'driver_stats' => $stats,
        ]);
    }

    private function studentDashboard()
    {
        $totalRoutes = BusRoute::count();
        $activeBuses = Bus::where('is_active', true)->where('trip_status', 'on_trip')->count();

        return Inertia::render('dashboard', [
            'student_stats' => [
                'total_routes' => $totalRoutes,
                'active_buses' => $activeBuses,
            ],
        ]);
    }
}
