<?php

namespace Database\Seeders;

use App\Models\BusRoute;
use App\Models\Stop;
use Illuminate\Database\Seeder;

class PaltanToAirportRouteSeeder extends Seeder
{
    public function run(): void
    {
        $route = BusRoute::firstOrCreate(
            ['name' => 'Paltan to Airport'],
        );

        $route->stops()->delete();

        $stops = [
            ['name' => 'Paltan', 'latitude' => 23.7330, 'longitude' => 90.4110, 'minutes_from_previous' => 0],
            ['name' => 'Moghbazar', 'latitude' => 23.7480, 'longitude' => 90.4060, 'minutes_from_previous' => 8],
            ['name' => 'Nabisco', 'latitude' => 23.7660, 'longitude' => 90.4010, 'minutes_from_previous' => 8],
            ['name' => 'Mohakhali', 'latitude' => 23.7780, 'longitude' => 90.4020, 'minutes_from_previous' => 5],
            ['name' => 'Banani', 'latitude' => 23.7940, 'longitude' => 90.4040, 'minutes_from_previous' => 5],
            ['name' => 'Kurmitola', 'latitude' => 23.8140, 'longitude' => 90.4040, 'minutes_from_previous' => 8],
            ['name' => 'Khilkhet', 'latitude' => 23.8311, 'longitude' => 90.4243, 'minutes_from_previous' => 6],
            ['name' => 'Airport', 'latitude' => 23.8427, 'longitude' => 90.4005, 'minutes_from_previous' => 6],
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
