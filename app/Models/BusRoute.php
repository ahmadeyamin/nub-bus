<?php

namespace App\Models;

use Database\Factories\BusRouteFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BusRoute extends Model
{
    /** @use HasFactory<BusRouteFactory> */
    use HasFactory;

    protected $fillable = ['name'];

    public function stops(): HasMany
    {
        return $this->hasMany(Stop::class)->orderBy('order_index');
    }

    public function buses(): HasMany
    {
        return $this->hasMany(Bus::class);
    }
}
