import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Bus, ChevronRight, MapPin, Plus, RouteIcon, Trash2 } from 'lucide-react';
import { store as routesStore, destroy as routesDestroy } from '@/routes/admin/routes';
import { index as routesIndex } from '@/routes/admin/routes';

interface RouteType {
    id: number;
    name: string;
    stops: { id: number }[];
    buses_count: number;
}

export default function AdminRoutes({ routes }: PageProps<{ routes: RouteType[] }>) {
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.post(routesStore.url(), { name }, {
            onSuccess: () => setName(''),
            onFinish: () => setSubmitting(false),
        });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Delete this route and all its stops?')) return;
        router.delete(routesDestroy.url({ route: id }));
    };

    return (
        <>
            <Head title="Manage Routes" />
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bus Routes</h1>
                        <p className="text-sm text-gray-500 mt-1">{routes.length} routes configured</p>
                    </div>
                </div>

                {/* Routes List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <RouteIcon className="h-4 w-4 text-indigo-500" />
                            All Routes
                        </CardTitle>
                        <CardDescription>Click "Manage Stops" to add or remove stops on a route.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {routes.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <RouteIcon className="mx-auto h-10 w-10 mb-3 opacity-40" />
                                <p>No routes yet. Add one below.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {routes.map(route => (
                                    <div key={route.id} className="flex items-center justify-between py-4 px-1 group hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-3 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-xl">
                                                <RouteIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900 dark:text-white">{route.name}</div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />{route.stops.length} stops
                                                    </span>
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Bus className="h-3 w-3" />{route.buses_count} buses
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/routes/${route.id}`}>
                                                <Button variant="outline" size="sm" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-400">
                                                    Manage Stops <ChevronRight className="ml-1 h-3 w-3" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDelete(route.id)}
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

                {/* Add Route */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Plus className="h-4 w-4 text-emerald-500" />
                            Add New Route
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="flex gap-3 max-w-md">
                            <div className="flex-1">
                                <Label htmlFor="name" className="sr-only">Route Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Campus to Uttara"
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700">
                                {submitting ? 'Adding…' : 'Add Route'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
