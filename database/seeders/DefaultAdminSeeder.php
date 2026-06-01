<?php

namespace Database\Seeders;

use App\Models\Bus;
use App\Models\BusRoute;
use App\Models\Stop;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DefaultAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $driver = User::factory()->create([
            'name' => 'John Driver',
            'email' => 'driver@example.com',
            'password' => Hash::make('password'),
            'role' => 'driver',
        ]);

        $route = BusRoute::create([
            'name' => 'Campus to City Center',
        ]);

        $stop1 = Stop::create([
            'bus_route_id' => $route->id,
            'name' => 'NUB Main Campus',
            'latitude' => 23.8103,
            'longitude' => 90.4125,
            'order_index' => 1,
            'minutes_from_previous' => 0,
        ]);

        $stop2 = Stop::create([
            'bus_route_id' => $route->id,
            'name' => 'Uttara',
            'latitude' => 23.8759,
            'longitude' => 90.3795,
            'order_index' => 2,
            'minutes_from_previous' => 15,
        ]);

        $stop3 = Stop::create([
            'bus_route_id' => $route->id,
            'name' => 'Banani',
            'latitude' => 23.7940,
            'longitude' => 90.4043,
            'order_index' => 3,
            'minutes_from_previous' => 20,
        ]);

        Bus::create([
            'name' => 'Bus Alpha',
            'bus_route_id' => $route->id,
            'driver_id' => $driver->id,
            'current_stop_id' => $stop1->id,
            'status' => 'reached_stop',
        ]);
    }
}
