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
            'buses' => Bus::with(['busRoute', 'driver', 'currentStop'])->get(),
            'routes' => BusRoute::all(),
            'drivers' => User::where('role', 'driver')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'bus_route_id' => 'required|exists:bus_routes,id',
            'driver_id' => 'required|exists:users,id',
        ]);

        Bus::create($request->all());

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
