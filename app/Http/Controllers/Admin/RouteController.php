<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BusRoute;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RouteController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Routes/Index', [
            'routes' => BusRoute::with('stops')->withCount('buses')->get(),
        ]);
    }

    public function show(BusRoute $route)
    {
        return Inertia::render('Admin/Routes/Show', [
            'route' => $route->load('stops'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        BusRoute::create($request->only('name'));

        return back();
    }

    public function destroy(BusRoute $route)
    {
        $route->delete();

        return back();
    }
}
