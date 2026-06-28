<?php

namespace Database\Seeders;

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
        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@app.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);
        $driver = User::factory()->create([
            'name' => 'John Driver',
            'email' => 'driver@app.com',
            'password' => Hash::make('password'),
            'role' => 'driver',
        ]);

    }
}
