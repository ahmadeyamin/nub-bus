<?php

namespace Database\Seeders;

use App\Models\BusRoute;
use App\Models\Stop;
use Illuminate\Database\Seeder;

class KonabariToAirportRouteSeeder extends Seeder
{
    public function run(): void
    {
        $route = BusRoute::firstOrCreate(
            ['name' => 'Konabari to Airport'],
        );

        $route->stops()->delete();

        $stops = [
            ['name' => 'Konabari', 'latitude' => 24.0166, 'longitude' => 90.3264, 'minutes_from_previous' => 0],
            ['name' => 'Bypass', 'latitude' => 23.9930, 'longitude' => 90.3580, 'minutes_from_previous' => 5],
            ['name' => 'Board Bazar', 'latitude' => 23.9452, 'longitude' => 90.3825, 'minutes_from_previous' => 10],
            ['name' => 'College Gate', 'latitude' => 23.9086, 'longitude' => 90.3980, 'minutes_from_previous' => 8],
            ['name' => 'Station Road', 'latitude' => 23.8986, 'longitude' => 90.4085, 'minutes_from_previous' => 5],
            ['name' => 'Abdullahpur', 'latitude' => 23.8760, 'longitude' => 90.3990, 'minutes_from_previous' => 5],
            ['name' => 'Uttara', 'latitude' => 23.8660, 'longitude' => 90.3980, 'minutes_from_previous' => 5],
            ['name' => 'Airport', 'latitude' => 23.8427, 'longitude' => 90.4005, 'minutes_from_previous' => 10],
        ];

        foreach ($stops as $index => $stop) {
            Stop::create([
                'bus_route_id' => $route->id,
                'name' => $stop['name'],
                'latitude' => $stop['latitude'],
                'longitude' => $stop['longitude'],
                'order_index' => $index + 1,
                'minutes_from_previous' => $stop['minutes_from_previous'],
            ]);
        }
    }
}
