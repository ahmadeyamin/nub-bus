import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Bus, ChevronRight, Plus, User } from 'lucide-react';
import { store as driversStore, show as driversShow } from '@/routes/admin/drivers';

interface BusSummary {
    id: number;
    name: string;
    is_active: boolean;
    trip_status: string;
    trips_completed: number;
    route: string | null;
}

interface DriverType {
    id: number;
    name: string;
    email: string;
    bus: BusSummary | null;
}

const DEFAULT_FORM = { name: '', email: '', password: '' };

export default function AdminDrivers({ drivers }: PageProps<{ drivers: DriverType[] }>) {
    const [form, setForm] = useState(DEFAULT_FORM);
    const [submitting, setSubmitting] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.post(driversStore.url(), form, {
            onSuccess: () => setForm(DEFAULT_FORM),
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <>
            <Head title="Manage Drivers" />
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Drivers</h1>
                    <p className="text-sm text-gray-500 mt-1">{drivers.length} drivers registered</p>
                </div>

                {/* Drivers List */}
                <div className="space-y-3">
                    {drivers.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                            <User className="mx-auto h-10 w-10 mb-3 opacity-40" />
                            <p>No drivers yet. Add one below.</p>
                        </div>
                    ) : (
                        drivers.map(driver => (
                            <Link
                                key={driver.id}
                                href={driversShow.url({ driver: driver.id })}
                                className="flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-4 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md transition-all group"
                            >
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full p-0.5">
                                        <div className="bg-white dark:bg-gray-900 rounded-full p-2">
                                            <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                    </div>
                                    {/* Online indicator */}
                                    {driver.bus?.trip_status === 'on_trip' && (
                                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900 dark:text-white">{driver.name}</span>
                                        {driver.bus?.trip_status === 'on_trip' && (
                                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] px-1.5 py-0">
                                                On Trip
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-0.5">{driver.email}</div>
                                </div>

                                {/* Bus info */}
                                <div className="hidden sm:flex flex-col items-end gap-0.5 flex-shrink-0 text-right">
                                    {driver.bus ? (
                                        <>
                                            <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                                                <Bus className="h-3.5 w-3.5 text-gray-400" />
                                                {driver.bus.name}
                                            </div>
                                            <div className="text-[11px] text-gray-400">{driver.bus.route ?? 'No route'}</div>
                                            <div className="text-[11px] text-indigo-500 font-medium">
                                                {driver.bus.trips_completed} trip{driver.bus.trips_completed !== 1 ? 's' : ''} completed
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-xs text-gray-400 italic">No bus assigned</div>
                                    )}
                                </div>

                                <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                            </Link>
                        ))
                    )}
                </div>

                {/* Add Driver */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Plus className="h-4 w-4 text-emerald-500" />
                            Add New Driver
                        </CardTitle>
                        <CardDescription>Creates a driver account they can log in with.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
                            <div className="space-y-2">
                                <Label htmlFor="driver-name">Full Name</Label>
                                <Input id="driver-name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="John Driver" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="driver-email">Email</Label>
                                <Input id="driver-email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="john@nub.edu" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="driver-password">Password</Label>
                                <Input id="driver-password" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min 8 characters" required />
                            </div>
                            <div className="sm:col-span-3">
                                <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700">
                                    {submitting ? 'Creating…' : 'Create Driver Account'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
