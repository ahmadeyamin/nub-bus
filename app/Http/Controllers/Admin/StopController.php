<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Stop;
use Illuminate\Http\Request;

class StopController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'bus_route_id' => 'required|exists:bus_routes,id',
            'name' => 'required|string|max:255',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'order_index' => 'required|integer',
            'minutes_from_previous' => 'required|integer|min:0',
        ]);

        Stop::create($request->all());

        return back();
    }

    public function update(Request $request, Stop $stop)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'latitude' => 'sometimes|required|numeric',
            'longitude' => 'sometimes|required|numeric',
            'order_index' => 'sometimes|required|integer',
            'minutes_from_previous' => 'sometimes|required|integer|min:0',
        ]);

        $stop->update($request->only([
            'name',
            'latitude',
            'longitude',
            'order_index',
            'minutes_from_previous',
        ]));

        return back();
    }

    public function destroy(Stop $stop)
    {
        $stop->delete();

        return back();
    }
}
