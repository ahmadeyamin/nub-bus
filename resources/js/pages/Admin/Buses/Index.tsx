import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Bus, ChevronRight, MapPin, Plus, Power, PowerOff, TrendingUp, User } from 'lucide-react';
import { store as busesStore, destroy as busesDestroy, toggleActive as busesToggleActive, show as busesShow } from '@/routes/admin/buses';

interface Driver { id: number; name: string; email: string; }
interface BusRoute { id: number; name: string; }
interface BusType {
    id: number; name: string; status: string; trip_status: string;
    is_active: boolean; trips_completed: number;
    bus_route: BusRoute | null; driver: Driver | null;
    current_stop: { name: string } | null;
}

const DEFAULT_FORM = { name: '', bus_route_id: '', driver_id: '' };

export default function AdminBuses({ buses, routes, drivers }: PageProps<{
    buses: BusType[]; routes: BusRoute[]; drivers: Driver[];
}>) {
    const [form, setForm] = useState(DEFAULT_FORM);
    const [submitting, setSubmitting] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.post(busesStore.url(), form, {
            onSuccess: () => setForm(DEFAULT_FORM),
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <>
            <Head title="Manage Buses" />
            <div className="max-w-4xl mx-auto w-full space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buses</h1>
                    <p className="text-sm text-gray-500 mt-1">{buses.length} buses registered</p>
                </div>

                {/* Bus List */}
                <div className="space-y-3">
                    {buses.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                            <Bus className="mx-auto h-10 w-10 mb-3 opacity-40" />
                            <p>No buses yet. Add one below.</p>
                        </div>
                    ) : buses.map(bus => (
                        <div key={bus.id} className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3.5 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md transition-all group">
                            {/* Bus icon */}
                            <div className={`flex-shrink-0 p-2.5 rounded-xl ${bus.is_active ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <Bus className={`h-5 w-5 ${bus.is_active ? 'text-emerald-600' : 'text-gray-400'}`} />
                            </div>

                            {/* Info — clickable */}
                            <Link href={busesShow.url({ bus: bus.id })} className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-gray-900 dark:text-white">{bus.name}</span>
                                    <Badge className={
                                        bus.trip_status === 'on_trip'
                                            ? bus.status === 'running'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                                    }>
                                        {bus.is_active
                                            ? bus.trip_status === 'on_trip'
                                                ? bus.status === 'running' ? 'In Transit' : 'At Stop'
                                                : 'Active / Idle'
                                            : 'Inactive'}
                                    </Badge>
                                </div>
                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                                    {bus.bus_route && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{bus.bus_route.name}</span>}
                                    {bus.driver && <span className="flex items-center gap-1"><User className="h-3 w-3" />{bus.driver.name}</span>}
                                    {bus.current_stop && <span>At: {bus.current_stop.name}</span>}
                                    <span className="flex items-center gap-1 text-indigo-500">
                                        <TrendingUp className="h-3 w-3" />{bus.trips_completed} trips
                                    </span>
                                </div>
                            </Link>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Button
                                    variant="outline" size="sm"
                                    className={bus.is_active
                                        ? 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
                                        : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300'}
                                    onClick={() => router.post(busesToggleActive.url({ bus: bus.id }))}
                                >
                                    {bus.is_active ? <PowerOff className="h-3.5 w-3.5 mr-1" /> : <Power className="h-3.5 w-3.5 mr-1" />}
                                    {bus.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Link href={busesShow.url({ bus: bus.id })} className="p-1.5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors">
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Bus */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Plus className="h-4 w-4 text-emerald-500" /> Add New Bus
                        </CardTitle>
                        <CardDescription>After adding, visit the bus page to manage it fully.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
                            <div className="space-y-2">
                                <Label htmlFor="bus-name">Bus Name</Label>
                                <Input id="bus-name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Bus Alpha" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Route</Label>
                                <Select value={form.bus_route_id} onValueChange={v => setForm(p => ({ ...p, bus_route_id: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select route" /></SelectTrigger>
                                    <SelectContent>{routes.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Driver (optional)</Label>
                                <Select value={form.driver_id} onValueChange={v => setForm(p => ({ ...p, driver_id: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
                                    <SelectContent>{drivers.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="sm:col-span-3">
                                <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700">
                                    {submitting ? 'Adding…' : 'Add Bus'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
