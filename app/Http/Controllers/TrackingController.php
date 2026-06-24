<?php

namespace App\Http\Controllers;

use App\Models\Bus;
use App\Models\BusRoute;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TrackingController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Student/Dashboard');
    }

    public function live(Request $request)
    {
        $routes = BusRoute::with(['stops' => function ($q) {
            $q->orderBy('order_index');
        }])->get();

        $buses = Bus::with(['currentStop', 'driver', 'busRoute.stops'])->get();

        return Inertia::render('Student/Tracking', [
            'routes' => $routes,
            'buses' => $buses,
        ]);
    }
}
