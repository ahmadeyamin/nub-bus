<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BusStatusController extends Controller
{
    public function index(Request $request)
    {
        $bus = Bus::where('driver_id', $request->user()->id)
            ->with(['busRoute.stops' => function ($q) {
                $q->orderBy('order_index');
            }])
            ->first();

        $stats = null;

        if ($bus) {
            $stats = [
                'trip_status' => $bus->trip_status,
                'trips_completed' => $bus->trips_completed,
                'stops_reached_this_trip' => $bus->stops_reached_this_trip,
                'trip_duration_minutes' => $bus->tripDurationMinutes(),
                'total_stops' => $bus->busRoute ? $bus->busRoute->stops->count() : 0,
                'trip_started_at' => $bus->trip_started_at?->toISOString(),
            ];
        }

        return Inertia::render('Driver/Dashboard', [
            'bus' => $bus,
            'stats' => $stats,
        ]);
    }

    public function startTrip(Request $request, Bus $bus)
    {
        abort_if($bus->driver_id !== $request->user()->id, 403);
        abort_if(! $bus->is_active, 403, 'Bus is not active.');

        $firstStop = $bus->busRoute->stops()->orderBy('order_index')->first();

        abort_if(! $firstStop, 422, 'This route has no stops.');

        $bus->update([
            'trip_status' => 'on_trip',
            'trip_started_at' => now(),
            'stops_reached_this_trip' => 1,
            'current_stop_id' => $firstStop->id,
            'status' => 'reached_stop',
        ]);

        return back();
    }

    public function endTrip(Request $request, Bus $bus)
    {
        abort_if($bus->driver_id !== $request->user()->id, 403);

        $bus->update([
            'trip_status' => 'idle',
            'trip_started_at' => null,
            'stops_reached_this_trip' => 0,
            'current_stop_id' => null,
            'status' => 'reached_stop',
            'trips_completed' => $bus->trips_completed + 1,
        ]);

        return back();
    }

    public function update(Request $request, Bus $bus)
    {
        abort_if($bus->driver_id !== $request->user()->id, 403);

        $request->validate([
            'current_stop_id' => 'required|exists:stops,id',
            'status' => 'required|in:running,reached_stop',
        ]);

        $stopsReached = $bus->stops_reached_this_trip;

        // When driver marks a stop as reached, increment counter
        if ($request->status === 'reached_stop') {
            $stopsReached++;
        }

        $bus->update([
            'current_stop_id' => $request->current_stop_id,
            'status' => $request->status,
            'stops_reached_this_trip' => $stopsReached,
        ]);

        return back();
    }
}
