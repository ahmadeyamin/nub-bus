<?php

namespace App\Models;

use Database\Factories\BusFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bus extends Model
{
    /** @use HasFactory<BusFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'bus_route_id',
        'driver_id',
        'current_stop_id',
        'status',
        'is_active',
        'trip_status',
        'trip_started_at',
        'trips_completed',
        'stops_reached_this_trip',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'trip_started_at' => 'datetime',
            'trips_completed' => 'integer',
            'stops_reached_this_trip' => 'integer',
        ];
    }

    public function busRoute(): BelongsTo
    {
        return $this->belongsTo(BusRoute::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function currentStop(): BelongsTo
    {
        return $this->belongsTo(Stop::class, 'current_stop_id');
    }

    /** Minutes elapsed since trip started, or null if not on trip. */
    public function tripDurationMinutes(): ?int
    {
        if ($this->trip_status !== 'on_trip' || ! $this->trip_started_at) {
            return null;
        }

        return (int) $this->trip_started_at->diffInMinutes(now());
    }
}
