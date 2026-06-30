import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Bus, ChevronRight, MapPin, Plus, RouteIcon, Trash2 } from 'lucide-react';
import { store as routesStore, destroy as routesDestroy, show as routesShow } from '@/routes/admin/routes';

interface RouteType {
    id: number;
    name: string;
    stops: { id: number }[];
    buses_count: number;
}

export default function AdminRoutes({ routes }: { routes: RouteType[] }) {
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

    return (
        <>
            <Head title="Manage Routes" />
            <div className="max-w-4xl mx-auto w-full space-y-8">

                {/* Page header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bus Routes</h1>
                    <p className="text-sm text-gray-500 mt-1">{routes.length} route{routes.length !== 1 ? 's' : ''} configured</p>
                </div>

                {/* Routes list */}
                <div className="space-y-3">
                    {routes.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                            <RouteIcon className="mx-auto h-10 w-10 mb-3 opacity-40" />
                            <p className="font-medium">No routes yet.</p>
                            <p className="text-sm mt-1">Add your first route below.</p>
                        </div>
                    ) : routes.map(route => (
                        <Link
                            key={route.id}
                            href={routesShow.url({ route: route.id })}
                            className="flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-4 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md transition-all group"
                        >
                            {/* Icon */}
                            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-xl flex-shrink-0">
                                <RouteIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 dark:text-white">{route.name}</div>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />{route.stops.length} stop{route.stops.length !== 1 ? 's' : ''}
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Bus className="h-3 w-3" />{route.buses_count} bus{route.buses_count !== 1 ? 'es' : ''}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={e => {
                                        e.preventDefault();
                                        if (confirm('Delete this route and all its stops?')) {
                                            router.delete(routesDestroy.url({ route: route.id }));
                                        }
                                    }}
                                    className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                                    title="Delete route"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Add Route */}
                <Card className="dark:bg-gray-900 border-gray-100 dark:border-gray-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Plus className="h-4 w-4 text-emerald-500" />
                            Add New Route
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="flex gap-3 max-w-md">
                            <div className="flex-1">
                                <Label htmlFor="route-name" className="sr-only">Route Name</Label>
                                <Input
                                    id="route-name"
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
