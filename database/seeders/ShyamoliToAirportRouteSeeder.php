<?php

namespace Database\Seeders;

use App\Models\BusRoute;
use App\Models\Stop;
use Illuminate\Database\Seeder;

class ShyamoliToAirportRouteSeeder extends Seeder
{
    /**
     * Seed the Shyamoli → Airport bus route with real GPS coordinates.
     *
     * Coordinates sourced from OpenStreetMap / Google Maps for
     * well-known intersections and landmarks in Dhaka.
     */
    public function run(): void
    {
        /** @var BusRoute $route */
        $route = BusRoute::firstOrCreate(
            ['name' => 'Shyamoli to Airport'],
        );

        // Remove any existing stops so re-running is idempotent.
        $route->stops()->delete();

        /**
         * @var array<int, array{name: string, latitude: float, longitude: float, minutes_from_previous: int}> $stops
         */
        $stops = [
            [
                'name'                   => 'Shyamoli',
                'latitude'               => 23.77490,
                'longitude'              => 90.36560,
                'minutes_from_previous'  => 0,
            ],
            [
                'name'                   => 'Mirpur-1',
                'latitude'               => 23.79972,
                'longitude'              => 90.35445,
                'minutes_from_previous'  => 6,
            ],
            [
                'name'                   => 'Commerce College',
                'latitude'               => 23.80640,
                'longitude'              => 90.35220,
                'minutes_from_previous'  => 4,
            ],
            [
                'name'                   => 'Mirpur-6',
                'latitude'               => 23.81046,
                'longitude'              => 90.36465,
                'minutes_from_previous'  => 4,
            ],
            [
                'name'                   => 'Mirpur-10',
                'latitude'               => 23.80690,
                'longitude'              => 90.36840,
                'minutes_from_previous'  => 6,
            ],
            [
                'name'                   => 'Mirpur-12',
                'latitude'               => 23.82530,
                'longitude'              => 90.37000,
                'minutes_from_previous'  => 5,
            ],
            [
                'name'                   => 'Kalshi',
                'latitude'               => 23.82670,
                'longitude'              => 90.37900,
                'minutes_from_previous'  => 4,
            ],
            [
                'name'                   => 'ECB Chattar',
                'latitude'               => 23.82100,
                'longitude'              => 90.38500,
                'minutes_from_previous'  => 5,
            ],
            [
                'name'                   => 'Kuril',
                'latitude'               => 23.81973,
                'longitude'              => 90.42364,
                'minutes_from_previous'  => 10,
            ],
            [
                'name'                   => 'Khilkhet',
                'latitude'               => 23.83113,
                'longitude'              => 90.42431,
                'minutes_from_previous'  => 5,
            ],
            [
                'name'                   => 'Airport 3',
                'latitude'               => 23.84278,
                'longitude'              => 90.40056,
                'minutes_from_previous'  => 8,
            ],
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

        $this->command->info('✅ Shyamoli to Airport route seeded with '.count($stops).' stops.');
    }
}
