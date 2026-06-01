import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertTriangle,
    Bus,
    CheckCircle,
    ChevronRight,
    CircleDot,
    Clock,
    Flag,
    MapPin,
    Play,
    RotateCcw,
    TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { update as driverStatusUpdate, startTrip as driverStartTrip, endTrip as driverEndTrip } from '@/routes/driver/status';

interface Stop {
    id: number;
    name: string;
    order_index: number;
    minutes_from_previous: number;
}

interface Route {
    id: number;
    name: string;
    stops: Stop[];
}

interface BusType {
    id: number;
    name: string;
    current_stop_id: number | null;
    status: 'running' | 'reached_stop';
    is_active: boolean;
    bus_route: Route;
}

interface Stats {
    trip_status: 'idle' | 'on_trip' | 'completed';
    trips_completed: number;
    stops_reached_this_trip: number;
    trip_duration_minutes: number | null;
    total_stops: number;
    trip_started_at: string | null;
}

// ── Live elapsed timer ─────────────────────────────────────────────────────
function useLiveTimer(startedAt: string | null, active: boolean): string {
    const [elapsed, setElapsed] = useState('');

    useEffect(() => {
        if (!startedAt || !active) {
            setElapsed('');
            return;
        }
        const tick = () => {
            const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
            const h = Math.floor(diff / 3600);
            const m = Math.floor((diff % 3600) / 60);
            const s = diff % 60;
            setElapsed(
                h > 0
                    ? `${h}h ${String(m).padStart(2, '0')}m`
                    : `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`,
            );
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [startedAt, active]);

    return elapsed;
}

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({
    label,
    value,
    sub,
    icon: Icon,
    color,
}: {
    label: string;
    value: string | number;
    sub?: string;
    icon: React.ElementType;
    color: string;
}) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-start gap-3">
            <div className={`p-2.5 rounded-xl ${color}`}>
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">{label}</div>
                <div className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">{value}</div>
                {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
            </div>
        </div>
    );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function DriverDashboard({ bus, stats }: PageProps<{ bus: BusType | null; stats: Stats | null }>) {
    const [isLoading, setIsLoading] = useState(false);
    const elapsed = useLiveTimer(stats?.trip_started_at ?? null, stats?.trip_status === 'on_trip');

    const post = (url: string, data: Record<string, unknown> = {}) => {
        setIsLoading(true);
        router.post(url, data, { onFinish: () => setIsLoading(false) });
    };

    // ── No bus assigned ──────────────────────────────────────────────────
    if (!bus) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <div className="text-center max-w-sm">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 inline-block mb-4">
                        <Bus className="h-10 w-10 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Bus Assigned</h2>
                    <p className="text-gray-500 text-sm">You haven't been assigned to a bus yet. Please contact the admin.</p>
                </div>
            </div>
        );
    }

    const stops = bus.bus_route.stops;
    const currentStopIndex = stops.findIndex(s => s.id === bus.current_stop_id);
    const currentStop = stops[currentStopIndex] ?? null;
    const nextStop = currentStopIndex >= 0 && currentStopIndex < stops.length - 1 ? stops[currentStopIndex + 1] : null;
    const isAtLastStop = currentStopIndex === stops.length - 1 && bus.status === 'reached_stop';
    const progressPct = stops.length > 0 ? Math.round(((stats?.stops_reached_this_trip ?? 0) / stops.length) * 100) : 0;

    // Remaining ETA (sum minutes of remaining stops)
    const remainingMinutes = (() => {
        if (currentStopIndex < 0 || !nextStop) return 0;
        return stops.slice(currentStopIndex + 1).reduce((sum, s) => sum + s.minutes_from_previous, 0);
    })();

    const tripActive = stats?.trip_status === 'on_trip';
    const tripIdle = !stats || stats.trip_status === 'idle';

    return (
        <>
            <Head title="Driver Panel" />

            <div className="max-w-xl mx-auto w-full space-y-5">

                {/* ── Hero bus card ─────────────────────────────────────── */}
                <div
                    className="rounded-2xl overflow-hidden text-white shadow-xl shadow-indigo-900/20"
                    style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}
                >
                    {/* Top row */}
                    <div className="px-6 pt-6 pb-3 flex items-start justify-between">
                        <div>
                            <div className="text-indigo-300 text-[10px] font-semibold uppercase tracking-widest mb-1">Your Bus</div>
                            <div className="text-2xl font-extrabold tracking-tight">{bus.name}</div>
                            <div className="text-indigo-300 text-sm mt-0.5 flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />{bus.bus_route.name}
                            </div>
                        </div>

                        {/* Status pill */}
                        <div className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide border ${
                            !bus.is_active
                                ? 'bg-white/5 text-white/40 border-white/10'
                                : tripActive
                                ? bus.status === 'running'
                                    ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
                                    : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                                : 'bg-white/5 text-white/50 border-white/10'
                        }`}>
                            {!bus.is_active ? '○ Inactive' : tripActive
                                ? bus.status === 'running' ? '● In Transit' : '● At Stop'
                                : '○ Idle'}
                        </div>
                    </div>

                    {/* Current / Next stop banner */}
                    {tripActive && currentStop && (
                        <div className="mx-4 mb-4 rounded-xl bg-white/10 backdrop-blur px-4 py-3 flex items-center justify-between">
                            <div>
                                <div className="text-indigo-300 text-[10px] mb-0.5 uppercase tracking-wider">Current Stop</div>
                                <div className="text-base font-bold leading-tight">{currentStop.name}</div>
                            </div>
                            {nextStop && (
                                <div className="text-right">
                                    <div className="text-indigo-300 text-[10px] mb-0.5 uppercase tracking-wider">Next Stop</div>
                                    <div className="text-sm font-semibold text-indigo-100">{nextStop.name}</div>
                                    <div className="text-[10px] text-indigo-300 mt-0.5">~{remainingMinutes} min remaining</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Progress bar (only on trip) */}
                    {tripActive && (
                        <div className="px-4 pb-5">
                            <div className="flex justify-between text-[10px] text-indigo-300 mb-1.5 uppercase tracking-wider">
                                <span>Route Progress</span>
                                <span>{stats?.stops_reached_this_trip}/{stops.length} stops · {progressPct}%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-full transition-all duration-700"
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Stats grid ────────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-3">
                    <StatCard
                        label="Trips Today"
                        value={stats?.trips_completed ?? 0}
                        sub="total completed"
                        icon={TrendingUp}
                        color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
                    />
                    <StatCard
                        label="Trip Duration"
                        value={elapsed || (tripActive ? 'Starting…' : '—')}
                        sub={tripActive ? 'current trip' : 'not on trip'}
                        icon={Clock}
                        color="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
                    />
                    <StatCard
                        label="Stops Reached"
                        value={`${stats?.stops_reached_this_trip ?? 0} / ${stops.length}`}
                        sub="this trip"
                        icon={MapPin}
                        color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                    />
                    <StatCard
                        label="ETA to Last Stop"
                        value={tripActive && remainingMinutes > 0 ? `~${remainingMinutes} min` : '—'}
                        sub={tripActive ? 'estimated' : 'not on trip'}
                        icon={Flag}
                        color="bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400"
                    />
                </div>

                {/* ── Action area ───────────────────────────────────────── */}
                {!bus.is_active ? (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <div className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Bus Inactive</div>
                            <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Admin has deactivated this bus. Contact admin to re-enable.</div>
                        </div>
                    </div>

                ) : tripIdle ? (
                    /* START TRIP */
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 text-center space-y-4">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 inline-block">
                            <Bus className="h-10 w-10 text-indigo-500" />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white text-lg">Ready to Start?</div>
                            <div className="text-sm text-gray-500 mt-1">
                                {stops.length} stops · {stops.slice(1).reduce((s, stop) => s + stop.minutes_from_previous, 0)} min total
                            </div>
                        </div>
                        <Button
                            className="w-full h-14 text-base font-bold rounded-xl shadow-lg shadow-indigo-500/20"
                            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                            onClick={() => post(driverStartTrip.url({ bus: bus.id }))}
                            disabled={isLoading || stops.length === 0}
                        >
                            <Play className="mr-2 h-5 w-5" />
                            Start Trip
                        </Button>
                        {stops.length === 0 && (
                            <p className="text-xs text-red-500">This route has no stops. Ask the admin to add stops first.</p>
                        )}
                    </div>

                ) : isAtLastStop ? (
                    /* END TRIP */
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-center space-y-4">
                        <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
                        <div>
                            <div className="font-bold text-emerald-700 dark:text-emerald-300 text-lg">Route Complete! 🎉</div>
                            <div className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                                All {stops.length} stops covered · {elapsed}
                            </div>
                        </div>
                        <Button
                            className="w-full h-12 font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => post(driverEndTrip.url({ bus: bus.id }))}
                            disabled={isLoading}
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            End Trip &amp; Reset
                        </Button>
                    </div>

                ) : (
                    /* ON-TRIP CONTROLS */
                    <Card className="border-0 shadow-lg dark:bg-gray-900">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-gray-500 uppercase tracking-wider">Update Location</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Arrived at current stop */}
                            {bus.status === 'running' && currentStop && (
                                <Button
                                    className="w-full h-16 text-base font-bold rounded-xl shadow-md shadow-indigo-500/20"
                                    style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                                    onClick={() =>
                                        post(driverStatusUpdate.url({ bus: bus.id }), {
                                            current_stop_id: currentStop.id,
                                            status: 'reached_stop',
                                        })
                                    }
                                    disabled={isLoading}
                                >
                                    <CheckCircle className="mr-2 h-5 w-5" />
                                    Arrived at {currentStop.name}
                                </Button>
                            )}

                            {/* Depart to next stop */}
                            {bus.status === 'reached_stop' && nextStop && (
                                <Button
                                    className="w-full h-16 text-base font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20"
                                    onClick={() =>
                                        post(driverStatusUpdate.url({ bus: bus.id }), {
                                            current_stop_id: nextStop.id,
                                            status: 'running',
                                        })
                                    }
                                    disabled={isLoading}
                                >
                                    <ChevronRight className="mr-2 h-5 w-5" />
                                    Depart to {nextStop.name}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* ── Route timeline ────────────────────────────────────── */}
                <Card className="dark:bg-gray-900 border-gray-100 dark:border-gray-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5" /> Route Timeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative pl-2">
                            {/* Connecting line */}
                            {stops.length > 1 && (
                                <div className="absolute left-6 top-5 bottom-5 w-0.5 bg-gray-100 dark:bg-gray-800" />
                            )}
                            <div className="space-y-4">
                                {stops.map((stop, idx) => {
                                    const isDone =
                                        tripActive &&
                                        (idx < currentStopIndex ||
                                            (idx === currentStopIndex && bus.status === 'reached_stop'));
                                    const isCurrent = tripActive && idx === currentStopIndex;

                                    return (
                                        <div key={stop.id} className="flex items-center gap-3 relative">
                                            {/* Circle */}
                                            <div
                                                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 text-xs font-bold transition-all ${
                                                    isDone
                                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                                        : isCurrent
                                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/40'
                                                        : 'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700 text-gray-400'
                                                }`}
                                            >
                                                {isDone ? (
                                                    <CheckCircle className="h-4 w-4" />
                                                ) : isCurrent ? (
                                                    <CircleDot className="h-4 w-4" />
                                                ) : (
                                                    idx + 1
                                                )}
                                            </div>

                                            {/* Stop info */}
                                            <div className="flex-1 flex items-center justify-between">
                                                <div>
                                                    <div
                                                        className={`text-sm font-semibold transition-all ${
                                                            isDone
                                                                ? 'text-gray-300 dark:text-gray-600 line-through'
                                                                : isCurrent
                                                                ? 'text-indigo-600 dark:text-indigo-400'
                                                                : 'text-gray-800 dark:text-gray-200'
                                                        }`}
                                                    >
                                                        {stop.name}
                                                    </div>
                                                    {idx > 0 && (
                                                        <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                                                            <Clock className="h-2.5 w-2.5" />
                                                            +{stop.minutes_from_previous} min
                                                        </div>
                                                    )}
                                                </div>
                                                {isCurrent && (
                                                    <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                                                        HERE
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
