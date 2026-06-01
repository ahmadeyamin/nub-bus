import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Bus, Plus, Power, PowerOff, Trash2, User } from 'lucide-react';
import { store as busesStore, destroy as busesDestroy, toggleActive as busesToggleActive } from '@/routes/admin/buses';

interface Driver {
    id: number;
    name: string;
    email: string;
}

interface BusRoute {
    id: number;
    name: string;
}

interface Stop {
    id: number;
    name: string;
}

interface BusType {
    id: number;
    name: string;
    status: string;
    is_active: boolean;
    bus_route: BusRoute;
    driver: Driver | null;
    current_stop: Stop | null;
}

const DEFAULT_FORM = { name: '', bus_route_id: '', driver_id: '' };

export default function AdminBuses({ buses, routes, drivers }: PageProps<{
    buses: BusType[];
    routes: BusRoute[];
    drivers: Driver[];
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

    const handleDelete = (id: number) => {
        if (!confirm('Delete this bus?')) return;
        router.delete(busesDestroy.url({ bus: id }));
    };

    const handleToggle = (id: number) => {
        router.post(busesToggleActive.url({ bus: id }));
    };

    return (
        <>
            <Head title="Manage Buses" />
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buses</h1>
                    <p className="text-sm text-gray-500 mt-1">{buses.length} buses registered</p>
                </div>

                {/* Bus List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Bus className="h-4 w-4 text-indigo-500" />
                            All Buses
                        </CardTitle>
                        <CardDescription>Start or stop a bus using the power button.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {buses.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <Bus className="mx-auto h-10 w-10 mb-3 opacity-40" />
                                <p>No buses yet. Add one below.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {buses.map(bus => (
                                    <div key={bus.id} className="flex items-center justify-between py-4 px-3 group hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-xl ${bus.is_active ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                                <Bus className={`h-5 w-5 ${bus.is_active ? 'text-emerald-600' : 'text-gray-400'}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-900 dark:text-white">{bus.name}</span>
                                                    <Badge variant={bus.is_active ? 'default' : 'secondary'} className={bus.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}>
                                                        {bus.is_active ? (bus.status === 'running' ? 'In Transit' : 'At Stop') : 'Inactive'}
                                                    </Badge>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                                                    <span>{bus.bus_route?.name ?? '—'}</span>
                                                    {bus.driver && (
                                                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{bus.driver.name}</span>
                                                    )}
                                                    {bus.current_stop && (
                                                        <span>Currently at: {bus.current_stop.name}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={bus.is_active
                                                    ? 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400'
                                                    : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400'
                                                }
                                                onClick={() => handleToggle(bus.id)}
                                            >
                                                {bus.is_active ? <PowerOff className="h-4 w-4 mr-1" /> : <Power className="h-4 w-4 mr-1" />}
                                                {bus.is_active ? 'Stop' : 'Start'}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDelete(bus.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Add Bus */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Plus className="h-4 w-4 text-emerald-500" />
                            Add New Bus
                        </CardTitle>
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
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select route" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {routes.map(r => <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Assign Driver</Label>
                                <Select value={form.driver_id} onValueChange={v => setForm(p => ({ ...p, driver_id: v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select driver" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {drivers.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                                    </SelectContent>
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
