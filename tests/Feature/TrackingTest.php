<?php

use App\Models\Bus;
use App\Models\BusRoute;
use App\Models\Stop;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('anyone can visit the tracking page and see buses with routes and stops', function () {
    $route = BusRoute::create(['name' => 'Shyamoli to Airport']);
    $stop = Stop::create([
        'bus_route_id' => $route->id,
        'name' => 'Shyamoli',
        'latitude' => 23.77490,
        'longitude' => 90.36560,
        'order_index' => 1,
    ]);

    $driver = User::factory()->create(['role' => 'driver']);

    $bus = Bus::create([
        'name' => 'Campus Bus 1',
        'bus_route_id' => $route->id,
        'driver_id' => $driver->id,
        'current_stop_id' => $stop->id,
        'is_active' => true,
        'trip_status' => 'on_trip',
        'stops_reached_this_trip' => 1,
    ]);

    $response = $this->get(route('tracking'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Student/Tracking')
        ->has('routes', 1)
        ->has('buses', 1, fn (Assert $busAssert) => $busAssert
            ->where('id', $bus->id)
            ->where('bus_route.id', $route->id)
            ->has('bus_route.stops', 1)
            ->etc()
        )
    );
});
