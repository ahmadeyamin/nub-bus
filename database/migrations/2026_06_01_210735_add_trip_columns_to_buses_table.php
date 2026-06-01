<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('buses', function (Blueprint $table) {
            $table->string('trip_status')->default('idle')->after('is_active'); // idle | on_trip | completed
            $table->timestamp('trip_started_at')->nullable()->after('trip_status');
            $table->unsignedInteger('trips_completed')->default(0)->after('trip_started_at');
            $table->unsignedInteger('stops_reached_this_trip')->default(0)->after('trips_completed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buses', function (Blueprint $table) {
            $table->dropColumn(['trip_status', 'trip_started_at', 'trips_completed', 'stops_reached_this_trip']);
        });
    }
};
