import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, useMapEvents } from 'react-leaflet';
import { Marker } from 'react-leaflet';
import { Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowDown, ArrowLeft, ArrowUp, Check, Clock, MapPin, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store as stopsStore, destroy as stopsDestroy, update as stopsUpdate } from '@/routes/admin/stops';
import { index as routesIndex } from '@/routes/admin/routes';

// ── Numbered marker factory ────────────────────────────────────────────────
function makeIcon(index: number, color = '#4f46e5') {
    return L.divIcon({
        className: '',
        html: `<div style="
            width:32px;height:32px;border-radius:50%;
            background:${color};border:3px solid white;
            display:flex;align-items:center;justify-content:center;
            color:white;font-weight:800;font-size:13px;
            box-shadow:0 4px 12px rgba(0,0,0,0.3);
            cursor:grab;font-family:system-ui;
        ">${index}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
}

function makePendingIcon() {
    return L.divIcon({
        className: '',
        html: `<div style="
            width:32px;height:32px;border-radius:50%;
            background:#f59e0b;border:3px solid white;
            display:flex;align-items:center;justify-content:center;
            color:white;font-weight:800;font-size:16px;
            box-shadow:0 4px 16px rgba(245,158,11,0.5);
            font-family:system-ui;
        ">+</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
}

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

// ── Map click handler component ────────────────────────────────────────────
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// ── Inline editable stop row ───────────────────────────────────────────────
function StopRow({
    stop,
    index,
    total,
    onDelete,
    onMoveUp,
    onMoveDown,
    onUpdate,
    isFirst,
}: {
    stop: Stop;
    index: number;
    total: number;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onUpdate: (fields: Partial<{ name: string; minutes_from_previous: number }>) => void;
    isFirst: boolean;
}) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(stop.name);
    const [mins, setMins] = useState(stop.minutes_from_previous);

    useEffect(() => { setName(stop.name); setMins(stop.minutes_from_previous); }, [stop]);

    const save = () => {
        onUpdate({ name, minutes_from_previous: mins });
        setEditing(false);
    };

    return (
        <div className="flex items-start gap-3 py-3 group">
            {/* Number badge */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold mt-0.5 shadow">
                {index + 1}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {!editing ? (
                    <div>
                        <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{stop.name}</div>
                        {!isFirst && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                <Clock className="h-3 w-3" />+{stop.minutes_from_previous} min
                            </div>
                        )}
                        <div className="text-[11px] text-gray-400 mt-0.5">
                            {stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="h-8 text-sm"
                            placeholder="Stop name"
                            autoFocus
                        />
                        {!isFirst && (
                            <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                <Input
                                    type="number"
                                    value={mins}
                                    onChange={e => setMins(Number(e.target.value))}
                                    className="h-8 text-sm w-24"
                                    min={0}
                                />
                                <span className="text-xs text-gray-400">min from prev</span>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Button size="sm" onClick={save} className="h-7 bg-indigo-600 hover:bg-indigo-700 gap-1 text-xs px-2">
                                <Check className="h-3 w-3" />Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-7 text-xs px-2">
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            {!editing && (
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={onMoveUp} disabled={index === 0}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-20 transition-colors" title="Move up">
                        <ArrowUp className="h-3.5 w-3.5 text-gray-500" />
                    </button>
                    <button onClick={onMoveDown} disabled={index === total - 1}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-20 transition-colors" title="Move down">
                        <ArrowDown className="h-3.5 w-3.5 text-gray-500" />
                    </button>
                    <button onClick={() => setEditing(true)}
                        className="p-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors" title="Edit">
                        <Pencil className="h-3.5 w-3.5 text-indigo-500" />
                    </button>
                    <button onClick={onDelete}
                        className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function AdminRouteShow({ route }: PageProps<{ route: RouteType }>) {
    const [stops, setStops] = useState<Stop[]>(
        [...route.stops].sort((a, b) => a.order_index - b.order_index),
    );

    // Pending click: waiting for user to fill in name/minutes before saving
    const [pending, setPending] = useState<{ lat: number; lng: number } | null>(null);
    const [pendingName, setPendingName] = useState('');
    const [pendingMins, setPendingMins] = useState(0);
    const [saving, setSaving] = useState(false);

    // Map default centre: first stop or Dhaka
    const center = useMemo<[number, number]>(() => {
        if (stops.length > 0) return [stops[0].latitude, stops[0].longitude];
        return [23.8103, 90.4125];
    }, []);

    // ── Map click → set pending pin ────────────────────────────────────────
    const handleMapClick = useCallback((lat: number, lng: number) => {
        setPending({ lat, lng });
        setPendingName('');
        setPendingMins(0);
    }, []);

    // ── Add stop ────────────────────────────────────────────────────────────
    const addStop = () => {
        if (!pending || !pendingName.trim()) return;
        setSaving(true);
        router.post(
            stopsStore.url(),
            {
                bus_route_id: route.id,
                name: pendingName.trim(),
                latitude: pending.lat,
                longitude: pending.lng,
                order_index: stops.length + 1,
                minutes_from_previous: pendingMins,
            },
            {
                onSuccess: () => {
                    setPending(null);
                    setPendingName('');
                    setPendingMins(0);
                },
                onFinish: () => setSaving(false),
                preserveScroll: true,
            },
        );
    };

    // ── Marker drag end → update lat/lng ────────────────────────────────────
    const handleDragEnd = (stop: Stop, lat: number, lng: number) => {
        router.put(
            stopsUpdate.url({ stop: stop.id }),
            { latitude: lat, longitude: lng },
            { preserveScroll: true },
        );
    };

    // ── Delete stop ─────────────────────────────────────────────────────────
    const deleteStop = (stop: Stop) => {
        if (!confirm(`Delete stop "${stop.name}"?`)) return;
        router.delete(stopsDestroy.url({ stop: stop.id }), { preserveScroll: true });
    };

    // ── Update stop name/minutes ────────────────────────────────────────────
    const updateStop = (stop: Stop, fields: Partial<{ name: string; minutes_from_previous: number }>) => {
        router.put(stopsUpdate.url({ stop: stop.id }), fields, { preserveScroll: true });
    };

    // ── Reorder (swap order_index) ───────────────────────────────────────────
    const moveStop = (idx: number, dir: 'up' | 'down') => {
        const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= stops.length) return;

        const a = stops[idx];
        const b = stops[swapIdx];

        // Optimistic local update
        const next = [...stops];
        next[idx] = { ...b, order_index: a.order_index };
        next[swapIdx] = { ...a, order_index: b.order_index };
        setStops(next.sort((x, y) => x.order_index - y.order_index));

        // Persist both
        router.put(stopsUpdate.url({ stop: a.id }), { order_index: b.order_index }, { preserveScroll: true });
        router.put(stopsUpdate.url({ stop: b.id }), { order_index: a.order_index }, { preserveScroll: true });
    };

    // Sync stops when Inertia reloads props
    useEffect(() => {
        setStops([...route.stops].sort((a, b) => a.order_index - b.order_index));
    }, [route.stops]);

    const polyline = stops.map(s => [s.latitude, s.longitude] as [number, number]);

    return (
        <>
            <Head title={`Edit Route — ${route.name}`} />

            {/* ── Top bar ───────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
                <div className="flex items-center gap-3">
                    <Link href={routesIndex.url()} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-base font-bold text-gray-900 dark:text-white">{route.name}</h1>
                        <p className="text-xs text-gray-400">{stops.length} stop{stops.length !== 1 ? 's' : ''} · Click map to add</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg">
                    <MapPin className="h-3.5 w-3.5" />
                    Click map to place · Drag to reposition
                </div>
            </div>

            {/* ── Main split ────────────────────────────────────────────── */}
            <div className="flex h-[calc(100vh-112px)] overflow-hidden">

                {/* ── MAP (left, 60%) ─────────────────────────────────── */}
                <div className="flex-1 relative">
                    <MapContainer
                        center={center}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        className="z-0"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <MapClickHandler onMapClick={handleMapClick} />

                        {/* Route polyline */}
                        {polyline.length > 1 && (
                            <Polyline
                                positions={polyline}
                                pathOptions={{ color: '#4f46e5', weight: 4, opacity: 0.7, dashArray: '8,4' }}
                            />
                        )}

                        {/* Existing stop markers */}
                        {stops.map((stop, idx) => (
                            <Marker
                                key={stop.id}
                                position={[stop.latitude, stop.longitude]}
                                icon={makeIcon(idx + 1)}
                                draggable={true}
                                eventHandlers={{
                                    dragend(e) {
                                        const latlng = (e.target as L.Marker).getLatLng();
                                        handleDragEnd(stop, latlng.lat, latlng.lng);
                                    },
                                }}
                            >
                                <Popup>
                                    <div className="text-sm font-semibold text-indigo-700 mb-0.5">Stop {idx + 1}</div>
                                    <div className="font-medium">{stop.name}</div>
                                    {idx > 0 && (
                                        <div className="text-xs text-gray-500 mt-1">+{stop.minutes_from_previous} min from prev</div>
                                    )}
                                    <div className="text-[11px] text-gray-400 mt-0.5">
                                        {stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        {/* Pending (unconfirmed) marker */}
                        {pending && (
                            <Marker
                                position={[pending.lat, pending.lng]}
                                icon={makePendingIcon()}
                            />
                        )}
                    </MapContainer>

                    {/* ── Pending stop form overlay ──────────────────── */}
                    {pending && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-[340px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-amber-200 dark:border-amber-800 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-bold">
                                        {stops.length + 1}
                                    </div>
                                    <span className="font-semibold text-sm text-gray-900 dark:text-white">New Stop</span>
                                </div>
                                <button onClick={() => setPending(null)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="text-[11px] text-gray-400 mb-3">
                                📍 {pending.lat.toFixed(5)}, {pending.lng.toFixed(5)}
                            </div>

                            <div className="space-y-2">
                                <div>
                                    <Label className="text-xs">Stop Name</Label>
                                    <Input
                                        value={pendingName}
                                        onChange={e => setPendingName(e.target.value)}
                                        placeholder="e.g. Uttara Sector 10"
                                        className="mt-1 h-9 text-sm"
                                        autoFocus
                                        onKeyDown={e => { if (e.key === 'Enter') addStop(); if (e.key === 'Escape') setPending(null); }}
                                    />
                                </div>
                                {stops.length > 0 && (
                                    <div>
                                        <Label className="text-xs">Minutes from previous stop</Label>
                                        <Input
                                            type="number"
                                            value={pendingMins}
                                            onChange={e => setPendingMins(Number(e.target.value))}
                                            min={0}
                                            className="mt-1 h-9 text-sm w-32"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 mt-3">
                                <Button
                                    onClick={addStop}
                                    disabled={!pendingName.trim() || saving}
                                    className="flex-1 h-9 bg-indigo-600 hover:bg-indigo-700 text-sm gap-1.5"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    {saving ? 'Adding…' : 'Add Stop'}
                                </Button>
                                <Button variant="outline" onClick={() => setPending(null)} className="h-9 text-sm px-3">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── STOP LIST (right, 40%) ───────────────────────── */}
                <div className="w-80 xl:w-96 flex flex-col border-l border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden flex-shrink-0">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-indigo-500" />
                            Stop Order
                        </h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">Hover a stop to edit, reorder, or delete</p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4">
                        {stops.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12 text-gray-400">
                                <MapPin className="h-10 w-10 mb-3 opacity-30" />
                                <p className="text-sm font-medium">No stops yet</p>
                                <p className="text-xs mt-1">Click anywhere on the map to add the first stop</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
                                {stops.map((stop, idx) => (
                                    <StopRow
                                        key={stop.id}
                                        stop={stop}
                                        index={idx}
                                        total={stops.length}
                                        isFirst={idx === 0}
                                        onDelete={() => deleteStop(stop)}
                                        onMoveUp={() => moveStop(idx, 'up')}
                                        onMoveDown={() => moveStop(idx, 'down')}
                                        onUpdate={fields => updateStop(stop, fields)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer summary */}
                    {stops.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{stops.length} stops total</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {stops.slice(1).reduce((s, stop) => s + stop.minutes_from_previous, 0)} min route
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
