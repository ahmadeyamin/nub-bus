import { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useMemo } from 'react';
import L from 'leaflet';
import { Bus, Clock, MapPin, Navigation } from 'lucide-react';
import { dashboard } from '@/routes';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const busIcon = L.divIcon({
    className: '',
    html: `<div style="
        width:36px;height:36px;border-radius:50%;
        background:#4f46e5;border:3px solid white;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 4px 12px rgba(79,70,229,0.5);
    ">
        <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M8 6v6'/><path d='M15 6v6'/><path d='M2 12h19.6'/><path d='M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3'/><circle cx='7' cy='18' r='2'/><path d='M9 18h5'/><circle cx='16' cy='18' r='2'/></svg>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

interface Stop {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
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
    bus_route_id: number;
    current_stop_id: number;
    status: string;
    is_active: boolean;
    current_stop: Stop;
}

export default function StudentDashboard({ routes, buses }: PageProps<{ routes: Route[]; buses: BusType[] }>) {
    const { auth } = usePage<PageProps>().props;
    const [selectedRouteId, setSelectedRouteId] = useState<number>(routes.length > 0 ? routes[0].id : 0);

    const selectedRoute = useMemo(() => routes.find(r => r.id === selectedRouteId), [routes, selectedRouteId]);
    const activeBuses = useMemo(
        () => buses.filter(b => b.bus_route_id === selectedRouteId && b.is_active),
        [buses, selectedRouteId],
    );

    const calculateETA = (stop: Stop, bus: BusType) => {
        if (!selectedRoute) return 'N/A';
        const currentIdx = selectedRoute.stops.findIndex(s => s.id === bus.current_stop_id);
        const targetIdx = selectedRoute.stops.findIndex(s => s.id === stop.id);
        if (currentIdx === -1 || targetIdx === -1) return '—';
        if (targetIdx < currentIdx) return 'Passed';
        if (targetIdx === currentIdx) return bus.status === 'reached_stop' ? 'Here now' : 'Arriving';
        let total = 0;
        for (let i = currentIdx + 1; i <= targetIdx; i++) {
            total += selectedRoute.stops[i].minutes_from_previous;
        }
        return `~${total} min`;
    };

    const mapCenter = selectedRoute && selectedRoute.stops.length > 0
        ? [selectedRoute.stops[0].latitude, selectedRoute.stops[0].longitude] as [number, number]
        : [23.8103, 90.4125] as [number, number];

    return (
        <>
            <Head title="NUB Live Bus Tracking" />

            {/* ── Hero header ── */}
            <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)' }} className="px-6 py-8 text-white">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-white/20 p-1.5 rounded-lg">
                                <Bus className="h-5 w-5" />
                            </div>
                            <span className="text-white/70 text-sm font-medium uppercase tracking-widest">NUB University</span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Live Bus Tracker</h1>
                        <p className="text-indigo-200 mt-1 text-sm">Real-time university bus locations &amp; ETAs</p>
                    </div>
                    {auth?.user && (
                        <Link href={dashboard.url()} className="text-white/70 text-sm hover:text-white transition-colors border border-white/20 px-3 py-1.5 rounded-lg hover:bg-white/10">
                            Dashboard →
                        </Link>
                    )}
                </div>

                {/* Route selector tabs */}
                <div className="max-w-6xl mx-auto mt-6 flex gap-2 overflow-x-auto pb-1">
                    {routes.map(r => (
                        <button
                            key={r.id}
                            onClick={() => setSelectedRouteId(r.id)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                r.id === selectedRouteId
                                    ? 'bg-white text-indigo-700 shadow-lg'
                                    : 'bg-white/15 text-white/80 hover:bg-white/25'
                            }`}
                        >
                            {r.name}
                        </button>
                    ))}
                    {routes.length === 0 && (
                        <span className="text-white/50 text-sm italic">No routes configured yet.</span>
                    )}
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map – 2/3 */}
                <div className="lg:col-span-2">
                    <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700" style={{ height: 480 }}>
                        {selectedRoute && selectedRoute.stops.length > 0 ? (
                            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                {/* Route line */}
                                <Polyline
                                    positions={selectedRoute.stops.map(s => [s.latitude, s.longitude])}
                                    pathOptions={{ color: '#4f46e5', weight: 4, opacity: 0.7, dashArray: '8,4' }}
                                />

                                {/* Stop markers */}
                                {selectedRoute.stops.map((stop, idx) => (
                                    <CircleMarker
                                        key={stop.id}
                                        center={[stop.latitude, stop.longitude]}
                                        radius={10}
                                        pathOptions={{ color: '#4f46e5', fillColor: '#fff', fillOpacity: 1, weight: 3 }}
                                    >
                                        <Popup>
                                            <div className="font-semibold text-indigo-700">Stop {idx + 1}</div>
                                            <div>{stop.name}</div>
                                        </Popup>
                                    </CircleMarker>
                                ))}

                                {/* Bus markers */}
                                {activeBuses.map(bus => {
                                    const busStop = bus.current_stop;
                                    if (!busStop) return null;
                                    return (
                                        <Marker key={bus.id} position={[busStop.latitude, busStop.longitude]} icon={busIcon}>
                                            <Popup>
                                                <div className="font-bold text-indigo-700">{bus.name}</div>
                                                <div className="text-sm mt-1">
                                                    {bus.status === 'running' ? '🚌 In transit' : '🟢 At stop'}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">{busStop.name}</div>
                                            </Popup>
                                        </Marker>
                                    );
                                })}
                            </MapContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900 text-gray-400">
                                <div className="text-center">
                                    <MapPin className="mx-auto h-10 w-10 mb-3 opacity-40" />
                                    <p>No stops on this route yet.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Active buses */}
                    {activeBuses.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {activeBuses.map(bus => (
                                <div key={bus.id} className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl px-4 py-3">
                                    <div className="bg-indigo-600 p-2 rounded-lg">
                                        <Bus className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm text-gray-900 dark:text-white">{bus.name}</div>
                                        <div className={`text-xs font-medium ${bus.status === 'running' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {bus.status === 'running' ? '● In Transit' : '● At Stop'} — {bus.current_stop?.name}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stops & ETA sidebar – 1/3 */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Navigation className="h-4 w-4" /> Stops &amp; ETAs
                    </h2>

                    {activeBuses.length === 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-300">
                            No active buses on this route right now.
                        </div>
                    )}

                    {selectedRoute && selectedRoute.stops.map((stop, idx) => {
                        const eta = activeBuses.length > 0 ? calculateETA(stop, activeBuses[0]) : null;
                        const isCurrent = activeBuses.some(b => b.current_stop_id === stop.id);

                        return (
                            <div
                                key={stop.id}
                                className={`relative flex items-start gap-3 rounded-xl px-4 py-3 border transition-all ${
                                    isCurrent
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700 shadow-sm'
                                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                                }`}
                            >
                                {/* Stop number circle */}
                                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                                    isCurrent ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                }`}>
                                    {idx + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className={`font-medium text-sm truncate ${isCurrent ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>
                                        {stop.name}
                                    </div>
                                    {idx > 0 && (
                                        <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />+{stop.minutes_from_previous} min from prev
                                        </div>
                                    )}
                                </div>

                                {eta && (
                                    <div className={`flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-lg ${
                                        eta === 'Here now' || eta === 'Arriving'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : eta === 'Passed'
                                            ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                                    }`}>
                                        {eta}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
