import { Head, Link, usePage } from '@inertiajs/react';
import {
    Bus,
    CheckCircle,
    Clock,
    Flag,
    MapPin,
    Navigation,
    Play,
    RouteIcon,
    TrendingUp,
    User,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { index as routesIndex } from '@/routes/admin/routes';
import { index as busesIndex } from '@/routes/admin/buses';
import { index as driversIndex } from '@/routes/admin/drivers';
import { index as driverStatusIndex } from '@/routes/driver/status';
import { tracking } from '@/routes';

// ── Live timer ─────────────────────────────────────────────────────────────
function useLiveTimer(startedAt: string | null, active: boolean): string {
    const [elapsed, setElapsed] = useState('—');
    useEffect(() => {
        if (!startedAt || !active) { setElapsed('—'); return; }
        const tick = () => {
            const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
            const h = Math.floor(diff / 3600);
            const m = Math.floor((diff % 3600) / 60);
            const s = diff % 60;
            setElapsed(h > 0 ? `${h}h ${String(m).padStart(2,'0')}m` : `${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [startedAt, active]);
    return elapsed;
}

// ── Reusable stat card ─────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, gradient }: {
    label: string; value: string | number; sub?: string;
    icon: React.ElementType; gradient: string;
}) {
    return (
        <div className="relative overflow-hidden rounded-2xl p-5 text-white" style={{ background: gradient }}>
            <div className="absolute -right-3 -top-3 opacity-20">
                <Icon className="h-20 w-20" />
            </div>
            <div className="relative">
                <div className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-2">{label}</div>
                <div className="text-3xl font-extrabold leading-tight">{value}</div>
                {sub && <div className="text-xs mt-1 opacity-70">{sub}</div>}
            </div>
        </div>
    );
}

// ── Quick-link card ────────────────────────────────────────────────────────
function QuickLink({ href, icon: Icon, label, description, color }: {
    href: string; icon: React.ElementType; label: string; description: string; color: string;
}) {
    return (
        <Link href={href} className="group flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 hover:shadow-md transition-all hover:border-indigo-200 dark:hover:border-indigo-800">
            <div className={`p-3 rounded-xl ${color} transition-transform group-hover:scale-110`}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <div className="font-semibold text-sm text-gray-900 dark:text-white">{label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{description}</div>
            </div>
            <div className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors">→</div>
        </Link>
    );
}

// ── Interfaces ─────────────────────────────────────────────────────────────
interface AdminStats {
    total_routes: number; total_buses: number; active_buses: number;
    total_drivers: number; buses_on_trip: number; trips_completed_today: number;
}
interface RecentBus {
    id: number; name: string; route: string; driver: string;
    status: string; trip_status: string; is_active: boolean; current_stop: string | null;
}
interface DriverStats {
    bus_name: string; route_name: string; trip_status: string;
    trips_completed: number; stops_reached_this_trip: number; total_stops: number;
    stops_remaining: number; trip_duration_minutes: number | null;
    trip_started_at: string | null; current_stop: string | null;
    status: string; is_active: boolean; bus_id: number;
}

// ══════════════════════════════════════════════════════════════════════════
export default function Dashboard({ stats, recent_buses, driver_stats, student_stats }: PageProps<{
    stats?: AdminStats;
    recent_buses?: RecentBus[];
    driver_stats?: DriverStats | null;
    student_stats?: { total_routes: number; active_buses: number };
}>) {
    const { auth } = usePage().props;
    const role = auth.user?.role;

    return (
        <>
            <Head title="Dashboard" />
            <div className="max-w-5xl mx-auto w-full space-y-8">

                {/* ── Welcome ── */}
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                        Welcome back, {auth.user?.name?.split(' ')[0]} 👋
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {role === 'admin' && 'Here\'s your system overview for today.'}
                        {role === 'driver' && 'Your personal activity and trip summary.'}
                        {role === 'student' && 'Track your university bus in real time.'}
                    </p>
                </div>

                {/* ══ ADMIN DASHBOARD ══════════════════════════════════════════════════ */}
                {role === 'admin' && stats && (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <StatCard label="Total Routes" value={stats.total_routes} sub="configured routes" icon={RouteIcon}
                                gradient="linear-gradient(135deg,#4f46e5,#7c3aed)" />
                            <StatCard label="Active Buses" value={`${stats.active_buses}/${stats.total_buses}`} sub="currently active" icon={Bus}
                                gradient="linear-gradient(135deg,#0891b2,#0e7490)" />
                            <StatCard label="On Trip Now" value={stats.buses_on_trip} sub="buses running" icon={Navigation}
                                gradient="linear-gradient(135deg,#059669,#047857)" />
                            <StatCard label="Total Drivers" value={stats.total_drivers} sub="registered drivers" icon={User}
                                gradient="linear-gradient(135deg,#d97706,#b45309)" />
                            <StatCard label="Trips Completed" value={stats.trips_completed_today} sub="all time" icon={CheckCircle}
                                gradient="linear-gradient(135deg,#db2777,#be185d)" />
                            <StatCard label="System Status" value="Live" sub="tracking operational" icon={Zap}
                                gradient="linear-gradient(135deg,#6366f1,#4f46e5)" />
                        </div>

                        {/* Quick links */}
                        <div>
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <QuickLink href={routesIndex.url()} icon={RouteIcon} label="Manage Routes"
                                    description="Add stops and routes" color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />
                                <QuickLink href={busesIndex.url()} icon={Bus} label="Manage Buses"
                                    description="Start, stop, assign buses" color="bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400" />
                                <QuickLink href={driversIndex.url()} icon={User} label="Manage Drivers"
                                    description="Add driver accounts" color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" />
                            </div>
                        </div>

                        {/* Live bus status table */}
                        {recent_buses && recent_buses.length > 0 && (
                            <div>
                                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Live Bus Activity</h2>
                                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800 overflow-hidden">
                                    {recent_buses.map(bus => (
                                        <div key={bus.id} className="flex items-center gap-4 px-5 py-3.5">
                                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                                bus.trip_status === 'on_trip' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'
                                            }`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{bus.name}</div>
                                                <div className="text-xs text-gray-400 truncate">{bus.route} · {bus.driver}</div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                                    {bus.current_stop ?? 'Not started'}
                                                </div>
                                                <div className={`text-[10px] font-semibold mt-0.5 ${
                                                    bus.trip_status === 'on_trip'
                                                        ? bus.status === 'running' ? 'text-emerald-500' : 'text-amber-500'
                                                        : 'text-gray-400'
                                                }`}>
                                                    {bus.trip_status === 'on_trip'
                                                        ? bus.status === 'running' ? '● In Transit' : '● At Stop'
                                                        : '○ Idle'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ══ DRIVER DASHBOARD ══════════════════════════════════════════════════ */}
                {role === 'driver' && (
                    <DriverDashboardContent stats={driver_stats ?? null} />
                )}

                {/* ══ STUDENT DASHBOARD ══════════════════════════════════════════════════ */}
                {role === 'student' && student_stats && (
                    <StudentDashboardContent stats={student_stats} />
                )}

            </div>
        </>
    );
}

// ── Driver section ─────────────────────────────────────────────────────────
function DriverDashboardContent({ stats }: { stats: DriverStats | null }) {
    const elapsed = useLiveTimer(stats?.trip_started_at ?? null, stats?.trip_status === 'on_trip');
    const tripActive = stats?.trip_status === 'on_trip';
    const progressPct = stats && stats.total_stops > 0
        ? Math.round((stats.stops_reached_this_trip / stats.total_stops) * 100) : 0;

    if (!stats) {
        return (
            <div className="text-center py-20 text-gray-400">
                <Bus className="mx-auto h-12 w-12 mb-4 opacity-30" />
                <p className="font-medium">No bus assigned yet.</p>
                <p className="text-sm mt-1">Contact admin to get assigned to a bus.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Bus hero */}
            <div className="rounded-2xl overflow-hidden text-white shadow-xl"
                style={{ background: 'linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)' }}>
                <div className="px-6 pt-6 pb-3 flex items-start justify-between">
                    <div>
                        <div className="text-indigo-300 text-[10px] font-semibold uppercase tracking-widest mb-1">Assigned Bus</div>
                        <div className="text-2xl font-extrabold">{stats.bus_name}</div>
                        <div className="text-indigo-300 text-sm flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3.5 w-3.5" />{stats.route_name}
                        </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-[11px] font-bold border ${
                        !stats.is_active ? 'bg-white/5 text-white/40 border-white/10'
                        : tripActive
                            ? stats.status === 'running'
                                ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
                                : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                            : 'bg-white/5 text-white/50 border-white/10'
                    }`}>
                        {!stats.is_active ? '○ Inactive' : tripActive
                            ? stats.status === 'running' ? '● In Transit' : '● At Stop'
                            : '○ Idle'}
                    </div>
                </div>

                {tripActive && stats.current_stop && (
                    <div className="mx-4 mb-4 rounded-xl bg-white/10 px-4 py-3 flex items-center justify-between">
                        <div>
                            <div className="text-indigo-300 text-[10px] uppercase tracking-wider mb-0.5">Current Stop</div>
                            <div className="font-bold">{stats.current_stop}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-indigo-300 text-[10px] uppercase tracking-wider mb-0.5">Remaining</div>
                            <div className="font-semibold text-indigo-100">{stats.stops_remaining} stops</div>
                        </div>
                    </div>
                )}

                {tripActive && (
                    <div className="px-4 pb-5">
                        <div className="flex justify-between text-[10px] text-indigo-300 mb-1.5 uppercase tracking-wider">
                            <span>Progress</span>
                            <span>{stats.stops_reached_this_trip}/{stats.total_stops} stops · {progressPct}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-full transition-all duration-700"
                                style={{ width: `${progressPct}%` }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
                <StatCard label="Trips Completed" value={stats.trips_completed} sub="all time"
                    icon={TrendingUp} gradient="linear-gradient(135deg,#4f46e5,#7c3aed)" />
                <StatCard label="Trip Duration" value={elapsed}
                    sub={tripActive ? 'current trip' : 'not on trip'}
                    icon={Clock} gradient="linear-gradient(135deg,#d97706,#b45309)" />
                <StatCard label="Stops This Trip" value={`${stats.stops_reached_this_trip}/${stats.total_stops}`}
                    sub="reached so far"
                    icon={MapPin} gradient="linear-gradient(135deg,#059669,#047857)" />
                <StatCard label="Stops Remaining" value={tripActive ? stats.stops_remaining : '—'}
                    sub="until end of route"
                    icon={Flag} gradient="linear-gradient(135deg,#db2777,#be185d)" />
            </div>

            {/* Go to driver panel */}
            <Link href={driverStatusIndex.url()}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white text-base transition-all hover:opacity-90 shadow-lg shadow-indigo-500/20"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}
            >
                <Play className="h-5 w-5" />
                {tripActive ? 'Continue Trip →' : 'Start a New Trip →'}
            </Link>
        </div>
    );
}

// ── Student section ────────────────────────────────────────────────────────
function StudentDashboardContent({ stats }: { stats: { total_routes: number; active_buses: number } }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <StatCard label="Active Routes" value={stats.total_routes} sub="available routes"
                    icon={RouteIcon} gradient="linear-gradient(135deg,#4f46e5,#7c3aed)" />
                <StatCard label="Buses Running" value={stats.active_buses} sub="live right now"
                    icon={Bus} gradient="linear-gradient(135deg,#059669,#047857)" />
            </div>
            <Link href={tracking.url()}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white text-base shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}
            >
                <Navigation className="h-5 w-5" />
                Track My Bus →
            </Link>
        </div>
    );
}
