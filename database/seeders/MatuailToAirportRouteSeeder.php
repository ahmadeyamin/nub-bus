<?php

namespace Database\Seeders;

use App\Models\BusRoute;
use App\Models\Stop;
use Illuminate\Database\Seeder;

class MatuailToAirportRouteSeeder extends Seeder
{
    public function run(): void
    {
        $route = BusRoute::firstOrCreate(
            ['name' => 'Matuail to Airport'],
        );

        $route->stops()->delete();

        $stops = [
            ['name' => 'Matuail', 'latitude' => 23.7050, 'longitude' => 90.4490, 'minutes_from_previous' => 0],
            ['name' => 'Shanir Akhra', 'latitude' => 23.7070, 'longitude' => 90.4380, 'minutes_from_previous' => 5],
            ['name' => 'Jatrabari', 'latitude' => 23.7120, 'longitude' => 90.4280, 'minutes_from_previous' => 5],
            ['name' => 'Mugda', 'latitude' => 23.7300, 'longitude' => 90.4260, 'minutes_from_previous' => 5],
            ['name' => 'Basabo', 'latitude' => 23.7380, 'longitude' => 90.4260, 'minutes_from_previous' => 5],
            ['name' => 'Khilgaon', 'latitude' => 23.7500, 'longitude' => 90.4250, 'minutes_from_previous' => 5],
            ['name' => 'Malibagh', 'latitude' => 23.7520, 'longitude' => 90.4150, 'minutes_from_previous' => 5],
            ['name' => 'Rampura', 'latitude' => 23.7630, 'longitude' => 90.4210, 'minutes_from_previous' => 5],
            ['name' => 'Badda', 'latitude' => 23.7800, 'longitude' => 90.4260, 'minutes_from_previous' => 5],
            ['name' => 'Bashundhara', 'latitude' => 23.8110, 'longitude' => 90.4320, 'minutes_from_previous' => 10],
            ['name' => 'Kuril', 'latitude' => 23.8197, 'longitude' => 90.4236, 'minutes_from_previous' => 5],
            ['name' => 'Khilkhet', 'latitude' => 23.8311, 'longitude' => 90.4243, 'minutes_from_previous' => 5],
            ['name' => 'Airport', 'latitude' => 23.8427, 'longitude' => 90.4005, 'minutes_from_previous' => 8],
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
