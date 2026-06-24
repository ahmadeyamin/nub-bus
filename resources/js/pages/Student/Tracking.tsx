import { Head, Link, usePage, usePoll } from '@inertiajs/react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { login, register, dashboard, home } from '@/routes';

// ── Lucide Icons (inlined as SVGs for reliability) ───────────────────────────

function IconArrowLeft() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
        </svg>
    );
}

function IconRefresh() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin-slow">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
        </svg>
    );
}

function IconBus() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 6v6" />
            <path d="M15 6v6" />
            <path d="M2 12h19.6" />
            <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
            <circle cx="7" cy="18" r="2" />
            <path d="M9 18h5" />
            <circle cx="16" cy="18" r="2" />
        </svg>
    );
}

function IconMapPin() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    );
}

function IconClock() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

function IconCheck() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}

function IconCompass() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
    );
}

function IconUser() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function IconPhone() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
    );
}

function IconInfo() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </svg>
    );
}

// ── Types ────────────────────────────────────────────────────────────────────

interface Stop {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    order_index: number;
    minutes_from_previous: number;
}

interface RouteType {
    id: number;
    name: string;
    stops: Stop[];
}

interface DriverType {
    id: number;
    name: string;
    phone?: string;
}

interface BusType {
    id: number;
    name: string;
    bus_route_id: number;
    current_stop_id: number;
    status: 'running' | 'reached_stop';
    is_active: boolean;
    trip_status: 'on_trip' | 'idle';
    trip_started_at: string | null;
    trips_completed: number;
    stops_reached_this_trip: number;
    current_stop?: Stop;
    driver?: DriverType;
    bus_route?: RouteType;
}

interface TrackingProps {
    routes: RouteType[];
    buses: BusType[];
}

// ── Leaflet Default Icons Fix ────────────────────────────────────────────────

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ── Custom Leaflet Icons ─────────────────────────────────────────────────────

const createStopIcon = (num: number, isCurrent: boolean) => {
    const bg = isCurrent ? '#2d6a2d' : '#4b5563';
    return L.divIcon({
        className: '',
        html: `<div style="
            width:24px;height:24px;border-radius:50%;
            background:${bg};border:2px solid white;
            display:flex;align-items:center;justify-content:center;
            color:white;font-weight:800;font-size:10px;
            box-shadow:0 2px 6px rgba(0,0,0,0.2);
            font-family:'Inter', sans-serif;
        ">${num}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

const createBusIcon = (status: 'running' | 'reached_stop') => {
    const color = status === 'reached_stop' ? '#f59e0b' : '#2d6a2d';
    const animationName = status === 'reached_stop' ? 'pulse-ring-amber' : 'pulse-ring';
    return L.divIcon({
        className: '',
        html: `<div style="
            width:36px;height:36px;border-radius:50%;
            background:${color};border:3px solid white;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 4px 12px rgba(0,0,0,0.3);
            animation: ${animationName} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        ">
            <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M8 6v6'/><path d='M15 6v6'/><path d='M2 12h19.6'/><path d='M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3'/><circle cx='7' cy='18' r='2'/><path d='M9 18h5'/><circle cx='16' cy='18' r='2'/></svg>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
    });
};

// ── Main Component ───────────────────────────────────────────────────────────

export default function Tracking({ routes = [], buses = [] }: TrackingProps) {
    const { auth } = usePage().props;

    // Auto-poll the server for bus location updates every 5 seconds
    usePoll(5000, {
        only: ['buses'],
    });

    const [selectedRouteId, setSelectedRouteId] = useState<number>(
        routes.length > 0 ? routes[0].id : 0
    );

    const [searchQuery, setSearchQuery] = useState('');

    const selectedRoute = useMemo(() => {
        return routes.find(r => r.id === selectedRouteId);
    }, [routes, selectedRouteId]);

    const activeBusesForSelectedRoute = useMemo(() => {
        return buses.filter(b => b.bus_route_id === selectedRouteId && b.is_active);
    }, [buses, selectedRouteId]);

    const filteredRoutes = useMemo(() => {
        return routes.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [routes, searchQuery]);

    const mapCenter = useMemo((): [number, number] => {
        if (selectedRoute && selectedRoute.stops.length > 0) {
            // Center map on the bus if active, otherwise the first stop
            const runningBus = activeBusesForSelectedRoute.find(b => b.trip_status === 'on_trip');
            if (runningBus && runningBus.current_stop) {
                return [runningBus.current_stop.latitude, runningBus.current_stop.longitude];
            }
            return [selectedRoute.stops[0].latitude, selectedRoute.stops[0].longitude];
        }
        return [23.8103, 90.4125]; // Dhaka default
    }, [selectedRoute, activeBusesForSelectedRoute]);

    // Calculate ETA minutes from the current bus location to a specific stop
    const calculateETA = (stop: Stop, bus: BusType) => {
        if (!selectedRoute) return 'N/A';
        const currentIdx = selectedRoute.stops.findIndex(s => s.id === bus.current_stop_id);
        const targetIdx = selectedRoute.stops.findIndex(s => s.id === stop.id);

        if (currentIdx === -1 || targetIdx === -1) return '—';
        if (targetIdx < currentIdx) return 'Passed';
        if (targetIdx === currentIdx) {
            return bus.status === 'reached_stop' ? 'Arrived' : 'Arriving';
        }

        let total = 0;
        for (let i = currentIdx + 1; i <= targetIdx; i++) {
            total += selectedRoute.stops[i].minutes_from_previous;
        }
        return `${total}m`;
    };

    return (
        <>
            <Head title="NUB Transit – Live Campus Bus Tracking Map" />

            {/* Animation CSS injection */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes pulse-ring {
                        0% { box-shadow: 0 0 0 0 rgba(45, 106, 45, 0.6); }
                        70% { box-shadow: 0 0 0 12px rgba(45, 106, 45, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(45, 106, 45, 0); }
                    }
                    @keyframes pulse-ring-amber {
                        0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.6); }
                        70% { box-shadow: 0 0 0 12px rgba(245, 158, 11, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
                    }
                    .leaflet-container {
                        font-family: 'Inter', system-ui, sans-serif !important;
                    }
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #d1d5db;
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #9ca3af;
                    }
                `
            }} />

            <div style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                background: '#f8f7f3',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                color: '#1a1a1a'
            }}>

                {/* ── Sticky Header ── */}
                <header style={{
                    background: '#fff',
                    borderBottom: '1px solid #e8e8e4',
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                    flexShrink: 0,
                    zIndex: 10,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Link
                            href={home.url()}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                background: '#f3f4f6',
                                padding: '6px 12px',
                                borderRadius: 8,
                                color: '#4b5563',
                                textDecoration: 'none',
                                fontSize: 13,
                                fontWeight: 600,
                                border: '1px solid #e5e7eb',
                            }}
                        >
                            <IconArrowLeft />
                            Back to Home
                        </Link>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                background: '#2d6a2d',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: 13,
                            }}>N</div>
                            <span style={{ fontWeight: 700, fontSize: 15 }}>NUB Transit Live Tracking</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {/* Auto update status indicator */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#4b5563', background: '#f0f4ef', padding: '6px 12px', borderRadius: 8, border: '1px solid #d4e8d4' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2d6a2d', display: 'inline-block' }} />
                            <span>Auto-refresh Active</span>
                            <span style={{ color: '#2d6a2d', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <IconRefresh />
                            </span>
                        </div>

                        {auth?.user ? (
                            <Link
                                href={dashboard.url()}
                                style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: '#fff',
                                    background: '#2d6a2d',
                                    textDecoration: 'none',
                                    padding: '7px 16px',
                                    borderRadius: 8,
                                }}
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <Link href={login.url()} style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', textDecoration: 'none', padding: '7px 12px' }}>Sign in</Link>
                                <Link href={register.url()} style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: '#2d6a2d', textDecoration: 'none', padding: '7px 14px', borderRadius: 8 }}>Sign up</Link>
                            </div>
                        )}
                    </div>
                </header>

                {/* ── Main Layout Workspace ── */}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                    {/* ── Left Control Sidebar ── */}
                    <aside style={{
                        width: 380,
                        background: '#fff',
                        borderRight: '1px solid #e8e8e4',
                        display: 'flex',
                        flexDirection: 'column',
                        flexShrink: 0,
                    }}>
                        {/* Route Search & Selector */}
                        <div style={{ padding: 18, borderBottom: '1px solid #f3f4f6' }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'block' }}>Select Campus Route</label>
                            
                            <div style={{ position: 'relative', marginBottom: 12 }}>
                                <input
                                    type="text"
                                    placeholder="Search routes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        fontSize: 14,
                                        borderRadius: 8,
                                        border: '1px solid #d1d5db',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {routes.length === 0 ? (
                                <div style={{ fontSize: 13, color: '#888', fontStyle: 'italic' }}>No routes found.</div>
                            ) : (
                                <select
                                    value={selectedRouteId}
                                    onChange={(e) => setSelectedRouteId(Number(e.target.value))}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        borderRadius: 8,
                                        border: '1px solid #d1d5db',
                                        background: '#f9fafb',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {filteredRoutes.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Selected Route Timeline & Stops */}
                        <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '18px 24px' }}>
                            {selectedRoute ? (
                                <>
                                    <div style={{ marginBottom: 20 }}>
                                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1a1a1a' }}>{selectedRoute.name}</h3>
                                        <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 12, color: '#6b7280' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconMapPin /> {selectedRoute.stops.length} Stops</span>
                                            <span>•</span>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                <IconBus /> {activeBusesForSelectedRoute.length} Active Bus{activeBusesForSelectedRoute.length !== 1 ? 'es' : ''}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stops Timeline */}
                                    <div style={{ position: 'relative', paddingLeft: 12 }}>
                                        {/* Vertical Timeline bar line */}
                                        <div style={{
                                            position: 'absolute',
                                            left: 20,
                                            top: 10,
                                            bottom: 10,
                                            width: 3,
                                            background: '#e5e7eb',
                                            zIndex: 1,
                                        }} />

                                        {selectedRoute.stops.map((stop, idx) => {
                                            const activeBus = activeBusesForSelectedRoute[0]; // Check first active bus
                                            const isCurrent = activeBus && activeBus.current_stop_id === stop.id;
                                            
                                            // Determine stop state: Passed vs Current vs Upcoming
                                            let stopState: 'passed' | 'current' | 'upcoming' = 'upcoming';
                                            let eta = '';

                                            if (activeBus) {
                                                const busStopIdx = selectedRoute.stops.findIndex(s => s.id === activeBus.current_stop_id);
                                                if (idx < busStopIdx) {
                                                    stopState = 'passed';
                                                } else if (idx === busStopIdx) {
                                                    stopState = 'current';
                                                }
                                                eta = calculateETA(stop, activeBus);
                                            }

                                            return (
                                                <div key={stop.id} style={{
                                                    display: 'flex',
                                                    gap: 16,
                                                    marginBottom: 20,
                                                    position: 'relative',
                                                    zIndex: 2,
                                                }}>
                                                    {/* Timeline node icon indicator */}
                                                    <div style={{
                                                        width: 20,
                                                        height: 20,
                                                        borderRadius: '50%',
                                                        background: stopState === 'passed' ? '#e5e7eb' : stopState === 'current' ? '#2d6a2d' : '#fff',
                                                        border: stopState === 'current' ? '2px solid #fff' : stopState === 'passed' ? 'none' : '2px solid #9ca3af',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: stopState === 'current' ? '0 0 0 4px rgba(45, 106, 45, 0.25)' : 'none',
                                                        color: stopState === 'passed' ? '#6b7280' : '#fff',
                                                        flexShrink: 0,
                                                        marginTop: 2,
                                                    }}>
                                                        {stopState === 'passed' ? <IconCheck /> : null}
                                                        {stopState === 'current' ? <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} /> : null}
                                                    </div>

                                                    {/* Stop details */}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{
                                                            fontSize: 14,
                                                            fontWeight: stopState === 'current' ? 700 : 500,
                                                            color: stopState === 'passed' ? '#9ca3af' : '#1a1a1a',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}>
                                                            {stop.name}
                                                        </div>

                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 2 }}>
                                                            {idx > 0 && (
                                                                <span style={{ fontSize: 11, color: '#9ca3af', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                                    <IconClock /> +{stop.minutes_from_previous}m
                                                                </span>
                                                            )}
                                                            {eta && (
                                                                <span style={{
                                                                    fontSize: 11,
                                                                    fontWeight: 600,
                                                                    color: eta === 'Arrived' || eta === 'Arriving' ? '#2d6a2d' : eta === 'Passed' ? '#9ca3af' : '#4f46e5',
                                                                    background: eta === 'Arrived' || eta === 'Arriving' ? '#e6f4e6' : eta === 'Passed' ? '#f3f4f6' : '#eef2ff',
                                                                    padding: '2px 6px',
                                                                    borderRadius: 6,
                                                                }}>{eta}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
                                    <IconInfo />
                                    <p style={{ marginTop: 8, fontSize: 14 }}>Please select a route to see stop timetables.</p>
                                </div>
                            )}
                        </div>

                        {/* Driver & Trip Info Card */}
                        {selectedRoute && activeBusesForSelectedRoute.length > 0 && (
                            <div style={{
                                padding: 18,
                                borderTop: '1px solid #e8e8e4',
                                background: '#f9fafb',
                            }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 10 }}>Driver Info & Occupancy</div>
                                
                                {activeBusesForSelectedRoute.map(bus => (
                                    <div key={bus.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            {/* Avatar mock */}
                                            <div style={{
                                                width: 42,
                                                height: 42,
                                                borderRadius: '50%',
                                                background: '#e5e7eb',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#4b5563',
                                                flexShrink: 0
                                            }}>
                                                <IconUser />
                                            </div>

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{bus.driver?.name || 'Assigned Driver'}</div>
                                                <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <IconCompass /> {bus.name}
                                                </div>
                                            </div>

                                            {bus.driver?.phone && (
                                                <a
                                                    href={`tel:${bus.driver.phone}`}
                                                    style={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: '50%',
                                                        background: '#fff',
                                                        border: '1px solid #e5e7eb',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#2d6a2d',
                                                        textDecoration: 'none',
                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                                    }}
                                                    title="Call Driver"
                                                >
                                                    <IconPhone />
                                                </a>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', gap: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>OCCUPANCY</div>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: '#2d6a2d', marginTop: 1 }}>Seat Avail. (High)</div>
                                            </div>
                                            <div style={{ width: 1, background: '#e5e7eb' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>SPEED</div>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginTop: 1 }}>
                                                    {bus.status === 'running' ? '28 km/h' : '0 km/h'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </aside>

                    {/* ── Main Content Area ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                        {/* ── Leaflet Interactive Map ── */}
                        <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                        {selectedRoute && selectedRoute.stops.length > 0 ? (
                            <MapContainer
                                center={mapCenter}
                                zoom={14}
                                style={{ height: '100%', width: '100%', zIndex: 1 }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                {/* Render Polyline Route Line */}
                                <Polyline
                                    positions={selectedRoute.stops.map(s => [s.latitude, s.longitude])}
                                    pathOptions={{
                                        color: '#2d6a2d',
                                        weight: 5,
                                        opacity: 0.85,
                                        dashArray: '1, 8',
                                        lineCap: 'round',
                                    }}
                                />

                                {/* Render Stop Markers */}
                                {selectedRoute.stops.map((stop, idx) => {
                                    const isBusCurrentStop = activeBusesForSelectedRoute.some(b => b.current_stop_id === stop.id);
                                    return (
                                        <Marker
                                            key={stop.id}
                                            position={[stop.latitude, stop.longitude]}
                                            icon={createStopIcon(idx + 1, isBusCurrentStop)}
                                        >
                                            <Popup>
                                                <div style={{ fontFamily: "'Inter', sans-serif" }}>
                                                    <div style={{ fontWeight: 700, fontSize: 13, color: '#2d6a2d' }}>Stop {idx + 1}</div>
                                                    <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', marginTop: 2 }}>{stop.name}</div>
                                                    {idx > 0 && (
                                                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <IconClock /> {stop.minutes_from_previous} mins from previous stop
                                                        </div>
                                                    )}
                                                </div>
                                            </Popup>
                                        </Marker>
                                    );
                                })}

                                {/* Render Running Buses */}
                                {activeBusesForSelectedRoute.map(bus => {
                                    if (!bus.current_stop) return null;
                                    return (
                                        <Marker
                                            key={bus.id}
                                            position={[bus.current_stop.latitude, bus.current_stop.longitude]}
                                            icon={createBusIcon(bus.status)}
                                        >
                                            <Popup minWidth={200}>
                                                <div style={{ fontFamily: "'Inter', sans-serif" }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <span style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>{bus.name}</span>
                                                        <span style={{
                                                            fontSize: 10,
                                                            fontWeight: 700,
                                                            color: bus.status === 'reached_stop' ? '#92400e' : '#065f46',
                                                            background: bus.status === 'reached_stop' ? '#fef3c7' : '#d1fae5',
                                                            padding: '2px 6px',
                                                            borderRadius: 999,
                                                        }}>
                                                            {bus.status === 'reached_stop' ? 'AT STOP' : 'IN TRANSIT'}
                                                        </span>
                                                    </div>

                                                    <div style={{ borderTop: '1px solid #f3f4f6', marginTop: 8, paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                                                            <strong>Current Station:</strong> {bus.current_stop.name}
                                                        </div>
                                                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                                                            <strong>Driver:</strong> {bus.driver?.name || 'N/A'}
                                                        </div>
                                                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                                                            <strong>Trips Completed Today:</strong> {bus.trips_completed}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    );
                                })}
                            </MapContainer>
                        ) : (
                            <div style={{
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#f3f4f6',
                                color: '#9ca3af',
                                flexDirection: 'column',
                                gap: 12,
                            }}>
                                <IconCompass />
                                <span style={{ fontSize: 15, fontWeight: 500 }}>Select a route to display map & locations</span>
                            </div>
                        )}
                    </main>

                {/* ── Active Running Trips Summary Grid Footer ── */}
                <div style={{
                    background: '#fff',
                    borderTop: '1px solid #e8e8e4',
                    padding: '16px 24px',
                    height: 150,
                    boxSizing: 'border-box',
                    flexShrink: 0,
                }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Running Trips Active Status</div>
                    
                    <div className="custom-scrollbar" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 4 }}>
                        {buses.filter(b => b.is_active && b.trip_status === 'on_trip').length === 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b7280', padding: '6px 0' }}>
                                <IconInfo />
                                <span>No active trips running right now. Drivers will start trips during campus operating hours.</span>
                            </div>
                        ) : (
                            buses.filter(b => b.is_active && b.trip_status === 'on_trip').map(bus => {
                                const routeName = bus.bus_route?.name || 'Direct Campus Route';
                                const stopsPassed = bus.stops_reached_this_trip;
                                const totalStopsCount = bus.bus_route?.stops?.length || 0;
                                const progressPct = totalStopsCount > 0 ? (stopsPassed / totalStopsCount) * 100 : 0;

                                return (
                                    <div key={bus.id} style={{
                                        minWidth: 280,
                                        background: '#f9fafb',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 8,
                                        padding: '10px 14px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 6
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{bus.name}</span>
                                            <span style={{
                                                fontSize: 10,
                                                fontWeight: 700,
                                                color: '#2d6a2d',
                                                background: '#e6f4e6',
                                                padding: '1px 6px',
                                                borderRadius: 4
                                            }}>ON TRIP</span>
                                        </div>
                                        
                                        <div style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {routeName}
                                        </div>

                                        {/* Progress bar */}
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>
                                                <span>Stop {stopsPassed} of {totalStopsCount}</span>
                                                <span>{Math.round(progressPct)}% Completed</span>
                                            </div>
                                            <div style={{ height: 4, background: '#e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${progressPct}%`, background: '#2d6a2d', borderRadius: 2 }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
