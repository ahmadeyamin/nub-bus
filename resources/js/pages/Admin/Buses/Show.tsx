import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import {
    AlertTriangle,
    ArrowLeft,
    Bus,
    CheckCircle,
    CircleDot,
    Clock,
    Flag,
    MapPin,
    Pencil,
    Power,
    PowerOff,
    RotateCcw,
    RouteIcon,
    Save,
    TrendingUp,
    Trash2,
    User,
    X,
} from 'lucide-react';
import {
    index as busesIndex,
    update as busesUpdate,
    destroy as busesDestroy,
    toggleActive as busesToggleActive,
} from '@/routes/admin/buses';
import { show as driversShow } from '@/routes/admin/drivers';
import { show as routesShow } from '@/routes/admin/routes';

interface StopInfo { id: number; name: string; order_index: number; }
interface RouteInfo { id: number; name: string; total_stops: number; stops: StopInfo[]; }
interface DriverInfo { id: number; name: string; email: string; }
interface BusRoute { id: number; name: string; }
interface DriverOption { id: number; name: string; email: string; }

interface BusDetail {
    id: number; name: string; status: string; trip_status: string;
    is_active: boolean; trips_completed: number;
    stops_reached_this_trip: number; trip_started_at: string | null;
    trip_duration_minutes: number | null; bus_route_id: number | null;
    driver_id: number | null; current_stop: string | null;
    stops_remaining: number; route: RouteInfo | null; driver: DriverInfo | null;
}

// ── Live timer ──────────────────────────────────────────────────────────────
function useLiveTimer(startedAt: string | null, active: boolean) {
    const [elapsed, setElapsed] = useState('—');
    useEffect(() => {
        if (!startedAt || !active) { setElapsed('—'); return; }
        const tick = () => {
            const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
            const h = Math.floor(diff / 3600), m = Math.floor((diff % 3600) / 60), s = diff % 60;
            setElapsed(h > 0 ? `${h}h ${String(m).padStart(2,'0')}m` : `${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`);
        };
        tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
    }, [startedAt, active]);
    return elapsed;
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color }: {
    label: string; value: string | number; sub?: string; icon: React.ElementType; color: string;
}) {
    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-start gap-3">
            <div className={`p-2.5 rounded-xl flex-shrink-0 ${color}`}><Icon className="h-4 w-4" /></div>
            <div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">{label}</div>
                <div className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">{value}</div>
                {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function AdminBusShow({ bus, routes, drivers }: PageProps<{
    bus: BusDetail; routes: BusRoute[]; drivers: DriverOption[];
}>) {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        name: bus.name,
        bus_route_id: String(bus.bus_route_id ?? ''),
        driver_id: String(bus.driver_id ?? ''),
    });
    const [saving, setSaving] = useState(false);

    const elapsed = useLiveTimer(bus.trip_started_at, bus.trip_status === 'on_trip');
    const tripActive = bus.trip_status === 'on_trip';
    const progressPct = bus.route && bus.route.total_stops > 0
        ? Math.round((bus.stops_reached_this_trip / bus.route.total_stops) * 100) : 0;

    useEffect(() => {
        setForm({ name: bus.name, bus_route_id: String(bus.bus_route_id ?? ''), driver_id: String(bus.driver_id ?? '') });
    }, [bus]);

    const save = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        router.put(busesUpdate.url({ bus: bus.id }), form, {
            onSuccess: () => setEditing(false),
            onFinish: () => setSaving(false),
        });
    };

    const deleteBus = () => {
        if (!confirm(`Delete bus "${bus.name}"? This cannot be undone.`)) return;
        router.delete(busesDestroy.url({ bus: bus.id }), {
            onSuccess: () => router.visit(busesIndex.url()),
        });
    };

    return (
        <>
            <Head title={`Bus — ${bus.name}`} />
            <div className="max-w-3xl mx-auto w-full space-y-6">

                {/* ── Back ──────────────────────────────────────────────── */}
                <Link href={busesIndex.url()} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="h-4 w-4" /> All Buses
                </Link>

                {/* ── Hero card ─────────────────────────────────────────── */}
                <div className="rounded-2xl overflow-hidden text-white shadow-xl"
                    style={{ background: 'linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)' }}>
                    <div className="px-6 pt-6 pb-3 flex items-start justify-between">
                        <div>
                            <div className="text-indigo-300 text-[10px] font-semibold uppercase tracking-widest mb-1">Bus</div>
                            <div className="text-2xl font-extrabold tracking-tight">{bus.name}</div>
                            {bus.route && (
                                <div className="text-indigo-300 text-sm flex items-center gap-1.5 mt-0.5">
                                    <RouteIcon className="h-3.5 w-3.5" />{bus.route.name}
                                </div>
                            )}
                            {bus.driver && (
                                <div className="text-indigo-300 text-sm flex items-center gap-1.5 mt-0.5">
                                    <User className="h-3.5 w-3.5" />{bus.driver.name}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            {/* Status pill */}
                            <div className={`px-3 py-1.5 rounded-full text-[11px] font-bold border ${
                                !bus.is_active ? 'bg-white/5 text-white/40 border-white/10'
                                : tripActive
                                    ? bus.status === 'running'
                                        ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
                                        : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                                    : 'bg-white/10 text-white/60 border-white/20'
                            }`}>
                                {!bus.is_active ? '○ Inactive'
                                    : tripActive
                                        ? bus.status === 'running' ? '● In Transit' : '● At Stop'
                                        : '○ Active / Idle'}
                            </div>
                            {/* Toggle active */}
                            <button
                                onClick={() => router.post(busesToggleActive.url({ bus: bus.id }))}
                                className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                                    bus.is_active
                                        ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30'
                                        : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                                }`}
                            >
                                {bus.is_active ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
                                {bus.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                    </div>

                    {/* Progress bar */}
                    {tripActive && bus.route && (
                        <div className="px-6 pb-5">
                            <div className="mx-0 mt-2 rounded-xl bg-white/10 px-4 py-3 flex items-center justify-between mb-3">
                                <div>
                                    <div className="text-indigo-300 text-[10px] uppercase tracking-wider mb-0.5">Current Stop</div>
                                    <div className="font-bold">{bus.current_stop ?? '—'}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-indigo-300 text-[10px] uppercase tracking-wider mb-0.5">Remaining</div>
                                    <div className="font-semibold text-indigo-100">{bus.stops_remaining} stops</div>
                                </div>
                            </div>
                            <div className="flex justify-between text-[10px] text-indigo-300 mb-1.5 uppercase tracking-wider">
                                <span>Trip Progress</span>
                                <span>{bus.stops_reached_this_trip}/{bus.route.total_stops} · {progressPct}%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-full transition-all duration-700"
                                    style={{ width: `${progressPct}%` }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Stats ─────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard label="Total Trips" value={bus.trips_completed} sub="all time"
                        icon={TrendingUp} color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />
                    <StatCard label="Trip Duration" value={elapsed} sub={tripActive ? 'live' : 'not on trip'}
                        icon={Clock} color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" />
                    <StatCard label="Stops This Trip" value={bus.route ? `${bus.stops_reached_this_trip}/${bus.route.total_stops}` : '—'} sub="current trip"
                        icon={MapPin} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" />
                    <StatCard label="Route Stops" value={bus.route?.total_stops ?? '—'} sub="total on route"
                        icon={Flag} color="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" />
                </div>

                {/* ── Settings / Edit ───────────────────────────────────── */}
                <Card className="dark:bg-gray-900 border-gray-100 dark:border-gray-800">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Bus className="h-4 w-4 text-indigo-500" /> Bus Settings
                            </CardTitle>
                            {!editing ? (
                                <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-1.5">
                                    <Pencil className="h-3.5 w-3.5" /> Edit
                                </Button>
                            ) : (
                                <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setForm({ name: bus.name, bus_route_id: String(bus.bus_route_id ?? ''), driver_id: String(bus.driver_id ?? '') }); }} className="gap-1.5 text-gray-500">
                                    <X className="h-3.5 w-3.5" /> Cancel
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!editing ? (
                            <div className="space-y-4">
                                {/* Name */}
                                <div className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800">
                                    <Bus className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <div>
                                        <div className="text-[11px] text-gray-400 uppercase tracking-wider">Name</div>
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{bus.name}</div>
                                    </div>
                                </div>
                                {/* Route */}
                                <div className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800">
                                    <RouteIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="text-[11px] text-gray-400 uppercase tracking-wider">Route</div>
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{bus.route?.name ?? 'None'}</div>
                                    </div>
                                    {bus.route && (
                                        <Link href={routesShow.url({ route: bus.bus_route_id! })} className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
                                            Manage stops →
                                        </Link>
                                    )}
                                </div>
                                {/* Driver */}
                                <div className="flex items-center gap-3 py-2">
                                    <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="text-[11px] text-gray-400 uppercase tracking-wider">Driver</div>
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{bus.driver?.name ?? 'Unassigned'}</div>
                                        {bus.driver && <div className="text-xs text-gray-400">{bus.driver.email}</div>}
                                    </div>
                                    {bus.driver && (
                                        <Link href={driversShow.url({ driver: bus.driver_id! })} className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
                                            View driver →
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={save} className="space-y-4 max-w-lg">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Bus Name</Label>
                                    <Input id="edit-name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Route</Label>
                                    <Select value={form.bus_route_id} onValueChange={v => setForm(p => ({ ...p, bus_route_id: v }))}>
                                        <SelectTrigger><SelectValue placeholder="Select route" /></SelectTrigger>
                                        <SelectContent>{routes.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Driver</Label>
                                    <Select value={form.driver_id} onValueChange={v => setForm(p => ({ ...p, driver_id: v }))}>
                                        <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">— Unassigned —</SelectItem>
                                            {drivers.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                                    <Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save Changes'}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>

                {/* ── Route stop timeline ────────────────────────────────── */}
                {bus.route && bus.route.stops.length > 0 && (
                    <Card className="dark:bg-gray-900 border-gray-100 dark:border-gray-800">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5" /> Route Stops
                                </CardTitle>
                                <Link href={routesShow.url({ route: bus.bus_route_id! })} className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
                                    Edit on map →
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="relative pl-2">
                                {bus.route.stops.length > 1 && (
                                    <div className="absolute left-6 top-5 bottom-5 w-0.5 bg-gray-100 dark:bg-gray-800" />
                                )}
                                <div className="space-y-3">
                                    {bus.route.stops.map((stop, idx) => {
                                        const isCurrent = tripActive && bus.current_stop === stop.name;
                                        return (
                                            <div key={stop.id} className="flex items-center gap-3 relative">
                                                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 text-xs font-bold transition-all ${
                                                    isCurrent
                                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/40'
                                                        : 'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700 text-gray-500'
                                                }`}>
                                                    {isCurrent ? <CircleDot className="h-4 w-4" /> : idx + 1}
                                                </div>
                                                <div className="flex-1 flex items-center justify-between">
                                                    <div className={`text-sm font-semibold ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {stop.name}
                                                    </div>
                                                    {isCurrent && (
                                                        <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">HERE</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ── Danger zone ───────────────────────────────────────── */}
                <Card className="border-red-100 dark:border-red-900/40 dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" /> Danger Zone
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">Delete this bus</div>
                            <div className="text-xs text-gray-400 mt-0.5">This action is permanent and cannot be undone.</div>
                        </div>
                        <Button variant="outline" size="sm" onClick={deleteBus} className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 gap-1.5">
                            <Trash2 className="h-3.5 w-3.5" /> Delete Bus
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
