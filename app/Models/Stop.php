<?php

namespace App\Models;

use Database\Factories\StopFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Stop extends Model
{
    /** @use HasFactory<StopFactory> */
    use HasFactory;

    protected $fillable = [
        'bus_route_id',
        'name',
        'latitude',
        'longitude',
        'order_index',
        'minutes_from_previous',
    ];

    public function busRoute(): BelongsTo
    {
        return $this->belongsTo(BusRoute::class);
    }
}
